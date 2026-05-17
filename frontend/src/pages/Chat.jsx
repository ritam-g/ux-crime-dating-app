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
import { playSound } from "../chaos/ChaosEngine.js";
import ChaosVideoPlayer from "../components/ChaosVideoPlayer.jsx";
import { playChaosVideo, playChaosAudio, stopChaosMedia } from "../utils/chaosTriggers.js";
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
const TOXIC_SUGGESTIONS = [
  "I'm not usually into average people, but you seem like a fun experiment.",
  "Sorry, my dog ran away and I had to learn how to code a dating app. What's your excuse for replying late?",
  "My therapist said I should make more questionable choices, so here I am talking to you.",
  "I love how you have absolutely no fear of posting that profile picture.",
  "Please don't fall in love with me, my schedule is fully booked with tax evasion.",
  "You write exactly like someone who uses a spreadsheet to calculate tips.",
  "I see you're an empath. Does that mean you can feel how boring this conversation is?",
];

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
  const [activeMemeVideo, setActiveMemeVideo] = useState(null);
  
  const bottomRef = useRef(null);
  const seenMessageIds = useRef(new Set());
  const memeTimerRef = useRef(null);

  const selectedMatch = useMemo(
    () => matches.find((match) => match._id === selectedMatchId) || null,
    [matches, selectedMatchId]
  );

  const hasMatches = matches.length > 0;

  // Double text detection
  const isDoubleTexting = useMemo(() => {
    if (!messages.length) return false;
    const lastMsg = messages[messages.length - 1];
    const lastSenderId = lastMsg.sender?._id || lastMsg.sender;
    const currentUserId = user?._id || user?.id;
    return String(lastSenderId) === String(currentUserId);
  }, [messages, user]);

  const handleSuggestToxic = () => {
    const randomReply = TOXIC_SUGGESTIONS[Math.floor(Math.random() * TOXIC_SUGGESTIONS.length)];
    setContent(randomReply);
    playSound("ding", 0.5);
  };

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
  }, [activeMatch]);

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

      // Cursed audio cue: Play a pop or funny sound when they text
      const isPeer = String(incomingMessage.sender?._id || incomingMessage.sender) !== String(user._id || user.id);
      if (isPeer) {
        playSound("error", 0.4);
        
        // Peer responded: cancel waiting timer and close the active meme overlay immediately
        setActiveMemeVideo(null);
        if (memeTimerRef.current) {
          clearTimeout(memeTimerRef.current);
          memeTimerRef.current = null;
        }
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
        
        // Peer typing detected: cancel wait countdown and close meme overlay immediately!
        setActiveMemeVideo(null);
        if (memeTimerRef.current) {
          clearTimeout(memeTimerRef.current);
          memeTimerRef.current = null;
        }
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
      if (memeTimerRef.current) {
        clearTimeout(memeTimerRef.current);
      }
      setActiveMemeVideo(null);
      
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

    // Start wait inactivity countdown (5.0 seconds) for meme disruption
    if (memeTimerRef.current) {
      clearTimeout(memeTimerRef.current);
    }
    setActiveMemeVideo(null);

    memeTimerRef.current = setTimeout(() => {
      if (typingUser) return; // Suppress if peer is actively typing
      const randomMeme = playChaosVideo("ignored");
      if (randomMeme) {
        setActiveMemeVideo(randomMeme);
      }
    }, 5000);

    const payload = {
      conversationId: selectedMatchId,
      senderId: user._id || user.id,
      content: content.trim(),
    };

    connectSocket();
    
    // Cursed UX: Play sound when user sends
    playSound("pop", 0.3);

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
    <section className="chat-layout flex flex-col md:flex-row gap-6 mt-4">
      <aside className="panel chat-sidebar border-2 border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden md:w-80 shrink-0">
        <div className="section-header border-b border-slate-800/60 pb-4">
          <div>
            <p className="eyebrow text-rose-450 tracking-widest uppercase">Target Roster</p>
            <h2 className="text-xl font-black text-white italic">Conversation List</h2>
          </div>
        </div>

        {hasMatches ? (
          <div className="stack compact flex flex-col gap-2 mt-4">
            {matches.map((match) => (
              <button
                key={match._id}
                type="button"
                className={`match-pill flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                  selectedMatchId === match._id 
                    ? "bg-rose-500/20 border border-rose-500/50 text-white font-bold" 
                    : "bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10"
                }`}
                onClick={() => {
                  setSelectedMatchId(match._id);
                  onPickMatch?.({ matchId: match._id, peerName: otherUserName(match) });
                }}
              >
                <span>{otherUserName(match)}</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">CAPTURED</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state py-8 text-center bg-rose-950/10 border border-rose-500/5 rounded-2xl mt-4">
            <p className="text-sm font-bold text-slate-400">NO ACQUIRED TARGETS</p>
            <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mt-2 leading-relaxed">
              Go to Match to acquire target candidates before opening chat telemetry.
            </p>
          </div>
        )}
      </aside>

      <section className="panel chat-panel flex-1 border-2 border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
        <div className="chat-header flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
          <div>
            <p className="eyebrow text-rose-450 tracking-widest uppercase">TELEPATHIC TERMINAL</p>
            <h1 className="text-2xl font-black text-white italic">{selectedMatch ? otherUserName(selectedMatch) : "Pick a Hostage"}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${socket.connected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-455 border border-rose-500/40 animate-pulse"}`}>
            {socket.connected ? "LIVE WIRE" : "DELAYED RELAY"}
          </span>
        </div>

        {selectedMatchId ? (
          <>
            <div className="chat-history flex-1 overflow-y-auto pr-2 max-h-[360px] min-h-[280px]">
              {status || roomError ? <p className="text-xs font-mono text-rose-400/60 text-center my-4 animate-pulse">{status || roomError}</p> : null}
              {messages.length ? (
                messages.map((message) => (
                  <MessageBubble
                    key={message._id || message.id}
                    message={message}
                    isMine={String(message.sender?._id || message.sender) === String(user._id || user.id)}
                    peerName={selectedMatch ? otherUserName(selectedMatch) : "Match"}
                    myName={user?.name || "Me"}
                  />
                ))
              ) : (
                <div className="empty-chat py-12 text-center flex flex-col gap-2 justify-center items-center">
                  <span className="text-2xl">🤫</span>
                  <p className="text-sm font-bold text-slate-400">RADIO SILENCE</p>
                  <p className="text-[10px] text-slate-500">Initiate contact before they forget you exist.</p>
                </div>
              )}
              {typingUser && (
                <div className="typing-indicator flex items-center gap-2 py-2 text-[10px] text-rose-450 font-mono italic">
                  <span className="animate-pulse">● ● ●</span>
                  <span>{typingUser} is typing something full of regret...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Toxic Suggestions & Double text warnings wrapper */}
            <div className="mt-4 flex flex-col gap-2">
              {isDoubleTexting && (
                <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-bold tracking-wider px-3.5 py-2.5 rounded-xl uppercase animate-pulse flex items-center justify-between">
                  <span>⚠️ DOUBLE TEXT WARNING: DESPERATION LEVEL DETECTED &gt; 9000</span>
                  <span className="font-mono">CHANCE OF ANSWER: 0.12%</span>
                </div>
              )}

              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={handleSuggestToxic}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:from-amber-500/20 hover:to-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>💡 SUGGEST TOXIC REPLY</span>
                </button>
                <span className="text-[9px] font-mono text-slate-500">PROPRIETARY RIZZ AI</span>
              </div>
            </div>

            <form className="chat-form flex gap-3 mt-2" onSubmit={handleSend}>
              <input
                placeholder={isRoomReady ? "Type something risky..." : "Establishing neural socket link..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!isRoomReady}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-rose-500 transition-all outline-none text-sm placeholder-slate-500"
              />
              <button 
                className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all disabled:opacity-50" 
                type="submit" 
                disabled={!isRoomReady}
              >
                TRANSMIT
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat flex-1 flex flex-col justify-center items-center py-16 gap-3 text-center">
            <span className="text-4xl animate-spin text-rose-500">🌀</span>
            <p className="text-sm font-bold text-slate-400">NO TERMINAL OPEN</p>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Select an acquired victim from the side deck to interface directly with their message server.
            </p>
            <button type="button" className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-full text-xs hover:bg-white/10 transition-all" onClick={onGoMatch}>
              Find More Targets
            </button>
          </div>
        )}
      {activeMemeVideo && (
        <ChaosVideoPlayer
          videoAsset={activeMemeVideo}
          onClose={() => {
            setActiveMemeVideo(null);
            stopChaosMedia();
          }}
        />
      )}
      </section>
    </section>
  );
};

export default Chat;
