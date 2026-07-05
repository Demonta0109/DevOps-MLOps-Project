import pytest
from pydantic import ValidationError

from app.schemas import PredictRequest

VALID_PAYLOAD = {
    "surface": 50.0,
    "pieces": 2,
    "lat": 48.87,
    "lon": 2.36,
    "code_postal": "75010",
}


def test_predict_request_accepts_valid_payload():
    request = PredictRequest(**VALID_PAYLOAD)

    assert request.surface == 50.0
    assert request.code_postal == "75010"


def test_predict_request_rejects_negative_surface():
    payload = {**VALID_PAYLOAD, "surface": -10.0}

    with pytest.raises(ValidationError):
        PredictRequest(**payload)
