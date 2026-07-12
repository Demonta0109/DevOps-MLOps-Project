import crypto from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { buildGoogleAuthUrl, exchangeCodeForProfile } from "../googleAuth.js";
import { getUserById, upsertGoogleUser } from "../users.js";
import { consumeRefreshToken, issueRefreshToken, revokeRefreshToken } from "../refreshTokens.js";

export const authRouter = Router();

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    maxAge: config.refreshTokenTtlMs,
    path: "/auth",
  };
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.accessTokenTtl,
  });
}

authRouter.get("/google", (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.redirect(buildGoogleAuthUrl(state));
});

authRouter.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${config.frontendUrl}/login?error=missing_code`);
  }

  let user;
  try {
    const profile = await exchangeCodeForProfile(code);
    user = await upsertGoogleUser({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    });
  } catch (err) {
    console.error("Google OAuth callback failed:", err.message);
    return res.redirect(`${config.frontendUrl}/login?error=oauth_failed`);
  }

  const accessToken = signAccessToken(user);
  const { token: refreshToken } = await issueRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  res.redirect(`${config.frontendUrl}/oauth-callback?token=${accessToken}`);
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  const userId = await consumeRefreshToken(refreshToken);
  if (!userId) {
    res.clearCookie("refreshToken", { path: "/auth" });
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const accessToken = signAccessToken(user);
  const { token: newRefreshToken } = await issueRefreshToken(user.id);
  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());
  res.json({ token: accessToken });
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  res.clearCookie("refreshToken", { path: "/auth" });
  res.status(204).send();
});

// Dev-only: issues a "manual" JWT so the walking skeleton can be tested
// before real Google OAuth is wired in (Phase C of the roadmap).
authRouter.post("/dev-token", (req, res) => {
  if (config.env === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  const email = req.body?.email || "dev@example.com";
  const sub = req.body?.sub || "dev-user";
  const token = jwt.sign({ sub, email }, config.jwtSecret, {
    expiresIn: "1h",
  });

  return res.json({ token });
});
