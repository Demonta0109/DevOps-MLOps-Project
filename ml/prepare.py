import argparse
from pathlib import Path

import pandas as pd

PRICE_MIN = 10_000
PRICE_MAX = 10_000_000

NUMERIC_COLUMNS = [
    "valeur_fonciere",
    "surface_reelle_bati",
    "nombre_pieces_principales",
    "latitude",
    "longitude",
]


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, dtype={"code_postal": "string", "code_departement": "string"}, low_memory=False)
    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def filter_ventes_appartements_paris(df: pd.DataFrame) -> pd.DataFrame:
    return df[
        (df["nature_mutation"] == "Vente")
        & (df["type_local"] == "Appartement")
        & (df["code_departement"] == "75")
    ].copy()


def deduplicate_mutations(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates()
    return (
        df.groupby("id_mutation")
        .agg(
            valeur_fonciere=("valeur_fonciere", "first"),
            surface_reelle_bati=("surface_reelle_bati", "sum"),
            nombre_pieces_principales=("nombre_pieces_principales", "sum"),
            code_postal=("code_postal", "first"),
            latitude=("latitude", "first"),
            longitude=("longitude", "first"),
        )
        .reset_index()
    )


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["valeur_fonciere", "surface_reelle_bati", "latitude", "longitude", "code_postal"])
    df = df[df["surface_reelle_bati"] > 0]
    df = df[df["valeur_fonciere"].between(PRICE_MIN, PRICE_MAX)]
    return df.drop_duplicates()


def derive_arrondissement(df: pd.DataFrame) -> pd.DataFrame:
    df["arrondissement"] = df["code_postal"].str.slice(-2).astype(int)
    return df


def prepare(input_path: str, output_path: str) -> pd.DataFrame:
    df = load_data(input_path)
    df = filter_ventes_appartements_paris(df)
    df = deduplicate_mutations(df)
    df = clean(df)
    df = derive_arrondissement(df)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="data/raw/dvf_paris.csv")
    parser.add_argument("--output", default="data/processed/dvf_paris_clean.csv")
    args = parser.parse_args()
    result = prepare(args.input, args.output)
    print(f"{len(result)} lignes écrites dans {args.output}")
