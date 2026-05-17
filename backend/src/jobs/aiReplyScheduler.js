import aiConfig from "../config/ai.config.js";
import { executeFallbackReply } from "../services/chatFallback.service.js";

/**
 * @file aiReplyScheduler.js
 * @description Manages active timeouts for scheduling and canceling AI replies.
 */

const pendingTimers = new Map(); // key = `${conversationId}:${receiverId}` -> Timeout

/**
 * Schedules an AI response if the receiver remains inactive.
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.senderId
 * @param {string} params.receiverId
 * @param {string} params.latestContent
 */
export const scheduleAIReply = ({ conversationId, senderId, receiverId, latestContent }) => {
  const key = `${conversationId}:${receiverId}`;

  // Clean up any pre-existing timer for this specific target
  cancelAIReply(conversationId, receiverId);

  const timeoutId = setTimeout(async () => {
    try {
      pendingTimers.delete(key);
      await executeFallbackReply({ conversationId, senderId, receiverId, latestContent });
    } catch (error) {
      console.error(`[AI Scheduler] Failed executing fallback reply: ${error.message}`);
    }
  }, aiConfig.aiReplyDelayMs);

  pendingTimers.set(key, timeoutId);
};

/**
 * Cancels a pending AI timer for a given conversation and user.
 * @param {string} conversationId
 * @param {string} receiverId
 */
export const cancelAIReply = (conversationId, receiverId) => {
  const key = `${conversationId}:${receiverId}`;
  if (pendingTimers.has(key)) {
    clearTimeout(pendingTimers.get(key));
    pendingTimers.delete(key);
  }
};

export default {
  scheduleAIReply,
  cancelAIReply,
};
