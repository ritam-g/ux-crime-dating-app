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
const MessageBubble = ({ message, isMine, peerName = "User", myName = "Me" }) => {
  return (
    <div className={isMine ? "message-row mine" : "message-row"}>
      <div className="bubble">
        <p>{message.content}</p>
        <span className="message-meta">
          {isMine ? myName : peerName}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
