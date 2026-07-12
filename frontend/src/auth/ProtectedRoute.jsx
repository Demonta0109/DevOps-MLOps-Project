import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "../api/client";

export default function ProtectedRoute() {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
