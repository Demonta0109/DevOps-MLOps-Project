import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { config } from "../config.js";

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
  return res.status(mlResponse.status).json(body);
});
