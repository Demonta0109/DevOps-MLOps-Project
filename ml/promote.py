import argparse
import os

from dotenv import load_dotenv
from mlflow import MlflowClient


def configure_mlflow_auth() -> None:
    if os.getenv("DAGSHUB_USERNAME") and os.getenv("DAGSHUB_TOKEN"):
        os.environ.setdefault("MLFLOW_TRACKING_USERNAME", os.environ["DAGSHUB_USERNAME"])
        os.environ.setdefault("MLFLOW_TRACKING_PASSWORD", os.environ["DAGSHUB_TOKEN"])


def get_staging_candidate(client: MlflowClient, model_name: str):
    versions = client.get_latest_versions(model_name, stages=["Staging"])
    if not versions:
        raise SystemExit(f"Aucune version du modèle '{model_name}' n'est au stage Staging.")
    return versions[0]


def promote(model_name: str, mae_threshold: float) -> bool:
    load_dotenv()
    configure_mlflow_auth()
    client = MlflowClient()

    candidate = get_staging_candidate(client, model_name)
    mae = client.get_run(candidate.run_id).data.metrics["mae"]

    print(f"Modèle candidat : version {candidate.version} (run {candidate.run_id}) — MAE={mae:.0f}")

    if mae >= mae_threshold:
        print(f"Gate KO : MAE {mae:.0f} >= seuil {mae_threshold:.0f}. Le modèle reste en Staging.")
        return False

    client.transition_model_version_stage(
        name=model_name,
        version=candidate.version,
        stage="Production",
        archive_existing_versions=True,
    )
    print(f"Gate OK : MAE {mae:.0f} < seuil {mae_threshold:.0f}. Version {candidate.version} promue en Production.")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", default="dvf-paris-price")
    parser.add_argument("--mae-threshold", type=float, default=150_000)
    args = parser.parse_args()
    success = promote(args.model_name, args.mae_threshold)
    raise SystemExit(0 if success else 1)
