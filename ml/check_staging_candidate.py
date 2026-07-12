import argparse
import os

from dotenv import load_dotenv
from mlflow import MlflowClient


def configure_mlflow_auth() -> None:
    if os.getenv("DAGSHUB_USERNAME") and os.getenv("DAGSHUB_TOKEN"):
        os.environ.setdefault("MLFLOW_TRACKING_USERNAME", os.environ["DAGSHUB_USERNAME"])
        os.environ.setdefault("MLFLOW_TRACKING_PASSWORD", os.environ["DAGSHUB_TOKEN"])


def has_staging_candidate(model_name: str) -> bool:
    load_dotenv()
    configure_mlflow_auth()
    client = MlflowClient()

    versions = client.get_latest_versions(model_name, stages=["Staging"])
    if not versions:
        print(f"Aucun candidat au stage Staging pour '{model_name}'. Le modele Production actuel est conserve.")
        return False

    print(f"Candidat Staging trouve : version {versions[0].version} (run {versions[0].run_id}).")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", default="dvf-paris-price")
    args = parser.parse_args()
    found = has_staging_candidate(args.model_name)

    github_output = os.getenv("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"has_candidate={'true' if found else 'false'}\n")
