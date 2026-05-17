import User from "../../models/User.js";
import { getMessagesByConversationId } from "../../dao/message.dao.js";
import { getMistralChatModel } from "../chains/chat.chain.js";
import { SYSTEM_PROMPT_TEMPLATE } from "../prompts/personality.prompt.js";
import { formatHistory } from "../utils/promptBuilder.js";

/**
 * @file aiReply.service.js
 * @description Generates a natural, personality-aligned reply using Mistral.
 */

/**
 * Generates an AI-backed reply for a conversation partner.
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.senderId
 * @param {string} params.receiverId
 * @param {string} params.latestContent
 * @returns {Promise<string>} Cleaned AI text response.
 */
export const generateAIReply = async ({ conversationId, senderId, receiverId, latestContent }) => {
  // Load profiles
  const receiver = await User.findById(receiverId);
  const sender = await User.findById(senderId);

  if (!receiver || !sender) {
    throw new Error("Sender or Receiver profile not found");
  }

  // Load last 10 messages of context
  const fullHistory = await getMessagesByConversationId(conversationId);
  const historyMessages = fullHistory.slice(-10);

  // Format history messages
  const historyText = formatHistory(historyMessages, receiverId, sender.name);

  // Build the complete prompt template
  const formattedPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{name}", receiver.name || "Match")
    .replace("{age}", receiver.age || "N/A")
    .replace("{gender}", receiver.gender || "N/A")
    .replace("{bio}", receiver.bio || "No bio specified.")
    .replace("{interests}", receiver.interests ? receiver.interests.join(", ") : "None")
    .replace("{history}", historyText)
    .replace("{latestMessage}", `${sender.name}: ${latestContent}`);

  const model = getMistralChatModel();
  
  // Call model
  const response = await model.invoke(formattedPrompt);
  
  // Clean up response text (strip prefix if LLM generates sender name)
  let cleanText = typeof response === "string" ? response : (response.text || response.content || "");
  
  // Strip any common roleplay markers
  cleanText = cleanText.replace(new RegExp(`^(${receiver.name}|You):?\\s*`, "i"), "").trim();
  cleanText = cleanText.replace(/^["']|["']$/g, "").trim(); // strip quotation marks if any
  
  return cleanText;
};
