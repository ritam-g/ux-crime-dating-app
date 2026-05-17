/**
 * @file config.js
 * @description Loads environment variables and exposes a single config object.
 *
 * This file is the only place that reads process.env so the rest of the app
 * can import clean configuration values without repeating environment logic.
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  path.resolve(currentDir, "../../.env"),
  path.resolve(currentDir, "../.env"),
];

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));

dotenv.config(envPath ? { path: envPath } : {});

const config = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || "",
  mongoURI: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret",
  jwtCookieName: "token",
  jwtExpiresIn: "7d",
  jwtCookieMaxAge: 7 * 24 * 60 * 60 * 1000,
  isProduction: process.env.NODE_ENV === "production",
};

export default config;
