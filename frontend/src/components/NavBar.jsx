import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient, clearAuthToken } from "../api/client";

export default function NavBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.me().then(setUser).catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    try {
      await apiClient.logout();
    } catch {
      // best-effort: even if the server call fails, drop the local token
    }
    clearAuthToken();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="navbar">
      <Link to="/estimate">Estimer</Link>
      <Link to="/history">Historique</Link>
      {user?.email && <span className="navbar-email">{user.email}</span>}
      <button type="button" onClick={handleLogout}>
        Déconnexion
      </button>
    </nav>
  );
}
