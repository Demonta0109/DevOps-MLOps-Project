import crypto from "node:crypto";
import { pool } from "./db.js";
import { config } from "./config.js";

export async function issueRefreshToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlMs);
  await pool.query("INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)", [
    token,
    userId,
    expiresAt,
  ]);
  return { token, expiresAt };
}

// Deletes the token as it's read so a refresh token can only ever be used once
// (rotation): a stolen-but-already-used token becomes worthless immediately.
export async function consumeRefreshToken(token) {
  const { rows } = await pool.query(
    "DELETE FROM refresh_tokens WHERE token = $1 AND expires_at > now() RETURNING user_id",
    [token]
  );
  return rows[0]?.user_id;
}

export async function revokeRefreshToken(token) {
  await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
}
