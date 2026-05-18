import { playSound } from "../chaos/ChaosEngine.js";

/**
 * @description Shows a candidate user card with extreme visual premium styling, cursed metadata badges and animations.
 * @returns A user card UI.
 * @route N/A
 * @access Public
 */
const UserCard = ({ user, onLike, onDislike, disabled = false }) => {
  // Cursed badges randomizer
  const cursedBadges = [
    { text: "🚨 TOXIC TRAIT", color: "bg-rose-500/10 text-rose-400 border-rose-500/25" },
    { text: "⚠️ ATTACHMENT RISK", color: "bg-amber-500/10 text-amber-400 border-amber-500/25" },
    { text: "🤡 ZERO RIZZ telemetry", color: "bg-violet-500/10 text-violet-400 border-violet-500/25" },
    { text: "💰 DEBT PRONE", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" }
  ];

  // Pick one random cursed badge for maximum insecurity seeding
  const assignedBadge = cursedBadges[Math.floor((user.name || "").length % cursedBadges.length)];

  return (
    <article className="user-card flex flex-col md:flex-row md:items-center justify-between gap-6 p-7 bg-slate-900/60 border border-slate-800 rounded-3xl w-full shadow-2xl hover:border-rose-500/30 hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group fake-loading-flash" data-chaos-label="candidate unstable">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Left Column: User details */}
      <div className="flex-1 min-w-0 z-10 flex items-start gap-4">
        {/* User Mugshot Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center relative shadow-md">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🤡</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-black text-white tracking-wide italic glitch-text">{user.name}</h3>
          
          <span className="px-3.5 py-0.5 text-xs font-black rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
            {user.age || "?"} Y/O
          </span>

          <span className={`px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase border rounded-full ${assignedBadge.color}`}>
            {assignedBadge.text}
          </span>
        </div>

        <p className="text-xs font-black text-rose-450 mt-1.5 uppercase tracking-widest">{user.gender || "Undefined Entity"}</p>
        
        <p className="text-xs text-slate-350 mt-3 leading-relaxed break-words font-light">
          "{user.bio || "No custom propaganda bio provided. Probably a bot or a highly dangerous threat vector."}"
        </p>
        
        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(user.interests || []).slice(0, 5).map((interest) => (
            <span 
              className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/5 text-slate-400 border border-white/5 hover:border-slate-500 hover:text-white transition-colors cursor-help" 
              key={interest}
              title="Algorithm flagged interest as toxic"
            >
              #{interest}
            </span>
          ))}
        </div>
      </div>
    </div>

      {/* Right Column: Like and Dislike buttons side-by-side with details */}
      <div className="flex flex-row gap-3 items-center shrink-0 z-10">
        <button
          className="cursed-button px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => {
            playSound("sad", 0.4);
            onDislike(user._id || user.id);
          }}
          disabled={disabled}
          data-chaos-tip="reject with ceremony"
        >
          EXECUTE DISLIKE
        </button>
        <button
          className="cursed-button px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => {
            playSound("vine", 0.5);
            onLike(user._id || user.id);
          }}
          disabled={disabled}
          data-chaos-tip="bad decision accelerator"
        >
          INITIATE LIKE
        </button>
      </div>
    </article>
  );
};

export default UserCard;
