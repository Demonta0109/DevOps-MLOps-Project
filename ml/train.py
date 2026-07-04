import argparse
import os
import subprocess

import mlflow
import mlflow.sklearn
import yaml
from mlflow import MlflowClient
from dotenv import load_dotenv
from prepare import prepare as prepare_data
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERIC_FEATURES = ["surface_reelle_bati", "nombre_pieces_principales", "latitude", "longitude"]
CATEGORICAL_FEATURES = ["code_postal"]
TARGET = "valeur_fonciere"
EXPERIMENT_NAME = "dvf-paris-price"
REGISTERED_MODEL_NAME = "dvf-paris-price"


def configure_mlflow_auth() -> None:
    if os.getenv("DAGSHUB_USERNAME") and os.getenv("DAGSHUB_TOKEN"):
        os.environ.setdefault("MLFLOW_TRACKING_USERNAME", os.environ["DAGSHUB_USERNAME"])
        os.environ.setdefault("MLFLOW_TRACKING_PASSWORD", os.environ["DAGSHUB_TOKEN"])


def get_git_commit() -> str:
    return subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip()


def get_dvc_data_version(dvc_file: str) -> str:
    with open(dvc_file) as f:
        spec = yaml.safe_load(f)
    return spec["outs"][0]["md5"]


def build_pipeline(n_estimators: int, max_depth: int | None, random_state: int) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )
    model = RandomForestRegressor(
        n_estimators=n_estimators, max_depth=max_depth, random_state=random_state, n_jobs=-1
    )
    return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


def train(
    raw_data_path: str,
    processed_data_path: str,
    dvc_file: str,
    n_estimators: int,
    max_depth: int | None,
    random_state: int,
) -> dict:
    load_dotenv()
    configure_mlflow_auth()
    mlflow.set_experiment(EXPERIMENT_NAME)

    df = prepare_data(raw_data_path, processed_data_path)
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)

    pipeline = build_pipeline(n_estimators, max_depth, random_state)
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)

    metrics = {
        "mae": mean_absolute_error(y_test, predictions),
        "rmse": mean_squared_error(y_test, predictions) ** 0.5,
        "r2": r2_score(y_test, predictions),
    }

    with mlflow.start_run():
        mlflow.log_param("n_estimators", n_estimators)
        mlflow.log_param("max_depth", max_depth)
        mlflow.log_param("random_state", random_state)
        mlflow.log_metrics(metrics)
        mlflow.set_tag("git_commit", get_git_commit())
        mlflow.set_tag("dvc_data_version", get_dvc_data_version(dvc_file))
        model_info = mlflow.sklearn.log_model(
            pipeline,
            name="model",
            registered_model_name=REGISTERED_MODEL_NAME,
        )
        MlflowClient().transition_model_version_stage(
            name=REGISTERED_MODEL_NAME,
            version=model_info.registered_model_version,
            stage="Staging",
        )

    print(f"MAE={metrics['mae']:.0f}  RMSE={metrics['rmse']:.0f}  R2={metrics['r2']:.3f}")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw-data", default="data/raw/dvf.csv")
    parser.add_argument("--processed-data", default="data/processed/dvf_paris_clean.csv")
    parser.add_argument("--dvc-file", default="data/raw/dvf.csv.dvc")
    parser.add_argument("--n-estimators", type=int, default=200)
    parser.add_argument("--max-depth", type=int, default=None)
    parser.add_argument("--random-state", type=int, default=42)
    args = parser.parse_args()
    train(
        args.raw_data,
        args.processed_data,
        args.dvc_file,
        args.n_estimators,
        args.max_depth,
        args.random_state,
    )
