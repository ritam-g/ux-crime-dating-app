import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { findConversationByIdAndParticipant } from "../dao/conversation.dao.js";
import { createMessage } from "../dao/message.dao.js";
import { addOnlineUser, removeOnlineUser } from "./onlineUsers.js";
import { cancelAIReply, scheduleAIReply } from "../jobs/aiReplyScheduler.js";

/**
 * @file socketServer.js
 * @description Configures the Socket.io server for secure conversation chat messaging and AI fallback trigger point.
 */

const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(";").reduce((acc, curr) => {
    const parts = curr.split("=");
    const key = parts[0];
    const value = parts.slice(1).join("=");
    if (key) {
      acc[key.trim()] = value ? decodeURIComponent(value.trim()) : "";
    }
    return acc;
  }, {});
};

let ioInstance = null;

export const getIO = () => ioInstance;

export const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  // Verify authorization at connection handshake using the JWT Cookie
  ioInstance.use((socket, next) => {
    try {
      const cookieString = socket.handshake.headers.cookie;
      const cookies = parseCookies(cookieString);
      const token = cookies[config.jwtCookieName];

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = {
        id: decoded.id,
        email: decoded.email,
      };
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  ioInstance.on("connection", (socket) => {
    // Record socket connection in online users presence registry
    addOnlineUser(socket.user.id, socket.id);

    /**
     * Registers the client inside a room named after the conversation id.
     */
    socket.on("join_room", async (payload = {}) => {
      const { conversationId } = payload;

      if (!conversationId) {
        socket.emit("join_error", { message: "conversationId is required" });
        return;
      }

      // Secure: ensure the user is an active participant in this conversation
      const conversation = await findConversationByIdAndParticipant(conversationId, socket.user.id);

      if (!conversation) {
        socket.emit("join_error", {
          message: "Access denied. You are not a participant in this conversation.",
        });
        return;
      }

      socket.join(conversationId);
      socket.emit("joined_room", { conversationId });
    });

    socket.on("leave_room", (payload = {}) => {
      const { conversationId } = payload;
      if (conversationId) {
        socket.leave(conversationId);
        socket.emit("left_room", { conversationId });
      }
    });

    /**
     * Saves a socket message and broadcasts it to the conversation room.
     */
    socket.on("send_message", async (payload = {}) => {
      try {
        const { conversationId, content } = payload;

        if (!conversationId || !content) {
          socket.emit("message_error", {
            message: "conversationId and content are required",
          });
          return;
        }

        // Secure: Sender ID comes straight from verified JWT, not the payload!
        const senderId = socket.user.id;

        // Secure: Verify conversation membership
        const conversation = await findConversationByIdAndParticipant(conversationId, senderId);

        if (!conversation) {
          socket.emit("message_error", {
            message: "You are not allowed to send messages in this conversation",
          });
          return;
        }

        const savedMessage = await createMessage({
          conversationId,
          sender: senderId,
          content,
          isAIMessage: false,
        });

        ioInstance.to(conversationId).emit("receive_message", savedMessage);

        // Schedule AI Response on sender activity
        const receiverId = conversation.participants.find(
          (p) => p.toString() !== senderId
        );

        if (receiverId) {
          // 1. Cancel existing fallback directed at the sender
          cancelAIReply(conversationId, senderId);

          // 2. Schedule a new AI response for the receiver
          scheduleAIReply({
            conversationId,
            senderId,
            receiverId: receiverId.toString(),
            latestContent: content.trim(),
          });
        }

      } catch (error) {
        socket.emit("message_error", {
          message: "Failed to send message",
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      // Remove socket from online users presence registry
      removeOnlineUser(socket.id);
    });
  });

  return ioInstance;
};
