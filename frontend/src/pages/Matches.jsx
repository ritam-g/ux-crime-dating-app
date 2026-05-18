import { useEffect, useState } from "react";
import { getMyMatches, getOtherParticipant } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { playSound } from "../chaos/ChaosEngine.js";
import { playChaosAudio } from "../utils/chaosTriggers.js";

/**
 * @description Loads matched users and lets the user open one for chat with maximum legal and emotional liability.
 * @returns A matches list page.
 * @route GET /api/match/my-matches
 * @access Private
 */
const Matches = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState("Loading matches...");

  const loadMatches = async () => {
    try {
      setStatus("Scanning for mutual desperation signals...");
      const data = await getMyMatches();
      const items = data.matches || [];
      setMatches(items);
      setStatus(items.length ? "" : "No hostages captured yet.");
      if (items.length) {
        playSound("nyan", 0.05);
      }
    } catch (error) {
      setStatus(error.response?.data?.message || "Desperation telemetry failed.");
      playSound("error", 0.4);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const getOtherUser = (match) => {
    return getOtherParticipant(match, user?._id || user?.id);
  };

  return (
    <section className="panel border-2 border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-2 right-4 text-[9px] font-mono text-rose-500/20">
        AURA INTERCEPTION NETWORK
      </div>

      <div className="section-header border-b border-slate-800/60 pb-4">
        <div>
          <p className="eyebrow text-rose-450 tracking-widest uppercase">Mutual Hostages</p>
          <h1 className="text-3xl font-black text-white italic tracking-wide">Desperation Alignment Roster.</h1>
        </div>
        <button className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold rounded-full hover:bg-rose-500/20 active:scale-95 transition-all text-xs" onClick={loadMatches}>
          Scan For Rizz Sync
        </button>
      </div>

      {status ? (
        <p className="text-xs font-mono text-rose-400/60 text-center my-8 animate-pulse">{status}</p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {matches.map((match) => {
          const peer = getOtherUser(match);
          const hostageRizzRating = Math.floor(Math.random() * 90 + 10);

          return (
            <article className="card bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300" key={match._id}>
              {/* Card Glitch corner */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />

              <div className="card-header flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {/* Match Thumbnail Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center relative shadow-sm">
                    {peer?.profileImage ? (
                      <img src={peer.profileImage} alt={peer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🤡</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-rose-450 font-bold uppercase tracking-widest">ALIGNED INTERESTS</p>
                    <h3 className="text-lg font-black text-white mt-1 italic tracking-wide">{peer?.name || "Target Match"}</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                  Desperate
                </span>
              </div>

              <p className="text-xs text-slate-400 font-light leading-relaxed">
                "{peer?.bio || "No propaganda bio provided. High threat indicator."}"
              </p>

              {/* Fake compatibility gauge */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">Target Rizz Rating</span>
                <span className="text-rose-400 font-bold">{hostageRizzRating}% Compat</span>
              </div>

              <div className="button-row mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg shadow-rose-500/5 hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  onClick={() => {
                    playSound("vine", 0.5);
                    onOpenChat?.(match);
                  }}
                >
                  <span>💡 DEPLOY TELEPATHIC INTERFACE</span>
                </button>
                <span className="text-[8px] font-light text-slate-500 text-center uppercase tracking-wider block mt-1">
                  ⚠️ WARNING: CLICKING DEPLOYS FULL LEGAL LIABILITY FOR AWKWARD CHAT STARTERS.
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Matches;
