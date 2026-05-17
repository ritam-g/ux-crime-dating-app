/**
 * @file promptBuilder.js
 * @description Helper utility to format prompt parameters.
 */

/**
 * Formats message history list chronologically.
 * @param {Array} messages 
 * @param {string} receiverId 
 * @param {string} senderName 
 * @returns {string}
 */
export const formatHistory = (messages, receiverId, senderName) => {
  if (!messages || messages.length === 0) return "No prior history.";
  return messages
    .map((msg) => {
      const isReceiver = String(msg.sender?._id || msg.sender) === String(receiverId);
      const name = isReceiver ? "You" : senderName;
      return `${name}: ${msg.content}`;
    })
    .join("\n");
};
