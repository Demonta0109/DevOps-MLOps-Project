import { Router } from "express";
import { requireInternalKey } from "../middleware/requireInternalKey.js";
import { Estimation } from "../models/Estimation.js";

export const historyRouter = Router();

historyRouter.post("/history", requireInternalKey, async (req, res) => {
  try {
    const { userId, input, prixEstime, modelVersion } = req.body;
    const estimation = await Estimation.create({ userId, input, prixEstime, modelVersion });
    res.status(201).json(estimation);
  } catch {
    res.status(400).json({ error: "Invalid estimation payload" });
  }
});

historyRouter.get("/history/:userId", requireInternalKey, async (req, res) => {
  const estimations = await Estimation.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(estimations);
});
