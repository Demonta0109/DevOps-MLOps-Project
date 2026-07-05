import pandas as pd

from prepare import derive_arrondissement


def test_derive_arrondissement_from_code_postal():
    df = pd.DataFrame({"code_postal": ["75001", "75010", "75116", "75020"]})

    result = derive_arrondissement(df)

    assert result["arrondissement"].tolist() == [1, 10, 16, 20]
