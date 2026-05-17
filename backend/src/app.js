/**
 * @file app.js
 * @description Builds the Express application and mounts middleware and routes.
 *
 * This file stays free of database startup and server listening logic so the
 * app can be reused in tests and in the HTTP server entrypoint.
 */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Trust proxy for secure cookies in production behind Render/Railway
app.set("trust proxy", 1);

// Production-safe Security Headers
app.use(helmet());

// Asset compression
app.use(compression());

// Strictly typed CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

// Request size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * @description Returns a simple health response for deployment checks.
 * @returns JSON health status.
 * @route GET /api/health
 * @access Public
 */
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Love.exe Not Responding backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);

/**
 * @description Returns a consistent response for unknown routes.
 * @returns JSON 404 response.
 * @route N/A
 * @access Public
 */
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

/**
 * @description Handles unexpected server errors in one place.
 * @returns JSON 500 response.
 * @route N/A
 * @access Public
 */
app.use((error, req, res, next) => {
  console.error(error);
  // Gracefully handle Multer file limitations or fileFilter rejections
  if (error.message && (error.message.includes("allowed") || error.message.includes("limit") || error.code === "LIMIT_FILE_SIZE")) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
