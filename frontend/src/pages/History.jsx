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
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .historyGraphQL()
      .then(setEstimations)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="app">
      <NavBar />
      <header className="app-header">
        <h1>Historique des estimations <span className="graphql-badge">via GraphQL</span></h1>
      </header>

      {error && <p className="error-text">{error}</p>}

      {!error && estimations.length === 0 && <p>Aucune estimation pour l'instant.</p>}

      <ul className="history-list">
        {estimations.map((estimation) => (
          <li key={estimation.id} className="history-item">
            <span>{estimation.surface} m² - {estimation.pieces} pièces - {estimation.codePostal}</span>
            <span className="result-value">{currencyFormatter.format(estimation.prixEstime)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
