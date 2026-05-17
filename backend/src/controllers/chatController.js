import { createMessage, getMessagesByMatchId } from "../dao/message.dao.js";
import {
  findMatchedRecordForUser,
  findMatchBetweenUsers,
} from "../dao/match.dao.js";
import { getIO } from "../socket/socketServer.js";

/**
 * @file chatController.js
 * @description Handles chat history and message sending logic.
 *
 * Responsibilities:
 * - Verify that only matched users can chat.
 * - Save each message to MongoDB.
 * - Return chat history in the correct order.
 * - Broadcast saved messages to Socket.io rooms when available.
 */

/**
 * Returns the chat history for a matched conversation.
 *
 * @route GET /api/chat/:matchId
 * @access Private
 */
export const getChatHistory = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await findMatchedRecordForUser(matchId, req.user.id);
    if (!match) {
      return res.status(403).json({ message: "You are not allowed to view this chat" });
    }

    const messages = await getMessagesByMatchId(matchId);

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
 * Sends a message inside a matched conversation.
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
    const { matchId, content } = req.body;

    if (!matchId || !content) {
      return res.status(400).json({ message: "matchId and content are required" });
    }

    const match = await findMatchedRecordForUser(matchId, req.user.id);
    if (!match) {
      return res.status(403).json({ message: "You are not allowed to send messages in this chat" });
    }

    const savedMessage = await createMessage({
      matchId,
      sender: req.user.id,
      content,
      isAIMessage: false,
    });

    const io = getIO();
    if (io) {
      io.to(matchId).emit("receive_message", savedMessage);
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
 * Verifies that two users have an active match.
 *
 * This helper is useful if future AI fallback logic needs to check whether
 * a conversation is valid before auto-responding.
 */
export const verifyMatchedConversation = async (userAId, userBId) => {
  return findMatchBetweenUsers(userAId, userBId);
};
