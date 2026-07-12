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

async function graphqlRequest(query, variables) {
  const result = await request("/graphql", { method: "POST", body: { query, variables } });
  if (result?.errors?.length) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
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
  // REST: kept for actions (proxying the estimation to backend-ml + saving to history).
  history() {
    return request("/api/v1/history");
  },
  // GraphQL: the read side of the same data, used by the History page (see docs on the 2 API paradigms).
  historyGraphQL() {
    return graphqlRequest(
      `query {
        myEstimations {
          id
          surface
          pieces
          codePostal
          prixEstime
          modelVersion
          createdAt
        }
      }`
    ).then((data) => data.myEstimations);
  },
  logout() {
    return request("/auth/logout", { method: "POST" });
  },
};
