import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { estimateRouter } from "./routes/estimate.js";
import { historyRouter } from "./routes/history.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: config.corsAllowOrigins, credentials: true }));

app.use(healthRouter);
app.use("/auth", authRouter);
app.use("/api/v1", meRouter);
app.use("/api/v1", estimateRouter);
app.use("/api/v1", historyRouter);
