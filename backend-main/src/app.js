import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { estimateRouter } from "./routes/estimate.js";
import { historyRouter } from "./routes/history.js";
import { favoritesRouter } from "./routes/favorites.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: config.corsAllowOrigins, credentials: true }));

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use(healthRouter);
app.use("/auth", authRouter);
app.use("/api/v1", apiRateLimiter);
app.use("/api/v1", meRouter);
app.use("/api/v1", estimateRouter);
app.use("/api/v1", historyRouter);
app.use("/api/v1", favoritesRouter);

const graphqlServer = new ApolloServer({ typeDefs, resolvers });
await graphqlServer.start();
app.use(
  "/graphql",
  requireAuth,
  expressMiddleware(graphqlServer, {
    context: async ({ req }) => ({ user: req.user }),
  })
);
