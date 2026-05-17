import app from "./src/app.js";
import connectDB from "./src/db/connectDB.js";
import config from "./src/config/config.js";
import { createServer } from "node:http";
import { initializeSocket } from "./src/socket/socketServer.js";

/**
 * This file is the only server entry point.
 * It connects the database and starts listening after the Express app is ready.
 */
const startServer = async () => {
  try {
    await connectDB();

    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
