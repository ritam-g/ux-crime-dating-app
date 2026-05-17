/**
 * @file Navbar.jsx
 * @description Top navigation bar for the app screens.
 */
import { useAuth } from "../context/AuthContext.jsx";

/**
 * @description Renders primary navigation and logout controls.
 * @returns A navigation UI.
 * @route N/A
 * @access Public
 */
const Navbar = ({ currentScreen, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate("login");
  };

  return (
    <header className="navbar">
      <div>
        <p className="brand">Love.exe</p>
        <p className="brand-subtitle">Not Responding</p>
      </div>

      <nav className="nav-actions">
        {user ? (
          <>
            <button className={currentScreen === "match" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("match")}>
              Match
            </button>
            <button className={currentScreen === "matches" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("matches")}>
              Matches
            </button>
            <button className={currentScreen === "chat" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("chat")}>
              Chat
            </button>
            <button className={currentScreen === "profile" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("profile")}>
              Profile
            </button>
            <button className="nav-btn ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className={currentScreen === "login" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("login")}>
              Login
            </button>
            <button className={currentScreen === "register" ? "nav-btn active" : "nav-btn"} onClick={() => onNavigate("register")}>
              Register
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
