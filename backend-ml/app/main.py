import logging
import time
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from .config import settings  # noqa: E402
from .metrics import (  # noqa: E402
    model_loaded,
    prediction_failures_total,
    prediction_latency_seconds,
    prediction_requests_total,
)
from .model import get_model, get_model_version, load_model  # noqa: E402
from .schemas import HealthResponse, PredictRequest, PredictResponse  # noqa: E402

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="DVF Paris - Price Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)  # exposes GET /metrics


@app.on_event("startup")
def on_startup() -> None:
    load_model()
    model_loaded.set(1)


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    prediction_requests_total.inc()
    model = get_model()
    if model is None:
        prediction_failures_total.inc()
        raise HTTPException(status_code=503, detail="Model not available")

    start = time.perf_counter()
    try:
        # Colonnes alignees sur ml/train.py: NUMERIC_FEATURES + CATEGORICAL_FEATURES
        features = pd.DataFrame(
            [
                {
                    "surface_reelle_bati": payload.surface,
                    "nombre_pieces_principales": payload.pieces,
                    "latitude": payload.lat,
                    "longitude": payload.lon,
                    "code_postal": payload.code_postal,
                }
            ]
        )
        prediction = model.predict(features)
        prix_estime = float(prediction[0])
    except Exception as exc:
        prediction_failures_total.inc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
    finally:
        prediction_latency_seconds.observe(time.perf_counter() - start)

    return PredictResponse(prix_estime=prix_estime)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    model_loaded = get_model() is not None
    return HealthResponse(
        status="ok" if model_loaded else "degraded",
        model_name=settings.model_name,
        model_stage=settings.model_stage,
        model_version=get_model_version(),
        model_loaded=model_loaded,
    )
