import { config } from "../config.js";

export function requireInternalKey(req, res, next) {
  const key = req.headers["x-internal-key"];

  if (!key) {
    return res.status(401).json({ error: "Missing internal key" });
  }
  if (key !== config.internalApiKey) {
    return res.status(401).json({ error: "Invalid internal key" });
  }

  return next();
}
