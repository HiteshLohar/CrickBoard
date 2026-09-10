import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import playerRoutes from "./routes/player.routes.js";
import teamRoutes from "./routes/team.routes.js";
import matchRoutes from "./routes/match.routes.js";
import scoringRoutes from "./routes/scoring.routes.js";
import publicMatchRoutes from "./routes/publicMatch.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CrickBoard API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/players", playerRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/matches", scoringRoutes);
app.use("/api/v1/public", publicMatchRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;