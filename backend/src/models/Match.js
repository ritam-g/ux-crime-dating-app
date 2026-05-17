import mongoose from "mongoose";

/**
 * @file Match.js
 * @description Stores user-to-user interaction records for the matching system.
 *
 * This model keeps each swipe-like action in one place so the app can detect
 * mutual likes, show matches, and keep the chat system tied to a single record.
 */
const matchSchema = new mongoose.Schema(
  {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
    isMatched: {
      type: Boolean,
      default: false,
    },
    matchedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ initiator: 1, targetUser: 1 }, { unique: true });

const Match = mongoose.model("Match", matchSchema);

export default Match;
