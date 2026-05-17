import dotenv from "dotenv";

/**
 * This file is the single source of truth for configuration values.
 * Every other file imports this object instead of reading process.env directly.
 */
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret",
};

export default config;
