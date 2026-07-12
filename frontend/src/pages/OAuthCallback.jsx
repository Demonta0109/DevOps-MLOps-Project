import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { setAuthToken } from "../api/client";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login?error=oauth_failed" replace />;
  }
  return <Navigate to="/estimate" replace />;
}
