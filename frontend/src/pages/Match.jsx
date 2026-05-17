/**
 * @file Match.jsx
 * @description Matching screen that focuses on one user at a time.
 *
 * This view keeps the matching flow simple: load candidates, let the user
 * like or dislike one card, and open chat when the backend reports a match.
 */
import { useEffect, useMemo, useState } from "react";
import UserCard from "../components/UserCard.jsx";
import { getMatchUsers, dislikeUser, likeUser } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { playSound } from "../chaos/ChaosEngine.js";
import { playChaosAudio } from "../utils/chaosTriggers.js";

/**
 * @description Loads candidates and performs like/dislike actions against the API.
 * @returns A fully functional match screen.
 * @route GET /api/match/users
 * @route POST /api/match/like/:targetUserId
 * @route POST /api/match/dislike/:targetUserId
 * @access Private
 */
const Match = ({ onOpenChat }) => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("Loading users...");
  const [matchNotice, setMatchNotice] = useState("");
  const [pendingMatch, setPendingMatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [matchPopup, setMatchPopup] = useState(null);

  const loadUsers = async () => {
    try {
      setStatus("Loading users...");
      setMatchNotice("");
      setPendingMatch(null);

      const response = await getMatchUsers();
      const items = response.users || [];

      const filteredItems = items.filter(
        (item) => (item._id || item.id) !== (authUser?._id || authUser?.id)
      );

      setUsers(filteredItems);
      setStatus(filteredItems.length ? "" : "No more users available right now.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Failed to load users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [authUser]);

  const handleAction = async (targetUserId, action) => {
    if (actionLoading) return;

    setActionLoading(true);
    if (action === "like") {
      playChaosAudio("like_click");
    } else {
      playSound("sad", 0.4);
    }

    try {
      // Cursed UX: Suspense latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response =
        action === "like" ? await likeUser(targetUserId) : await dislikeUser(targetUserId);

      const removedUser = users.find((user) => (user._id || user.id) === targetUserId) || null;
      setUsers((current) => current.filter((user) => (user._id || user.id) !== targetUserId));

      if (action === "like" && response?.conversationId) {
        // Play local unhinged like success sound
        playChaosAudio("like_success");

        // Inflict physical shake chaos upon the layout
        document.body.classList.add("shake-chaos");
        setTimeout(() => {
          document.body.classList.remove("shake-chaos");
        }, 600);
        
        // Pick custom unhinged success quotes
        const quotes = [
          "You successfully unlocked emotional damage 💔",
          "Congratulations. Another bad decision added to your life."
        ];
        const pickedQuote = quotes[Math.floor(Math.random() * quotes.length)];

        setMatchPopup({
          matchId: response.conversationId,
          peerName: removedUser?.name || "Match",
          quote: pickedQuote
        });
      }
    } catch (error) {
      setStatus(error.response?.data?.message || "Action failed miserably. Try swiping harder.");
      playSound("error", 0.5);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async (targetUserId) => {
    await handleAction(targetUserId, "like");
  };

  const handleDislike = async (targetUserId) => {
    await handleAction(targetUserId, "dislike");
  };

  return (
    <section className="panel border-2 border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden">
      {/* Glitch Overlay */}
      <div className="absolute top-2 right-4 text-[9px] font-mono text-rose-500/20">
        PSYCHOLOGICAL EXPERIMENT #48A
      </div>

      <div className="section-header border-b border-slate-800/60 pb-4">
        <div>
          <p className="eyebrow text-rose-450 tracking-widest uppercase">Love Queue Surveillance</p>
          <h1 className="text-3xl font-black text-white italic tracking-wide">Pick your emotional hostage.</h1>
        </div>
        <button className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold rounded-full hover:bg-rose-500/20 active:scale-95 transition-all text-xs" onClick={loadUsers} disabled={actionLoading}>
          Reload Target Victims
        </button>
      </div>

      <div className="match-summary bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between mt-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AURA MONITOR & BILLING TERMS</p>
          <p className="text-xs text-slate-450 leading-relaxed mt-1 font-light max-w-2xl">
            Our proprietary algorithm queries <code>GET /api/match/users</code> to ingest high-value candidates. 
            Submitting <code>POST /api/match/like/:id</code> initiates binding emotional interest. Mutual alignment 
            allows you to unlock the live chat terminal (Standard messaging rates and aura fees apply).
          </p>
        </div>
        <div className="summary-pill bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl text-center shrink-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-rose-400 animate-pulse">{users.length}</span>
          <small className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">HOSTAGES LEFT</small>
        </div>
      </div>

      {matchPopup && (
        <div className="fixed inset-0 bg-slate-950/90 z-[9999] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-rose-500/40 p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden shadow-2xl shadow-rose-500/10">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl" />
            
            <span className="text-5xl animate-bounce block">🎉</span>
            <h2 className="text-2xl font-black text-white italic tracking-wide mt-4 uppercase">
              MUTUAL DESPERATION ALIGNED!
            </h2>
            <p className="text-sm text-slate-350 mt-4 leading-relaxed font-light font-mono bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              "{matchPopup.quote}"
            </p>
            
            <p className="text-[10px] text-rose-455 font-bold uppercase tracking-widest mt-6 animate-pulse">
              ⚠️ $1.99 HAS BEEN BILLED TO UNLOCK TELEPATHIC LINKS
            </p>

            <button
              onClick={() => {
                onOpenChat?.({
                  matchId: matchPopup.matchId,
                  peerName: matchPopup.peerName
                });
              }}
              className="w-full mt-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-lg hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all"
            >
              👉 Go to Matches
            </button>
          </div>
        </div>
      )}

      {status ? <p className="muted">{status}</p> : null}

      {users.length > 0 ? (
        <div className="flex flex-col gap-4 mt-6">
          {users.map((user) => (
            <UserCard
              key={user._id || user.id}
              user={user}
              onLike={handleLike}
              onDislike={handleDislike}
              disabled={actionLoading}
            />
          ))}
        </div>
      ) : (
        !status && (
          <div className="empty-chat flex flex-col items-center justify-center p-12 text-center bg-rose-950/20 border border-rose-500/10 rounded-3xl mt-6 gap-3">
            <span className="text-4xl animate-bounce">🤡</span>
            <h3 className="text-xl font-bold text-white tracking-wide">NO SUSCEPTIBLE HOSTAGES REMAINING</h3>
            <p className="text-slate-450 text-xs font-light max-w-sm leading-relaxed">
              You have exhausted the patience of every single user in our database. Perhaps you should try buying some Rizz Credits to bypass their high standards?
            </p>
            <button onClick={loadUsers} className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold rounded-full text-xs shadow-lg hover:scale-105 transition-all mt-2">
              RETRY DESPERATELY
            </button>
          </div>
        )
      )}
    </section>
  );
};

export default Match;
