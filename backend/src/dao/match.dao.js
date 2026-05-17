import Match from "../models/Match.js";
import User from "../models/User.js";

/**
 * @file match.dao.js
 * @description Handles every database query for the matching system.
 *
 * The controllers call these helpers instead of using Mongoose directly,
 * which keeps database logic centralized and easier to maintain.
 */

/**
 * Creates or updates a match action for a user pair.
 *
 * @param {Object} params - Action details.
 * @param {string} params.initiatorId - The current user's id.
 * @param {string} params.targetUserId - The user being liked or disliked.
 * @param {"like"|"dislike"} params.action - The chosen action.
 * @returns {Promise<Object>} The saved match action record.
 */
export const saveMatchAction = async ({ initiatorId, targetUserId, action }) => {
  return Match.findOneAndUpdate(
    { initiator: initiatorId, targetUser: targetUserId },
    {
      $set: {
        action,
        isMatched: false,
        matchedAt: null,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

/**
 * Finds the reverse like so the app can detect a mutual match.
 *
 * @param {string} initiatorId - The target user's id in the reverse lookup.
 * @param {string} targetUserId - The current user's id in the reverse lookup.
 * @returns {Promise<Object|null>} The reverse like record if it exists.
 */
export const findReverseLike = async (initiatorId, targetUserId) => {
  return Match.findOne({
    initiator: initiatorId,
    targetUser: targetUserId,
    action: "like",
  });
};

/**
 * Marks both relationship records as matched.
 *
 * @param {string} initiatorId - The current user who triggered the match.
 * @param {string} targetUserId - The other user involved in the match.
 * @returns {Promise<Array>} The updated records.
 */
export const markBothRecordsAsMatched = async (initiatorId, targetUserId) => {
  const matchedAt = new Date();

  const currentRecord = await Match.findOneAndUpdate(
    { initiator: initiatorId, targetUser: targetUserId },
    { $set: { isMatched: true, matchedAt } },
    { new: true }
  );

  const reverseRecord = await Match.findOneAndUpdate(
    { initiator: targetUserId, targetUser: initiatorId },
    { $set: { isMatched: true, matchedAt } },
    { new: true }
  );

  return { currentRecord, reverseRecord };
};

/**
 * Returns user ids the current user has already interacted with.
 *
 * @param {string} userId - The current user's id.
 * @returns {Promise<string[]>} List of user ids to exclude from suggestions.
 */
export const findInteractedUserIds = async (userId) => {
  const records = await Match.find({
    initiator: userId,
  }).select("targetUser");

  return records.map((record) => record.targetUser.toString());
};

/**
 * Returns random users the current user has not already swiped on.
 *
 * @param {string} userId - The current user's id.
 * @returns {Promise<Array>} Random user suggestions.
 */
export const getPotentialUsers = async (userId) => {
  const excludedUserIds = await findInteractedUserIds(userId);
  excludedUserIds.push(userId);

  const filter = {
    _id: { $nin: excludedUserIds },
  };

  const availableCount = await User.countDocuments(filter);
  if (availableCount === 0) {
    return [];
  }

  const sampleSize = Math.min(20, availableCount);

  return User.aggregate([
    { $match: filter },
    { $sample: { size: sampleSize } },
    {
      $project: {
        password: 0,
      },
    },
  ]);
};

/**
 * Returns all matched records for the current user.
 *
 * @param {string} userId - The current user's id.
 * @returns {Promise<Array>} Matched records with populated users.
 */
export const getMyMatches = async (userId) => {
  return Match.find({
    isMatched: true,
    $or: [{ initiator: userId }, { targetUser: userId }],
  })
    .populate("initiator", "name email age gender bio interests")
    .populate("targetUser", "name email age gender bio interests")
    .sort({ matchedAt: -1, createdAt: -1 });
};

/**
 * Finds a matched record that belongs to the current user.
 *
 * @param {string} matchId - The chat or match id.
 * @param {string} userId - The current user's id.
 * @returns {Promise<Object|null>} The match if the user owns it.
 */
export const findMatchedRecordForUser = async (matchId, userId) => {
  return Match.findOne({
    _id: matchId,
    isMatched: true,
    $or: [{ initiator: userId }, { targetUser: userId }],
  });
};

/**
 * Finds the matched pair for two user ids.
 *
 * @param {string} userAId - First user id.
 * @param {string} userBId - Second user id.
 * @returns {Promise<Object|null>} The matched record if the pair exists.
 */
export const findMatchBetweenUsers = async (userAId, userBId) => {
  return Match.findOne({
    isMatched: true,
    $or: [
      { initiator: userAId, targetUser: userBId },
      { initiator: userBId, targetUser: userAId },
    ],
  });
};
