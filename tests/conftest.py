import numpy as np
import pytest


class FakeModel:
    """Stand-in for the MLflow pyfunc model loaded by app.model.load_model()."""

    def __init__(self, prediction: float = 650_000.0):
        self.prediction = prediction

    def predict(self, features):
        return np.array([self.prediction] * len(features))


@pytest.fixture
def fake_model():
    return FakeModel()
