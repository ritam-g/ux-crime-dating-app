import { ChatMistralAI } from "@langchain/mistralai";
import aiConfig from "../../config/ai.config.js";

/**
 * @file chat.chain.js
 * @description Configures and instantiates the Mistral LLM via LangChain.
 */

/**
 * Creates a configured ChatMistralAI instance.
 * @returns {ChatMistralAI}
 */
export const getMistralChatModel = () => {
  return new ChatMistralAI({
    apiKey: aiConfig.mistralApiKey,
    modelName: aiConfig.mistralModel, // LangChain uses modelName or model
    temperature: 0.7,
  });
};
