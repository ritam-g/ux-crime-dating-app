/**
 * @file Navbar.jsx
 * @description Top navigation bar for the app screens.
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ChatEntryVideoOverlay from "./chaos/ChatEntryVideoOverlay.jsx";

/**
 * @description Renders primary navigation and logout controls.
 * @returns A navigation UI.
 * @route N/A
 * @access Public
 */
const Navbar = ({ currentScreen, onNavigate }) => {
  const { user, logout } = useAuth();
  const [showChatVideo, setShowChatVideo] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate("login");
  };

  const handleChatClick = () => {
    onNavigate("chat");
    setShowChatVideo(true);
  };

  return (
    <>
      {showChatVideo && <ChatEntryVideoOverlay onClose={() => setShowChatVideo(false)} />}
      <header className="navbar blinking-border">
        <div>
          <p className="brand">Love.exe</p>
          <p className="brand-subtitle">Not Responding</p>
        </div>

        <nav className="nav-actions">
          {user ? (
            <>
              <button className={currentScreen === "match" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("match")} data-chaos-tip="return to judgment">
                Match
              </button>
              <button className={currentScreen === "matches" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("matches")} data-chaos-tip="view mutual mistakes">
                Matches
              </button>
              <button className={currentScreen === "chat" ? "nav-btn active" : "nav-btn"} onClick={handleChatClick} data-chaos-tip="open emotional terminal">
                Chat
              </button>
              <button className={currentScreen === "profile" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("profile")} data-chaos-tip="edit the lure">
                Profile
              </button>
              <button className="nav-btn ghost" onClick={handleLogout} data-chaos-tip="rage quit">
                Logout
              </button>
            </>
          ) : (
            <>
              <button className={currentScreen === "login" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("login")} data-chaos-tip="re-enter the system">
                Login
              </button>
              <button className={currentScreen === "register" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("register")} data-chaos-tip="create liability">
                Register
              </button>
            </>
          )}
        </nav>
      </header>
    </>
  );
};

export default Navbar;
