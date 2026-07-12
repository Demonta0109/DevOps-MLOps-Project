import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { apiClient } from "../api/client";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function History() {
  const [estimations, setEstimations] = useState([]);
  const [favoritesByEstimationId, setFavoritesByEstimationId] = useState({});
  const [error, setError] = useState(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    Promise.all([apiClient.historyGraphQL(), apiClient.favorites()])
      .then(([estimationList, favoriteList]) => {
        setEstimations(estimationList);
        setFavoritesByEstimationId(
          Object.fromEntries(favoriteList.map((favorite) => [favorite.estimationId, favorite._id]))
        );
      })
      .catch((err) => setError(err.message));
  }, []);

  function toggleFavorite(estimationId) {
    const favoriteId = favoritesByEstimationId[estimationId];

    if (favoriteId) {
      setFavoritesByEstimationId((current) => {
        const { [estimationId]: _removed, ...rest } = current;
        return rest;
      });
      apiClient.removeFavorite(favoriteId).catch((err) => setError(err.message));
    } else {
      setFavoritesByEstimationId((current) => ({ ...current, [estimationId]: null }));
      apiClient
        .addFavorite(estimationId)
        .then((favorite) => {
          setFavoritesByEstimationId((current) => ({ ...current, [estimationId]: favorite._id }));
        })
        .catch((err) => setError(err.message));
    }
  }

  const visibleEstimations = showOnlyFavorites
    ? estimations.filter((estimation) => favoritesByEstimationId[estimation.id])
    : estimations;

  return (
    <main className="app">
      <NavBar />
      <header className="app-header">
        <h1>Historique des estimations <span className="graphql-badge">via GraphQL</span></h1>
      </header>

      <label className="favorites-filter">
        <input
          type="checkbox"
          checked={showOnlyFavorites}
          onChange={(event) => setShowOnlyFavorites(event.target.checked)}
        />
        Afficher uniquement les favoris
      </label>

      {error && <p className="error-text">{error}</p>}

      {!error && estimations.length === 0 && <p>Aucune estimation pour l'instant.</p>}

      {!error && estimations.length > 0 && visibleEstimations.length === 0 && (
        <p>Aucun favori pour l'instant.</p>
      )}

      <ul className="history-list">
        {visibleEstimations.map((estimation) => (
          <li key={estimation.id} className="history-item">
            <span className="history-item-main">
              <button
                type="button"
                className="favorite-star"
                aria-pressed={Boolean(favoritesByEstimationId[estimation.id])}
                aria-label={favoritesByEstimationId[estimation.id] ? "Retirer des favoris" : "Ajouter aux favoris"}
                onClick={() => toggleFavorite(estimation.id)}
              >
                {favoritesByEstimationId[estimation.id] ? "★" : "☆"}
              </button>
              <span>{estimation.surface} m² - {estimation.pieces} pièces - {estimation.codePostal}</span>
            </span>
            <span className="result-value">{currencyFormatter.format(estimation.prixEstime)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
