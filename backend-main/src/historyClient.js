import { config } from "./config.js";

const headers = {
  "Content-Type": "application/json",
  "X-Internal-Key": config.internalApiKey,
};

// Best-effort: a failure here must never break the /api/v1/estimate response.
export async function saveEstimation({ userId, input, prixEstime, modelVersion }) {
  try {
    await fetch(`${config.historyServiceUrl}/history`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, input, prixEstime, modelVersion }),
    });
  } catch (err) {
    console.error("Failed to save estimation to service-history:", err.message);
  }
}

export async function fetchHistory(userId) {
  const response = await fetch(`${config.historyServiceUrl}/history/${userId}`, { headers });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}
