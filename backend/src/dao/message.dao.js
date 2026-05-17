import Message from "../models/Message.js";

/**
 * @file message.dao.js
 * @description Handles database operations for chat messages.
 *
 * Keeping message persistence in a DAO helps the controller stay focused on
 * request validation and response formatting.
 */

/**
 * Creates a chat message document.
 *
 * @param {Object} messageData - Message fields.
 * @returns {Promise<Object>} The saved message document.
 */
export const createMessage = async (messageData) => {
  return Message.create(messageData);
};

/**
 * Returns the full chat history for a match in chronological order.
 *
 * @param {string} matchId - The match identifier.
 * @returns {Promise<Array>} Sorted chat messages.
 */
export const getMessagesByMatchId = async (matchId) => {
  return Message.find({ matchId }).sort({ createdAt: 1 });
};
