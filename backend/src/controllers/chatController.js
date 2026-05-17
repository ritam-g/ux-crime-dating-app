import { createMessage, getMessagesByConversationId } from "../dao/message.dao.js";
import Conversation from "../models/Conversation.js";
import { getIO } from "../socket/socketServer.js";

/**
 * @file chatController.js
 * @description Handles chat history and message sending logic.
 *
 * Responsibilities:
 * - Verify that users belong to the conversation they are accessing.
 * - Save each message to MongoDB.
 * - Return chat history in the correct order.
 * - Broadcast saved messages to Socket.io rooms when available.
 */

/**
 * Returns the chat history for a conversation.
 *
 * @route GET /api/chat/:conversationId
 * @access Private
 */
export const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      conversationId,
      participants: req.user.id,
    });
    if (!conversation) {
      return res.status(403).json({ message: "You are not allowed to view this chat" });
    }

    const messages = await getMessagesByConversationId(conversationId);

    return res.status(200).json({
      message: "Chat history fetched successfully",
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
};

/**
 * Sends a message inside a conversation.
 *
 * Flow:
 * 1. Confirm the conversation belongs to the current user.
 * 2. Save the message in MongoDB.
 * 3. Emit it to the Socket.io room if the server is connected.
 *
 * @route POST /api/chat/send
 * @access Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ message: "conversationId and content are required" });
    }

    const conversation = await Conversation.findOne({
      conversationId,
      participants: req.user.id,
    });
    if (!conversation) {
      return res.status(403).json({ message: "You are not allowed to send messages in this chat" });
    }

    const savedMessage = await createMessage({
      conversationId,
      sender: req.user.id,
      content,
      isAIMessage: false,
    });

    const io = getIO();
    if (io) {
      io.to(conversationId).emit("receive_message", savedMessage);
    }

    return res.status(201).json({
      message: "Message sent successfully",
      chatMessage: savedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * Verifies that two users have a conversation.
 */
export const verifyMatchedConversation = async (userAId, userBId) => {
  const conversationId = [userAId.toString(), userBId.toString()].sort().join("_");
  return Conversation.findOne({ conversationId });
};
