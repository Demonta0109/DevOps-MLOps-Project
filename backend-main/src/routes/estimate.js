import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { config } from "../config.js";
import { saveEstimation } from "../historyClient.js";

export const estimateRouter = Router();

estimateRouter.post("/estimate", requireAuth, async (req, res) => {
  let mlResponse;
  try {
    mlResponse = await fetch(`${config.mlServiceUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
  } catch {
    return res.status(502).json({ error: "ML service unavailable" });
  }

  const body = await mlResponse.json().catch(() => ({}));

  if (mlResponse.status === 200) {
    const modelVersion = await fetch(`${config.mlServiceUrl}/health`)
      .then((r) => r.json())
      .then((h) => h.model_version)
      .catch(() => undefined);

    await saveEstimation({
      userId: req.user.sub,
      input: req.body,
      prixEstime: body.prix_estime,
      modelVersion,
    });
  }

  return res.status(mlResponse.status).json(body);
});
