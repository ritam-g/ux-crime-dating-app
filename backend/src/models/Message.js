import mongoose from "mongoose";

/**
 * @file Message.js
 * @description Stores chat messages for matched users and optional AI fallback messages.
 *
 * This model keeps chat history persistent so the conversation can be restored
 * even after the socket connection closes.
 */
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isAIMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
