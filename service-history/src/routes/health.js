import { Router } from "express";
import { mongoose } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ status: connected ? "ok" : "degraded", db: connected ? "connected" : "unreachable" });
});
