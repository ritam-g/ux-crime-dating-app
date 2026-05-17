/**
 * @file Chat.jsx
 * @description Chat screen that uses REST for history and Socket.io for live updates.
 *
 * This page keeps the conversation flow reliable by loading history from the API
 * and using the socket only for realtime delivery once a room is joined.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import {
  getChatHistory,
  getMyMatches,
  getOtherParticipant,
  sendChatMessage,
} from "../services/api.js";
import socket, {
  connectSocket,
  joinRoom,
  offReceiveMessage,
  onReceiveMessage,
  sendMessage as emitMessage,
} from "../services/socket.js";

/**
 * @description Loads chat history, joins the socket room, and sends messages.
 * @returns A chat interface.
 * @route GET /api/chat/:matchId
 * @route POST /api/chat/send
 * @access Private
 */
const Chat = ({ activeMatch, onPickMatch, onGoMatch }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(activeMatch?.matchId || "");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Select a match to start chatting.");
  const [typingUser, setTypingUser] = useState(null);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [roomError, setRoomError] = useState("");
  const bottomRef = useRef(null);
  const seenMessageIds = useRef(new Set());

  const selectedMatch = useMemo(
    () => matches.find((match) => match._id === selectedMatchId) || null,
    [matches, selectedMatchId]
  );

  const hasMatches = matches.length > 0;

  useEffect(() => {
    if (activeMatch?.matchId && activeMatch.matchId !== selectedMatchId) {
      setSelectedMatchId(activeMatch.matchId);
    }
  }, [activeMatch, selectedMatchId]);

  const otherUserName = (match) => {
    if (!match || !user) return "Chat";
    const other = getOtherParticipant(match, user._id || user.id);
    return other?.name || "Match";
  };

  const loadMatches = async () => {
    const response = await getMyMatches();
    const items = response.matches || [];
    setMatches(items);

    if (!selectedMatchId && items[0]) {
      setSelectedMatchId(items[0]._id);
      onPickMatch?.({ matchId: items[0]._id, peerName: otherUserName(items[0]) });
    }
  };

  const previousConversationId = useRef(null);

  const loadHistory = async (matchId) => {
    if (!matchId) return;

    setStatus("Loading chat history...");
    try {
      const response = await getChatHistory(matchId);
      const history = response.messages || [];
      seenMessageIds.current = new Set(history.map((message) => message._id || message.id));
      setMessages(history);
      setStatus("");
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setStatus("Failed to load history.");
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatchId) return;

    // Reset room state for new conversation
    setIsRoomReady(false);
    setRoomError("");

    // Load history asynchronously without blocking
    loadHistory(selectedMatchId);

    // Establish connection
    const currentSocket = connectSocket();

    // Emit leave_room for the previous room if changing rooms
    if (previousConversationId.current && previousConversationId.current !== selectedMatchId) {
      socket.emit("leave_room", { conversationId: previousConversationId.current });
    }
    previousConversationId.current = selectedMatchId;

    const attemptJoinRoom = () => {
      if (socket.connected) {
        socket.emit("join_room", { conversationId: selectedMatchId });
      }
    };

    // If socket is already connected, emit join immediately
    attemptJoinRoom();

    // Listeners for Room Connection Lifecycle
    const handleConnect = () => {
      setRoomError("");
      attemptJoinRoom();
    };

    const handleDisconnect = () => {
      setIsRoomReady(false);
    };

    const handleReconnect = () => {
      attemptJoinRoom();
    };

    const handleJoinedRoom = (data) => {
      if (String(data.conversationId) === String(selectedMatchId)) {
        setIsRoomReady(true);
        setRoomError("");
      }
    };

    const handleJoinError = (data) => {
      setIsRoomReady(false);
      setRoomError(data.message || "Access denied.");
    };

    // Message receiver with strict deduplication
    const handleMessage = (incomingMessage) => {
      const incomingId = incomingMessage._id || incomingMessage.id;
      const incomingConvId = incomingMessage.conversationId;

      if (String(incomingConvId) !== String(selectedMatchId)) {
        return;
      }

      if (incomingId && seenMessageIds.current.has(incomingId)) {
        return; // Deduplicate!
      }

      if (incomingId) {
        seenMessageIds.current.add(incomingId);
      }

      setMessages((current) => {
        // Double check to prevent race conditions during history loading
        if (incomingId && current.some((m) => (m._id || m.id) === incomingId)) {
          return current;
        }
        return [...current, incomingMessage];
      });
    };

    const handleTyping = (data) => {
      const currentUserId = user?._id || user?.id;
      if (data.isTyping && String(data.userId) !== String(currentUserId)) {
        setTypingUser(selectedMatch ? otherUserName(selectedMatch) : "Match");
      } else {
        setTypingUser(null);
      }
    };

    // Attach listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);
    socket.on("joined_room", handleJoinedRoom);
    socket.on("join_error", handleJoinError);
    socket.on("receive_message", handleMessage);
    socket.on("typing", handleTyping);

    // Cleanup: unsubscribe from old listeners when conversation changes or unmounts
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
      socket.off("joined_room", handleJoinedRoom);
      socket.off("join_error", handleJoinError);
      socket.off("receive_message", handleMessage);
      socket.off("typing", handleTyping);
    };
  }, [selectedMatchId, selectedMatch, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleSend = async (event) => {
    event.preventDefault();

    if (!content.trim() || !selectedMatchId) return;

    const payload = {
      conversationId: selectedMatchId,
      senderId: user._id || user.id,
      content: content.trim(),
    };

    connectSocket();

    if (socket.connected) {
      emitMessage(payload);
      setContent("");
      return;
    }

    const response = await sendChatMessage({
      conversationId: selectedMatchId,
      content: content.trim(),
    });

    const chatMsg = response.chatMessage;
    if (chatMsg) {
      const msgId = chatMsg._id || chatMsg.id;
      if (msgId) {
        seenMessageIds.current.add(msgId);
      }
      setMessages((current) => {
        if (msgId && current.some((m) => (m._id || m.id) === msgId)) {
          return current;
        }
        return [...current, chatMsg];
      });
    }
    setContent("");
  };

  return (
    <section className="chat-layout">
      <aside className="panel chat-sidebar">
        <div className="section-header">
          <div>
            <p className="eyebrow">Matches</p>
            <h2>Conversation list</h2>
          </div>
        </div>

        {hasMatches ? (
          <div className="stack compact">
            {matches.map((match) => (
              <button
                key={match._id}
                type="button"
                className={selectedMatchId === match._id ? "match-pill active" : "match-pill"}
                onClick={() => {
                  setSelectedMatchId(match._id);
                  onPickMatch?.({ matchId: match._id, peerName: otherUserName(match) });
                }}
              >
                {otherUserName(match)}
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="muted">No matches yet.</p>
            <p className="muted">Go to Match to find someone before chatting.</p>
          </div>
        )}
      </aside>

      <section className="panel chat-panel">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Chat</p>
            <h1>{selectedMatch ? otherUserName(selectedMatch) : "Pick a match"}</h1>
          </div>
          <span className={socket.connected ? "pill success" : "pill"}>
            {socket.connected ? "Live" : "Fallback"}
          </span>
        </div>

        {selectedMatchId ? (
          <>
            <div className="chat-history">
              {status || roomError ? <p className="muted">{status || roomError}</p> : null}
              {messages.length ? (
                messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isMine={String(message.sender?._id || message.sender) === String(user._id || user.id)}
                    peerName={selectedMatch ? otherUserName(selectedMatch) : "Match"}
                    myName={user?.name || "Me"}
                  />
                ))
              ) : (
                <div className="empty-chat">
                  <p className="muted">No messages yet.</p>
                  <p className="muted">Say hello and start the conversation.</p>
                </div>
              )}
              {typingUser && (
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="typing-text">{typingUser} is typing...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className="chat-form" onSubmit={handleSend}>
              <input
                placeholder={isRoomReady ? "Type a message..." : "Connecting to chat room..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!isRoomReady}
              />
              <button className="btn primary" type="submit" disabled={!isRoomReady}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <p className="muted">Pick a match from the left to start chatting.</p>
            <button type="button" className="btn secondary" onClick={onGoMatch}>
              Go to Match
            </button>
          </div>
        )}
      </section>
    </section>
  );
};

export default Chat;
