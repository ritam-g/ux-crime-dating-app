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
  const createdAt = message.createdAt || message.timestamp || message.updatedAt;
  const dramaticTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "time is fake";
  const damageLabel = isMine ? "emotionally exposed" : "response probability: 2%";

  return (
    <div className={isMine ? "message-row mine" : "message-row"}>
      <div className={isMine ? "bubble mine fake-loading-flash" : "bubble peer fake-loading-flash"}>
        <p>{message.content}</p>
        <span className="message-meta">
          <span>{isMine ? myName : peerName}</span>
          <span className="message-stamp">{dramaticTime} allegedly</span>
          <span className="message-damage">{damageLabel}</span>
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
