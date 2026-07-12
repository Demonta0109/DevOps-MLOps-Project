import { Router } from "express";
import { requireInternalKey } from "../middleware/requireInternalKey.js";
import { Favorite } from "../models/Favorite.js";

export const favoritesRouter = Router();

favoritesRouter.post("/favorites", requireInternalKey, async (req, res) => {
  try {
    const { userId, estimationId, note } = req.body;
    const favorite = await Favorite.create({ userId, estimationId, note });
    res.status(201).json(favorite);
  } catch {
    res.status(400).json({ error: "Invalid favorite payload" });
  }
});

favoritesRouter.get("/favorites/:userId", requireInternalKey, async (req, res) => {
  const favorites = await Favorite.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(favorites);
});

favoritesRouter.delete("/favorites/:id", requireInternalKey, async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    if (favorite.userId !== req.body.userId) {
      return res.status(403).json({ error: "Not allowed to delete this favorite" });
    }

    await favorite.deleteOne();
    res.status(204).send();
  } catch {
    res.status(400).json({ error: "Invalid favorite id" });
  }
});
