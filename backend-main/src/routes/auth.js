import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const authRouter = Router();

// Dev-only: issues a "manual" JWT so the walking skeleton can be tested
// before real Google OAuth is wired in (Phase C of the roadmap).
authRouter.post("/dev-token", (req, res) => {
  if (config.env === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  const email = req.body?.email || "dev@example.com";
  const token = jwt.sign({ sub: "dev-user", email }, config.jwtSecret, {
    expiresIn: "1h",
  });

  return res.json({ token });
});
