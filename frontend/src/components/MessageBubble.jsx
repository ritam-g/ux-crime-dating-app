/**
 * @file MessageBubble.jsx
 * @description Renders one chat message in the conversation.
 */

/**
 * @description Displays an individual message bubble with sender styling.
 * @returns A message bubble UI.
 * @route N/A
 * @access Public
 */
const MessageBubble = ({ message, isMine }) => {
  return (
    <div className={isMine ? "message-row mine" : "message-row"}>
      <div className={message.isAIMessage ? "bubble ai" : "bubble"}>
        <p>{message.content}</p>
        <span className="message-meta">
          {message.isAIMessage ? "AI" : "User"}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
