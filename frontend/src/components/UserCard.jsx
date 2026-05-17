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
const UserCard = ({ user, onLike, onDislike, disabled = false, compact = false }) => {
  return (
    <article className={compact ? "card user-card compact" : "card user-card"}>
      <div className="card-header">
        <div>
          <p className="eyebrow">Potential match</p>
          <h3>{user.name}</h3>
        </div>
        <span className="pill">{user.age || "?"}</span>
      </div>

      <p className="muted">{user.gender || "Unknown gender"}</p>
      <p className="bio">{user.bio || "No bio yet."}</p>

      <div className="chip-row">
        {(user.interests || []).slice(0, 4).map((interest) => (
          <span className="chip" key={interest}>
            {interest}
          </span>
        ))}
      </div>

      <div className="button-row">
        <button
          className="btn secondary"
          onClick={() => onDislike(user._id || user.id)}
          disabled={disabled}
        >
          Dislike
        </button>
        <button
          className="btn primary"
          onClick={() => onLike(user._id || user.id)}
          disabled={disabled}
        >
          Like
        </button>
      </div>
    </article>
  );
};

export default UserCard;
