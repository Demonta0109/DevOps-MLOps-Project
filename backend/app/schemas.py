from typing import Optional

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    surface: float = Field(..., gt=0, description="Surface habitable en m2")
    pieces: int = Field(..., ge=0, description="Nombre de pieces principales")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    code_postal: str = Field(..., min_length=5, max_length=5, description="Code postal, ex: 75010")


class PredictResponse(BaseModel):
    prix_estime: float


class HealthResponse(BaseModel):
    status: str
    model_name: str
    model_stage: str
    model_version: Optional[str] = None
    model_loaded: bool
