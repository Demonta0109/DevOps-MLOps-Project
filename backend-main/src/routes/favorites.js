import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { fetchFavorites, saveFavorite, deleteFavorite } from "../historyClient.js";

export const favoritesRouter = Router();

favoritesRouter.get("/favorites", requireAuth, async (req, res) => {
  try {
    const { status, body } = await fetchFavorites(req.user.sub);
    res.status(status).json(body);
  } catch {
    res.status(502).json({ error: "History service unavailable" });
  }
});

favoritesRouter.post("/favorites", requireAuth, async (req, res) => {
  try {
    const { estimationId, note } = req.body;
    const { status, body } = await saveFavorite({ userId: req.user.sub, estimationId, note });
    res.status(status).json(body);
  } catch {
    res.status(502).json({ error: "History service unavailable" });
  }
});

favoritesRouter.delete("/favorites/:id", requireAuth, async (req, res) => {
  try {
    const { status, body } = await deleteFavorite({ userId: req.user.sub, favoriteId: req.params.id });
    if (status === 204) {
      return res.status(204).send();
    }
    res.status(status).json(body);
  } catch {
    res.status(502).json({ error: "History service unavailable" });
  }
});
