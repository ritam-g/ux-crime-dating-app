import aiConfig from "../config/ai.config.js";
import { executeFallbackReply } from "../services/chatFallback.service.js";

/**
 * @file aiReplyScheduler.js
 * @description Manages active conversation timeouts for scheduling and canceling AI replies.
 * Ensures strict single-timer guarantee per conversation room.
 */

const pendingTimers = new Map(); // key = conversationId -> Timeout

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

  const timeoutId = setTimeout(async () => {
    try {
      pendingTimers.delete(conversationId);
      await executeFallbackReply({ conversationId, senderId, receiverId, latestContent });
    } catch (error) {
      console.error(`[AI Scheduler] Failed executing fallback reply: ${error.message}`);
    }
  }, aiConfig.aiReplyDelayMs);

  pendingTimers.set(conversationId, timeoutId);
};

/**
 * Cancels a pending AI timer for a given conversation.
 * @param {string} conversationId
 * @param {string} [receiverId] - Optional receiverId to match legacy signature
 */
export const cancelAIReply = (conversationId, receiverId) => {
  if (pendingTimers.has(conversationId)) {
    clearTimeout(pendingTimers.get(conversationId));
    pendingTimers.delete(conversationId);
  }
};

export default {
  scheduleAIReply,
  cancelAIReply,
};
