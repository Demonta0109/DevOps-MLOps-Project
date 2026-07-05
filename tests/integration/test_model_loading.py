import mlflow.sklearn  # noqa: F401 - forces the real (lazily-loaded) submodule
from mlflow.exceptions import RestException

from app import model as model_module


class _FakeVersion:
    def __init__(self, version):
        self.version = version


class _FakeMlflowClient:
    """Stands in for mlflow.tracking.MlflowClient in app.model.load_model()."""

    def __init__(self, versions=None, error=None):
        self._versions = versions or []
        self._error = error

    def get_latest_versions(self, name, stages):
        if self._error:
            raise self._error
        return self._versions


def test_load_model_from_registry_sets_model_and_version(monkeypatch, fake_model):
    monkeypatch.setattr(
        model_module,
        "MlflowClient",
        lambda: _FakeMlflowClient(versions=[_FakeVersion("7")]),
    )
    monkeypatch.setattr(mlflow.sklearn, "load_model", lambda model_uri: fake_model)

    loaded = model_module.load_model()

    assert loaded is fake_model
    assert model_module.get_model() is fake_model
    assert model_module.get_model_version() == "7"


def test_load_model_handles_registry_not_found(monkeypatch):
    not_found = RestException({"error_code": "RESOURCE_DOES_NOT_EXIST", "message": "no model yet"})
    monkeypatch.setattr(
        model_module,
        "MlflowClient",
        lambda: _FakeMlflowClient(error=not_found),
    )

    loaded = model_module.load_model()

    assert loaded is None
    assert model_module.get_model() is None
    assert model_module.get_model_version() is None
