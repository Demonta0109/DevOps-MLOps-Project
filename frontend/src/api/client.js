export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const TOKEN_STORAGE_KEY = "authToken";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || `Erreur API (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const apiClient = {
  predict(payload) {
    return request("/api/v1/estimate", { method: "POST", body: payload });
  },
  health() {
    return request("/health");
  },
  me() {
    return request("/api/v1/me");
  },
  history() {
    return request("/api/v1/history");
  },
  logout() {
    return request("/auth/logout", { method: "POST" });
  },
};
