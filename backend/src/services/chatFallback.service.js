import { generateAIReply } from "../ai/services/aiReply.service.js";
import { createMessage } from "../dao/message.dao.js";
import { getIO } from "../socket/socketServer.js";

/**
 * @file chatFallback.service.js
 * @description Orchestrates generating, saving, and emitting AI-powered fallback replies with human-like delays and cancellation boundaries.
 */

/**
 * Executes the AI fallback reply.
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.senderId
 * @param {string} params.receiverId
 * @param {string} params.latestContent
 * @param {Object} params.state - Active cancellation state object from scheduler
 */
export const executeFallbackReply = async ({ conversationId, senderId, receiverId, latestContent, state }) => {
  try {
    const io = getIO();

    if (state && state.isCancelled) return;

    // 1. Emit typing indicator start
    if (io) {
      io.to(conversationId).emit("typing", { userId: receiverId, isTyping: true });
    }

    // 2. Wait realistic typing delay (2-3 seconds)
    if (state && !state.isCancelled) {
      await new Promise((resolve) => {
        const typingDelay = 2000 + Math.floor(Math.random() * 1001); // 2000ms to 3000ms
        state.typingTimeoutId = setTimeout(() => {
          state.typingTimeoutId = null;
          resolve();
        }, typingDelay);
      });
    }

    if (state && state.isCancelled) {
      if (io) {
        io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      }
      return;
    }

    // 3. Generate response using full chat history
    const aiResponseContent = await generateAIReply({
      conversationId,
      senderId,
      receiverId,
      latestContent,
    });

    if (state && state.isCancelled) {
      if (io) {
        io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      }
      return;
    }

    if (!aiResponseContent) {
      if (io) {
        io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      }
      return;
    }

    // 4. Save the AI message inside MongoDB
    const savedMessage = await createMessage({
      conversationId,
      sender: receiverId,
      content: aiResponseContent,
      isAIMessage: true,
    });

    if (state && state.isCancelled) {
      if (io) {
        io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      }
      return;
    }

    // 5. Emit typing indicator end and broadcast realtime message
    if (io) {
      io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      io.to(conversationId).emit("receive_message", savedMessage);
    }
  } catch (error) {
    console.error(`[Chat Fallback Service] Failed to execute AI reply: ${error.message}`);
    // Ensure typing ends on error
    const io = getIO();
    if (io) {
      io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
    }
  }
};

