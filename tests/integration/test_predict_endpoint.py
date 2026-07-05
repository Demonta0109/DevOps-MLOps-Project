from fastapi.testclient import TestClient

from app import model as model_module
from app.main import app

# NB: TestClient(app) without a "with" block does not run the FastAPI
# startup event, so app.model.load_model() (which hits the real MLflow
# registry) never runs here. We inject a fake model directly instead.
client = TestClient(app)


def test_predict_returns_200_and_a_coherent_price(monkeypatch, fake_model):
    monkeypatch.setattr(model_module, "_model", fake_model)

    response = client.post(
        "/predict",
        json={
            "surface": 50.0,
            "pieces": 2,
            "lat": 48.87,
            "lon": 2.36,
            "code_postal": "75010",
        },
    )

    assert response.status_code == 200
    assert response.json()["prix_estime"] > 0


def test_predict_returns_503_when_no_model_loaded(monkeypatch):
    monkeypatch.setattr(model_module, "_model", None)

    response = client.post(
        "/predict",
        json={
            "surface": 50.0,
            "pieces": 2,
            "lat": 48.87,
            "lon": 2.36,
            "code_postal": "75010",
        },
    )

    assert response.status_code == 503
