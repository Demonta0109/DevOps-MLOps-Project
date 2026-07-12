import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { fetchHistory } from "../historyClient.js";

export const historyRouter = Router();

historyRouter.get("/history", requireAuth, async (req, res) => {
  try {
    const { status, body } = await fetchHistory(req.user.sub);
    res.status(status).json(body);
  } catch {
    res.status(502).json({ error: "History service unavailable" });
  }
});
