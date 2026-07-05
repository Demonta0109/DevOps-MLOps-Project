"""End-to-end test: brings up the real docker-compose stack and drives it
over HTTP, exactly like the frontend would. Requires Docker Desktop to be
running locally and a model already promoted to the `Staging` stage in the
MLflow registry (see ml/train.py) - this is a real integration check, not a
mock.
"""

import shutil
import subprocess
import time
from pathlib import Path

import pytest
import requests

pytestmark = pytest.mark.e2e

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_URL = "http://localhost:8000"
HEALTH_TIMEOUT_SECONDS = 300
POLL_INTERVAL_SECONDS = 2


def _docker_available() -> bool:
    return shutil.which("docker") is not None


def _compose(*args: str) -> None:
    subprocess.run(["docker", "compose", *args], cwd=REPO_ROOT, check=True)


@pytest.fixture(scope="module")
def running_stack():
    if not _docker_available():
        pytest.skip("Docker is not available in this environment")

    _compose("up", "-d", "--build", "backend-ml")
    try:
        yield
    finally:
        _compose("down")


def _wait_for_healthy_model() -> dict:
    deadline = time.monotonic() + HEALTH_TIMEOUT_SECONDS
    last_payload = None
    while time.monotonic() < deadline:
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=5)
            if response.status_code == 200:
                last_payload = response.json()
                if last_payload["model_loaded"]:
                    return last_payload
        except requests.exceptions.ConnectionError:
            pass
        time.sleep(POLL_INTERVAL_SECONDS)

    raise AssertionError(
        "backend-ml never reported a loaded model within "
        f"{HEALTH_TIMEOUT_SECONDS}s (last /health payload: {last_payload}). "
        "Make sure a model has been promoted to the 'Staging' stage "
        "(run ml/train.py) and that DagsHub credentials are set in .env."
    )


def test_full_stack_predict_round_trip(running_stack):
    _wait_for_healthy_model()

    response = requests.post(
        f"{BACKEND_URL}/predict",
        json={
            "surface": 50.0,
            "pieces": 2,
            "lat": 48.87,
            "lon": 2.36,
            "code_postal": "75010",
        },
        timeout=10,
    )

    assert response.status_code == 200
    assert response.json()["prix_estime"] > 0
