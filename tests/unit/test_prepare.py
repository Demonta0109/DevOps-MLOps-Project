import pandas as pd

from prepare import clean, deduplicate_mutations, filter_ventes_appartements_paris


def _row(**overrides):
    row = {
        "id_mutation": "2024-1",
        "nature_mutation": "Vente",
        "type_local": "Appartement",
        "code_departement": "75",
        "valeur_fonciere": 500_000.0,
        "surface_reelle_bati": 50.0,
        "nombre_pieces_principales": 2,
        "code_postal": "75010",
        "latitude": 48.87,
        "longitude": 2.36,
    }
    row.update(overrides)
    return row


def test_filter_keeps_only_ventes_appartements_paris():
    df = pd.DataFrame(
        [
            _row(),
            _row(id_mutation="2024-2", nature_mutation="Vente en l'état futur d'achèvement"),
            _row(id_mutation="2024-3", type_local="Maison"),
            _row(id_mutation="2024-4", code_departement="92"),
        ]
    )

    result = filter_ventes_appartements_paris(df)

    assert result["id_mutation"].tolist() == ["2024-1"]


def test_deduplicate_mutations_aggregates_multi_lot_sales():
    # A single sale ("id_mutation") split across two lots must be aggregated
    # into one row, summing surfaces/pieces but keeping a single price —
    # otherwise the total price gets attributed to each lot separately.
    df = pd.DataFrame(
        [
            _row(id_mutation="multi-1", surface_reelle_bati=30.0, nombre_pieces_principales=1),
            _row(id_mutation="multi-1", surface_reelle_bati=20.0, nombre_pieces_principales=1),
            _row(id_mutation="single-1", surface_reelle_bati=40.0, nombre_pieces_principales=2),
        ]
    )

    result = deduplicate_mutations(df).set_index("id_mutation")

    assert len(result) == 2
    assert result.loc["multi-1", "surface_reelle_bati"] == 50.0
    assert result.loc["multi-1", "nombre_pieces_principales"] == 2
    assert result.loc["multi-1", "valeur_fonciere"] == 500_000.0


def test_clean_removes_missing_values_and_price_outliers():
    df = pd.DataFrame(
        [
            _row(id_mutation="ok"),
            _row(id_mutation="too-cheap", valeur_fonciere=5_000.0),
            _row(id_mutation="too-expensive", valeur_fonciere=20_000_000.0),
            _row(id_mutation="no-surface", surface_reelle_bati=0.0),
            _row(id_mutation="missing-postal", code_postal=None),
        ]
    )

    result = clean(df)

    assert result["id_mutation"].tolist() == ["ok"]
