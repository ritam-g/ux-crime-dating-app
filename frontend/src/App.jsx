/**
 * @file App.jsx
 * @description Main frontend shell for auth, matching, profile, and chat screens.
 *
 * This component keeps the app API-first by loading real backend data and
 * switching between views without introducing unnecessary routing complexity.
 */
import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Match from "./pages/Match.jsx";
import Matches from "./pages/Matches.jsx";
import Chat from "./pages/Chat.jsx";
import "./App.css";

const AuthGate = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState("login");
  const [activeMatch, setActiveMatch] = useState(null);

  useEffect(() => {
    if (!user) {
      setScreen("login");
    } else if (screen === "login" || screen === "register") {
      setScreen("match");
    }
  }, [user, screen]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="panel hero-panel">
          <p className="eyebrow">Loading session</p>
          <h1>Checking your cookie-auth session...</h1>
        </div>
      );
    }

    if (!user) {
      return screen === "register" ? (
        <Register onGoLogin={() => setScreen("login")} />
      ) : (
        <Login onGoRegister={() => setScreen("register")} />
      );
    }

    if (screen === "profile") {
      return <Profile />;
    }

    if (screen === "matches") {
      return (
        <Matches
          onOpenChat={(match) => {
            setActiveMatch({
              matchId: match._id,
              peerName: match.initiator?.name || match.targetUser?.name,
            });
            setScreen("chat");
          }}
        />
      );
    }

    if (screen === "chat") {
      return (
        <Chat
          activeMatch={activeMatch}
          onPickMatch={setActiveMatch}
          onGoMatch={() => setScreen("match")}
        />
      );
    }

    return (
      <Match
        onOpenChat={(match) => {
          setActiveMatch(match);
          setScreen("chat");
        }}
      />
    );
  }, [activeMatch, loading, screen, user]);

  return (
    <div className="app-shell">
      <Navbar currentScreen={screen} onNavigate={setScreen} />
      <main className="app-main">{content}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
