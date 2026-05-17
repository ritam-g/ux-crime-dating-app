/**
 * @file Matches.jsx
 * @description Shows the user's matched conversations.
 *
 * This page is the bridge between matching and chat, letting the user pick a
 * match and jump straight into the conversation view.
 */
import { useEffect, useState } from "react";
import { getMyMatches } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * @description Loads matched users and lets the user open one for chat.
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
      setStatus("Loading matches...");
      const data = await getMyMatches();
      const items = data.matches || [];
      setMatches(items);
      setStatus(items.length ? "" : "No matches yet.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Failed to load matches.");
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const getOtherUser = (match) => {
    const initiatorId = match.initiator?._id || match.initiator?.id;
    const targetId = match.targetUser?._id || match.targetUser?.id;
    const currentUserId = user?.id;
    return initiatorId === currentUserId ? match.targetUser : match.initiator;
  };

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Matches</p>
          <h1>Your matched people.</h1>
        </div>
        <button className="btn secondary" onClick={loadMatches}>
          Refresh
        </button>
      </div>

      {status ? <p className="muted">{status}</p> : null}

      <div className="stack">
        {matches.map((match) => {
          const peer = getOtherUser(match);

          return (
            <article className="card" key={match._id}>
              <div className="card-header">
                <div>
                  <p className="eyebrow">Matched</p>
                  <h3>{peer?.name || "Match"}</h3>
                </div>
                <span className="pill">Live</span>
              </div>

              <p className="muted">{peer?.bio || "No bio available."}</p>

              <div className="button-row">
                <button type="button" className="btn primary" onClick={() => onOpenChat?.(match)}>
                  Open Chat
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Matches;
