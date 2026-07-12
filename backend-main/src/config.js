const env = process.env.NODE_ENV || "development";

export const config = {
  env,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  historyServiceUrl: process.env.HISTORY_SERVICE_URL || "http://localhost:4100",
  internalApiKey: process.env.INTERNAL_API_KEY || "",
  corsAllowOrigins: (process.env.CORS_ALLOW_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback",
  accessTokenTtl: "15m",
  refreshTokenTtlMs: 30 * 24 * 60 * 60 * 1000,
};
