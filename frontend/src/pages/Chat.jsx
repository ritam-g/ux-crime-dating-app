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

    const initiatorId = match.initiator?._id || match.initiator?.id;
    const other = initiatorId === user.id ? match.targetUser : match.initiator;

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

  const loadHistory = async (matchId) => {
    if (!matchId) return;

    setStatus("Loading chat history...");
    const response = await getChatHistory(matchId);
    const history = response.messages || [];
    seenMessageIds.current = new Set(history.map((message) => message._id));
    setMessages(history);
    setStatus("");
  };

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatchId) return;

    loadHistory(selectedMatchId);
    connectSocket();
    joinRoom(selectedMatchId);
  }, [selectedMatchId]);

  useEffect(() => {
    const handleMessage = (incomingMessage) => {
      const incomingId = incomingMessage._id || incomingMessage.id;
      const incomingMatchId = incomingMessage.matchId?._id || incomingMessage.matchId;

      if (String(incomingMatchId) !== String(selectedMatchId)) {
        return;
      }

      if (incomingId && seenMessageIds.current.has(incomingId)) {
        return;
      }

      if (incomingId) {
        seenMessageIds.current.add(incomingId);
      }

      setMessages((current) => [...current, incomingMessage]);
    };

    onReceiveMessage(handleMessage);
    return () => {
      offReceiveMessage(handleMessage);
    };
  }, [selectedMatchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();

    if (!content.trim() || !selectedMatchId) return;

    const payload = {
      matchId: selectedMatchId,
      senderId: user.id,
      content: content.trim(),
    };

    connectSocket();

    if (socket.connected) {
      emitMessage(payload);
      setContent("");
      return;
    }

    const response = await sendChatMessage({
      matchId: selectedMatchId,
      content: content.trim(),
    });

    if (response.chatMessage?._id) {
      seenMessageIds.current.add(response.chatMessage._id);
    }

    setMessages((current) => [...current, response.chatMessage]);
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
              {status ? <p className="muted">{status}</p> : null}
              {messages.length ? (
                messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isMine={(message.sender?._id || message.sender) === user.id}
                  />
                ))
              ) : (
                <div className="empty-chat">
                  <p className="muted">No messages yet.</p>
                  <p className="muted">Say hello and start the conversation.</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form className="chat-form" onSubmit={handleSend}>
              <input
                placeholder="Type a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!selectedMatchId}
              />
              <button className="btn primary" type="submit" disabled={!selectedMatchId}>
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
