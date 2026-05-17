/**
 * @file UserCard.jsx
 * @description Small profile card used in the matching view.
 *
 * This component renders a single candidate so the user can quickly decide
 * whether to like or dislike them without dealing with extra UI noise.
 */

/**
 * @description Shows a candidate user and lets the current user choose an action.
 * @returns A user card UI.
 * @route N/A
 * @access Public
 */
const UserCard = ({ user, onLike, onDislike, disabled = false }) => {
  return (
    <article className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl w-full shadow-xl hover:border-white/20 transition-all duration-300 ">
      {/* Left Column: User details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-wide">{user.name}</h3>
          <span className="px-3 py-0.5 text-sm font-semibold rounded-full bg-white/10 text-rose-300 border border-white/10">
            {user.age || "?"} y/o
          </span>
        </div>
        <p className="text-sm font-medium text-rose-450 mt-1 uppercase tracking-wider">{user.gender || "Unknown gender"}</p>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed break-words font-light">{user.bio || "No bio yet."}</p>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(user.interests || []).slice(0, 4).map((interest) => (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/5 text-slate-350 border border-white/5 hover:bg-white/10 transition-colors" key={interest}>
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Right Column: Like and Dislike buttons side-by-side with details */}
      <div className="flex flex-row gap-3 items-center shrink-0">
        <button
          className="px-6 py-3 text-sm font-bold rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => onDislike(user._id || user.id)}
          disabled={disabled}
        >
          Dislike & block
        </button>
        <button
          className="px-6 py-3 text-sm font-bold rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          onClick={() => onLike(user._id || user.id)}
          disabled={disabled}
        >
          Like & chat
        </button>
      </div>
    </article>
  );
};

export default UserCard;
