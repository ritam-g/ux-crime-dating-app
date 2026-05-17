import Conversation from "../models/Conversation.js";

/**
 * @file conversation.dao.js
 * @description Encapsulates all database operations on the Conversation collection.
 */

/**
 * Finds a conversation by its deterministic conversationId, verifying a participant.
 * 
 * @param {string} conversationId 
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
export const findConversationByIdAndParticipant = async (conversationId, userId) => {
  return Conversation.findOne({
    conversationId,
    participants: userId,
  });
};

/**
 * Finds a conversation by ID.
 * 
 * @param {string} conversationId 
 * @returns {Promise<Object|null>}
 */
export const findConversationById = async (conversationId) => {
  return Conversation.findOne({ conversationId });
};

/**
 * Upserts a deterministic conversation document.
 * 
 * @param {string} userAId 
 * @param {string} userBId 
 * @returns {Promise<Object>}
 */
export const upsertConversation = async (userAId, userBId) => {
  const conversationId = [userAId.toString(), userBId.toString()].sort().join("_");
  return Conversation.findOneAndUpdate(
    { conversationId },
    {
      $setOnInsert: {
        conversationId,
        participants: [userAId, userBId],
      },
    },
    { upsert: true, new: true }
  );
};

/**
 * Gets all conversations for a user, populated with participant details.
 * 
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getUserConversations = async (userId) => {
  return Conversation.find({
    participants: userId,
  }).populate("participants", "name email age gender bio interests");
};
