import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import Estimate from "./pages/Estimate";
import History from "./pages/History";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/history" element={<History />} />
      </Route>

      <Route path="/" element={<Navigate to="/estimate" replace />} />
      <Route path="*" element={<Navigate to="/estimate" replace />} />
    </Routes>
  );
}
