import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

/**
 * This file only creates and configures the Express application.
 * Keeping startup logic elsewhere makes the app easier to test and reuse.
 */
const app = express();

// Basic middleware that every API needs.
app.use(cors());
app.use(express.json());

/**
 * Health check is useful for quick deployment checks and local debugging.
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Love.exe Not Responding backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/**
 * Simple 404 handler keeps unknown routes predictable.
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Central error handler catches unexpected failures in one place.
 */
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
