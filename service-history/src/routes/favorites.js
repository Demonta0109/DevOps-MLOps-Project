import { Router } from "express";
import { requireInternalKey } from "../middleware/requireInternalKey.js";
import { Favorite } from "../models/Favorite.js";

export const favoritesRouter = Router();

favoritesRouter.post("/favorites", requireInternalKey, async (req, res) => {
  const { userId, estimationId, note } = req.body;
  const favorite = await Favorite.create({ userId, estimationId, note });
  res.status(201).json(favorite);
});

favoritesRouter.delete("/favorites/:id", requireInternalKey, async (req, res) => {
  await Favorite.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
