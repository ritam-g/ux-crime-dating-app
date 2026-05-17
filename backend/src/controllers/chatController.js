import { createMessage, getMessagesByConversationId } from "../dao/message.dao.js";
import { findConversationByIdAndParticipant, findConversationById } from "../dao/conversation.dao.js";
import { getIO } from "../socket/socketServer.js";
import { cancelAIReply, scheduleAIReply } from "../jobs/aiReplyScheduler.js";

/**
 * @file chatController.js
 * @description Handles chat history and message sending logic.
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

    const conversation = await findConversationByIdAndParticipant(conversationId, req.user.id);
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
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ message: "conversationId and content are required" });
    }

    const conversation = await findConversationByIdAndParticipant(conversationId, req.user.id);
    if (!conversation) {
      return res.status(403).json({ message: "You are not allowed to send messages in this chat" });
    }

    const savedMessage = await createMessage({
      conversationId,
      sender: req.user.id,
      content,
      isAIMessage: false,
    });

    // AI Reply Scheduling integration
    const receiverId = conversation.participants.find(
      (p) => p.toString() !== req.user.id
    );

    if (receiverId) {
      // 1. Cancel any active fallback replies directed to the sender since they responded
      cancelAIReply(conversationId, req.user.id);

      // 2. Schedule a new fallback reply for the receiver
      scheduleAIReply({
        conversationId,
        senderId: req.user.id,
        receiverId: receiverId.toString(),
        latestContent: content.trim(),
      });
    }

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
  return findConversationById(conversationId);
};
