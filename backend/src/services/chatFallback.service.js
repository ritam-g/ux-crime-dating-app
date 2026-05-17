import { generateAIReply } from "../ai/services/aiReply.service.js";
import { createMessage } from "../dao/message.dao.js";
import { getIO } from "../socket/socketServer.js";

/**
 * @file chatFallback.service.js
 * @description Orchestrates generating, saving, and emitting AI-powered fallback replies.
 */

/**
 * Executes the AI fallback reply.
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.senderId
 * @param {string} params.receiverId
 * @param {string} params.latestContent
 */
export const executeFallbackReply = async ({ conversationId, senderId, receiverId, latestContent }) => {
  try {
    const io = getIO();
    if (io) {
      // 1. Emit typing indicator start
      io.to(conversationId).emit("typing", { userId: receiverId, isTyping: true });
    }

    const aiResponseContent = await generateAIReply({
      conversationId,
      senderId,
      receiverId,
      latestContent,
    });

    if (!aiResponseContent) {
      if (io) {
        io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      }
      return;
    }

    // Save the AI message inside MongoDB (marked as isAIMessage: true, sent by the receiver)
    const savedMessage = await createMessage({
      conversationId,
      sender: receiverId,
      content: aiResponseContent,
      isAIMessage: true,
    });

    // 2. Emit typing indicator end
    if (io) {
      io.to(conversationId).emit("typing", { userId: receiverId, isTyping: false });
      
      // Broadcast the new message via Socket.io
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
