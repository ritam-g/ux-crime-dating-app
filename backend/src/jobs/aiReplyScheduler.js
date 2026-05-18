import aiConfig from "../config/ai.config.js";
import { executeFallbackReply } from "../services/chatFallback.service.js";
import { getIO } from "../socket/socketServer.js";

/**
 * @file aiReplyScheduler.js
 * @description Manages active conversation timeouts for scheduling and canceling AI replies.
 * Ensures strict single-timer guarantee per conversation room.
 */

// Stores rich conversation state: key = conversationId -> { inactivityTimeoutId, typingTimeoutId, isCancelled, receiverId }
const pendingTimers = new Map();

/**
 * Schedules an AI response if the receiver remains inactive.
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.senderId
 * @param {string} params.receiverId
 * @param {string} params.latestContent
 */
export const scheduleAIReply = ({ conversationId, senderId, receiverId, latestContent }) => {
  // Clear any existing active schedule for this conversation room to avoid duplicates/races
  cancelAIReply(conversationId);

  const state = {
    inactivityTimeoutId: null,
    typingTimeoutId: null,
    isCancelled: false,
    receiverId,
  };
  pendingTimers.set(conversationId, state);

  // Wait EXACTLY 10 seconds (10000ms) of full inactivity as required
  const timeoutId = setTimeout(async () => {
    try {
      if (state.isCancelled) return;
      state.inactivityTimeoutId = null;
      await executeFallbackReply({ conversationId, senderId, receiverId, latestContent, state });
    } catch (error) {
      console.error(`[AI Scheduler] Failed executing fallback reply: ${error.message}`);
    } finally {
      // Clean up from registry if it finished completely and wasn't cancelled or replaced
      const current = pendingTimers.get(conversationId);
      if (current === state && !state.typingTimeoutId) {
        pendingTimers.delete(conversationId);
      }
    }
  }, 10000);

  state.inactivityTimeoutId = timeoutId;
};

/**
 * Cancels a pending AI timer for a given conversation, stopping typing delays and preventing any saved messages.
 * @param {string} conversationId
 * @param {string} [receiverId] - Optional receiverId to match legacy signature
 */
export const cancelAIReply = (conversationId, receiverId) => {
  const state = pendingTimers.get(conversationId);
  if (state) {
    state.isCancelled = true;
    if (state.inactivityTimeoutId) {
      clearTimeout(state.inactivityTimeoutId);
      state.inactivityTimeoutId = null;
    }
    if (state.typingTimeoutId) {
      clearTimeout(state.typingTimeoutId);
      state.typingTimeoutId = null;
    }

    // Immediately stop the typing indicator on the socket
    try {
      const io = getIO();
      if (io && state.receiverId) {
        io.to(conversationId).emit("typing", { userId: state.receiverId, isTyping: false });
      }
    } catch (err) {
      console.error("[AI Scheduler] Failed to clear typing socket event:", err);
    }

    pendingTimers.delete(conversationId);
  }
};

export default {
  scheduleAIReply,
  cancelAIReply,
};

