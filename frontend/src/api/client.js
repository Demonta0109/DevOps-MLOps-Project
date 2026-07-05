const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
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

  return response.json();
}

export const apiClient = {
  predict(payload) {
    return request("/predict", { method: "POST", body: payload });
  },
  health() {
    return request("/health");
  },
};
