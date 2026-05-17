import {
  findReverseLike,
  getMyMatches,
  getPotentialUsers,
  markBothRecordsAsMatched,
  saveMatchAction,
} from "../dao/match.dao.js";

/**
 * @file matchController.js
 * @description Handles matching-related business logic.
 *
 * Responsibilities:
 * - Fetch potential users for swiping.
 * - Process likes and dislikes.
 * - Detect mutual likes.
 * - Return a user's matches.
 */

/**
 * Returns random users the current user has not already interacted with.
 *
 * @route GET /api/match/users
 * @access Private
 */
export const getUsersForMatching = async (req, res) => {
  try {
    const users = await getPotentialUsers(req.user.id);

    return res.status(200).json({
      message: "Potential users fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch potential users",
      error: error.message,
    });
  }
};

/**
 * Likes another user and checks whether the like is mutual.
 *
 * Flow:
 * 1. Save the current user's like.
 * 2. Check for a reverse like.
 * 3. If it exists, mark both records as matched.
 * 4. Return the match result.
 *
 * @route POST /api/match/like/:targetUserId
 * @access Private
 */
import Conversation from "../models/Conversation.js";

// Keep rest of controller imports and then likeUser:

export const likeUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user id is required" });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You cannot like yourself" });
    }

    const savedAction = await saveMatchAction({
      initiatorId: req.user.id,
      targetUserId,
      action: "like",
    });

    // Deterministic conversation ID sorting user ids
    const conversationId = [req.user.id, targetUserId].sort().join("_");

    // Upsert the conversation document
    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        $setOnInsert: {
          conversationId,
          participants: [req.user.id, targetUserId],
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      isMatched: false,
      conversationId,
      canChat: true,
      match: savedAction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to like user",
      error: error.message,
    });
  }
};

/**
 * Stores a dislike action for the current user.
 *
 * Flow:
 * 1. Save the dislike action.
 * 2. Return a simple response because dislikes do not create matches.
 *
 * @route POST /api/match/dislike/:targetUserId
 * @access Private
 */
export const dislikeUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user id is required" });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: "You cannot dislike yourself" });
    }

    const savedAction = await saveMatchAction({
      initiatorId: req.user.id,
      targetUserId,
      action: "dislike",
    });

    return res.status(200).json({
      isMatched: false,
      match: savedAction,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to dislike user",
      error: error.message,
    });
  }
};

/**
 * Returns all matches for the current user.
 *
 * @route GET /api/match/my-matches
 * @access Private
 */
export const getMyMatchesController = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    }).populate("participants", "name email age gender bio interests");

    // Format conversations seamlessly to look like matches for frontend backward compatibility
    const matches = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== req.user.id
      );
      const currentUserDoc = conv.participants.find(
        (p) => p._id.toString() === req.user.id
      );

      return {
        _id: conv.conversationId, // Important: use conversationId as the _id so selectedMatchId works!
        initiator: currentUserDoc,
        targetUser: otherUser,
        isMatched: true,
        matchedAt: conv.createdAt,
      };
    });

    return res.status(200).json({
      message: "Conversations fetched successfully",
      matches,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};
