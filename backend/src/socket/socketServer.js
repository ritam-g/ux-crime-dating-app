import { Server } from "socket.io";
import { createMessage } from "../dao/message.dao.js";
import { findMatchedRecordForUser } from "../dao/match.dao.js";

/**
 * @file socketServer.js
 * @description Configures the Socket.io server for live chat messaging.
 *
 * This module keeps the realtime layer isolated from the HTTP layer so the app
 * can scale cleanly as features like AI fallback and typing indicators grow.
 */

let ioInstance = null;

/**
 * Returns the active Socket.io instance when the server has already been initialized.
 *
 * @returns {Server|null} The current Socket.io instance or null if not ready.
 */
export const getIO = () => ioInstance;

/**
 * Initializes Socket.io on top of the provided HTTP server.
 *
 * @param {import("http").Server} server - The Node HTTP server instance.
 * @returns {Server} The configured Socket.io instance.
 */
export const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  ioInstance.on("connection", (socket) => {
    /**
     * Registers the client inside a room named after the match id.
     */
    socket.on("join_room", async (payload = {}) => {
      const { matchId } = payload;

      if (!matchId) {
        socket.emit("join_error", { message: "matchId is required" });
        return;
      }

      socket.join(matchId);
      socket.emit("joined_room", { matchId });
    });

    /**
     * Saves a socket message and broadcasts it to the match room.
     */
    socket.on("send_message", async (payload = {}) => {
      try {
        const { matchId, senderId, content } = payload;

        if (!matchId || !senderId || !content) {
          socket.emit("message_error", {
            message: "matchId, senderId, and content are required",
          });
          return;
        }

        const match = await findMatchedRecordForUser(matchId, senderId);
        if (!match) {
          socket.emit("message_error", {
            message: "You are not allowed to send messages in this match",
          });
          return;
        }

        const savedMessage = await createMessage({
          matchId,
          sender: senderId,
          content,
          isAIMessage: false,
        });

        ioInstance.to(matchId).emit("receive_message", savedMessage);
      } catch (error) {
        socket.emit("message_error", {
          message: "Failed to send message",
          error: error.message,
        });
      }
    });

    /**
     * Cleans up the socket connection when the client disconnects.
     */
    socket.on("disconnect", () => {
      // No extra cleanup is needed yet because rooms close automatically.
    });
  });

  return ioInstance;
};
