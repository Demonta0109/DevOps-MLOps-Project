import logging
import os
from typing import Optional

import mlflow.sklearn
from mlflow.exceptions import RestException
from mlflow.tracking import MlflowClient

from .config import settings

logger = logging.getLogger("backend.model")

_model = None
_model_version: Optional[str] = None


def _configure_mlflow() -> None:
    if settings.mlflow_tracking_uri:
        mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
    if settings.mlflow_tracking_username:
        os.environ["MLFLOW_TRACKING_USERNAME"] = settings.mlflow_tracking_username
    if settings.mlflow_tracking_password:
        os.environ["MLFLOW_TRACKING_PASSWORD"] = settings.mlflow_tracking_password


def load_model():
    """Load the model version currently in `settings.model_stage` from the MLflow Registry.

    Failures are caught so the API can still start (and report itself as
    degraded via /health) even if no model has been registered yet.
    """
    global _model, _model_version
    _configure_mlflow()
    try:
        client = MlflowClient()
        versions = client.get_latest_versions(settings.model_name, stages=[settings.model_stage])
    except RestException as exc:
        if exc.error_code == "RESOURCE_DOES_NOT_EXIST":
            logger.warning(
                "Registered model '%s' not found yet in the MLflow registry (stage=%s) "
                "waiting for a training run to register it.",
                settings.model_name,
                settings.model_stage,
            )
        else:
            logger.exception("Failed to query MLflow registry")
        _model, _model_version = None, None
        return _model
    except Exception:
        logger.exception("Failed to load model from MLflow registry")
        _model, _model_version = None, None
        return _model

    if not versions:
        logger.warning(
            "No model version found for %s/%s", settings.model_name, settings.model_stage
        )
        _model, _model_version = None, None
        return _model

    try:
        _model_version = versions[0].version
        model_uri = f"models:/{settings.model_name}/{settings.model_stage}"
        _model = mlflow.sklearn.load_model(model_uri)
        logger.info(
            "Loaded model %s v%s (stage=%s)", settings.model_name, _model_version, settings.model_stage
        )
    except Exception:
        logger.exception("Failed to load model from MLflow registry")
        _model, _model_version = None, None
    return _model


def get_model():
    return _model


def get_model_version() -> Optional[str]:
    return _model_version
