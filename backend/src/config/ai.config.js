import dotenv from "dotenv";
dotenv.config();

/**
 * @file ai.config.js
 * @description Loads environment variables for AI system configuration.
 */
export default {
  mistralApiKey: process.env.MISTRAL_API_KEY || process.env.mistralApiKey,
  mistralModel: process.env.MISTRAL_MODEL || "mistral-medium",
  aiReplyDelayMs: parseInt(process.env.AI_REPLY_DELAY_MS, 10) || 10000,
};


