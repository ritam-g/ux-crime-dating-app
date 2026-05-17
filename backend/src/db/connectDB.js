import mongoose from "mongoose";
import config from "../config/config.js";

/**
 * Connects the app to MongoDB.
 * Keeping this in one file makes database startup easy to manage and reuse.
 */
const connectDB = async () => {
  try {
    if (!config.mongoURI) {
      throw new Error("MONGO_URI is missing in configuration");
    }

    await mongoose.connect(config.mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
