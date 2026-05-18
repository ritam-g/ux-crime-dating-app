import { findUserById } from "../../dao/user.dao.js";
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
  // Load profiles using DAO
  const receiver = await findUserById(receiverId);
  const sender = await findUserById(senderId);

  if (!receiver || !sender) {
    throw new Error("Sender or Receiver profile not found");
  }

  // Load full conversation history context
  const fullHistory = await getMessagesByConversationId(conversationId);

  // Format all history messages
  const historyText = formatHistory(fullHistory, receiverId, sender.name);

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
  
  // Clean up response text (strip prefix if LLM generates sender name or roleplay label)
  let cleanText = typeof response === "string" ? response : (response.text || response.content || "");
  
  // Strip any common roleplay markers and labels (e.g. "ReceiverName: hello" or "AI: hello")
  cleanText = cleanText.replace(new RegExp(`^(${receiver.name}|You|AI|Assistant|System):?\\s*`, "i"), "").trim();
  
  // Strip any leading general label followed by a colon (e.g. "Name: text" or "Response: text")
  cleanText = cleanText.replace(/^[\w\s.-]+:\s*/, "").trim();
  
  // Strip quotation marks if any
  cleanText = cleanText.replace(/^["']|["']$/g, "").trim();
  
  return cleanText;
};

