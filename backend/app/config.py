import os

ENV = os.getenv("ENV", "development")


class Settings:
    env: str = ENV
    mlflow_tracking_uri: str = os.getenv("MLFLOW_TRACKING_URI", "")
    mlflow_tracking_username: str = os.getenv("MLFLOW_TRACKING_USERNAME", os.getenv("DAGSHUB_USERNAME", ""))
    mlflow_tracking_password: str = os.getenv("MLFLOW_TRACKING_PASSWORD", os.getenv("DAGSHUB_TOKEN", ""))
    model_name: str = os.getenv("MODEL_NAME", "dvf-paris-price")
    model_stage: str = os.getenv("MODEL_STAGE", "Production" if ENV == "production" else "Staging")
    cors_allow_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]


settings = Settings()
