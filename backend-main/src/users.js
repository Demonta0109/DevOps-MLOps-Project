import { pool } from "./db.js";

export async function upsertGoogleUser({ googleId, email, name, avatarUrl }) {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, email, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email, name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
     RETURNING id, google_id, email, name, avatar_url`,
    [googleId, email, name, avatarUrl]
  );
  return rows[0];
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, google_id, email, name, avatar_url FROM users WHERE id = $1",
    [id]
  );
  return rows[0];
}
