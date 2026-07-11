import { Router } from "express";
import { pool } from "../db.js";
import { config } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const db = await pool
    .query("SELECT 1")
    .then(() => "connected")
    .catch(() => "unreachable");

  const mlService = await fetch(`${config.mlServiceUrl}/health`, {
    signal: AbortSignal.timeout(3000),
  })
    .then((r) => (r.ok ? "reachable" : "unreachable"))
    .catch(() => "unreachable");

  res.json({
    status: db === "connected" && mlService === "reachable" ? "ok" : "degraded",
    db,
    mlService,
  });
});
