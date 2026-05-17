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

    const reverseLike = await findReverseLike(targetUserId, req.user.id);

    if (!reverseLike) {
      return res.status(200).json({
        isMatched: false,
        match: savedAction,
      });
    }

    const { currentRecord, reverseRecord } = await markBothRecordsAsMatched(
      req.user.id,
      targetUserId
    );

    return res.status(200).json({
      isMatched: true,
      match: currentRecord,
      reverseMatch: reverseRecord,
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
    const matches = await getMyMatches(req.user.id);

    return res.status(200).json({
      message: "Matches fetched successfully",
      matches,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch matches",
      error: error.message,
    });
  }
};
