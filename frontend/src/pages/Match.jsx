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
    try {
      const response =
        action === "like" ? await likeUser(targetUserId) : await dislikeUser(targetUserId);

      const removedUser = users.find((user) => (user._id || user.id) === targetUserId) || null;
      setUsers((current) => current.filter((user) => (user._id || user.id) !== targetUserId));

      if (action === "like" && response?.conversationId) {
        onOpenChat?.({
          matchId: response.conversationId,
          peerName: removedUser?.name || "Match",
        });
      }
    } catch (error) {
      setStatus(error.response?.data?.message || "Action failed. Please try again.");
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
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Matching</p>
          <h1>Pick people from the queue.</h1>
        </div>
        <button className="btn secondary" onClick={loadUsers} disabled={actionLoading}>
          Refresh
        </button>
      </div>

      <div className="match-summary">
        <div>
          <p className="muted">How it works</p>
          <p className="summary-copy">
            The frontend calls <code>GET /api/match/users</code> to load cards, then sends
            <code>POST /api/match/like/:id</code> or <code>POST /api/match/dislike/:id</code>.
            If the backend returns a mutual match, you can open chat right away.
          </p>
        </div>
        <div className="summary-pill">
          <span>{users.length}</span>
          <small>cards left</small>
        </div>
      </div>

      {matchNotice ? (
        <div className="match-banner">
          <p className="success-text">{matchNotice}</p>
          {pendingMatch?.matchId ? (
            <button className="btn primary" onClick={() => onOpenChat?.(pendingMatch)}>
              Open chat
            </button>
          ) : null}
        </div>
      ) : null}

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
          <div className="empty-chat">
            <p className="muted">No users left to review.</p>
            <p className="muted">Refresh later or check chat after a match.</p>
          </div>
        )
      )}
    </section>
  );
};

export default Match;
