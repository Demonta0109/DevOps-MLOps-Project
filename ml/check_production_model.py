import argparse
import os

from dotenv import load_dotenv
from mlflow import MlflowClient


def configure_mlflow_auth() -> None:
    if os.getenv("DAGSHUB_USERNAME") and os.getenv("DAGSHUB_TOKEN"):
        os.environ.setdefault("MLFLOW_TRACKING_USERNAME", os.environ["DAGSHUB_USERNAME"])
        os.environ.setdefault("MLFLOW_TRACKING_PASSWORD", os.environ["DAGSHUB_TOKEN"])


def check_production_model(model_name: str) -> bool:
    load_dotenv()
    configure_mlflow_auth()
    client = MlflowClient()

    versions = client.get_latest_versions(model_name, stages=["Production"])
    if not versions:
        print(f"Aucune version de '{model_name}' n'est en stage Production. Deploiement bloque.")
        return False

    print(f"Modele en Production : version {versions[0].version} (run {versions[0].run_id}).")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", default="dvf-paris-price")
    args = parser.parse_args()
    success = check_production_model(args.model_name)
    raise SystemExit(0 if success else 1)
