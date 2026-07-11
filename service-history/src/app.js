import express from "express";
import { healthRouter } from "./routes/health.js";
import { historyRouter } from "./routes/history.js";
import { favoritesRouter } from "./routes/favorites.js";

export const app = express();

app.use(express.json());

app.use(healthRouter);
app.use(historyRouter);
app.use(favoritesRouter);
