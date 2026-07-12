import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../api/client";

const ERROR_MESSAGES = {
  missing_code: "La connexion Google a été interrompue. Merci de réessayer.",
  oauth_failed: "La connexion Google a échoué. Merci de réessayer.",
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="app">
      <header className="app-header">
        <h1>Estimation de prix — Appartements Paris</h1>
        <p>Connecte-toi pour estimer un bien et consulter ton historique.</p>
      </header>

      {error && <p className="error-text">{ERROR_MESSAGES[error] ?? "Une erreur est survenue."}</p>}

      <a className="google-login-button" href={`${API_BASE_URL}/auth/google`}>
        Se connecter avec Google
      </a>
    </main>
  );
}
