import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { playSound } from "../chaos/ChaosEngine.js";

/**
 * @description Logs the user in through the backend cookie auth flow with maximum emotional friction.
 * @returns A login form.
 * @route POST /api/auth/login
 * @access Public
 */
const Login = ({ onGoRegister }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Runaway button state
  const [escapeCount, setEscapeCount] = useState(0);
  const [btnStyle, setBtnStyle] = useState({});

  useEffect(() => {
    // Autoplay spooky sound on page load
    playSound("error", 0.1);
  }, []);

  const handleButtonHover = () => {
    if (escapeCount < 4) {
      const randomX = (Math.random() - 0.5) * 240;
      const randomY = (Math.random() - 0.5) * 160;
      setBtnStyle({
        transform: `translate(${randomX}px, ${randomY}px)`,
        transition: "all 0.15s ease-out",
        position: "relative",
        zIndex: 50,
      });
      setEscapeCount((c) => c + 1);
      playSound("sad", 0.3);
    } else {
      setBtnStyle({});
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Reset runaway button occasionally to build hope
    if (Math.random() < 0.2) {
      setEscapeCount(0);
      setBtnStyle({});
    }
  };

  const getPasswordInsult = (pass) => {
    if (!pass) return "";
    if (pass.length < 6) return "⚠️ WEAK (Just like your chat openers)";
    if (pass.length < 10) return "⚠️ UNREMARKABLE (Average, like your profile pic)";
    return "✅ STRONG (Strong password, weak emotional intelligence)";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    playSound("vine", 0.5);

    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed miserably.");
      playSound("error", 0.5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel relative overflow-hidden">
      {/* Glitch Aesthetic */}
      <div className="absolute top-2 right-4 text-[10px] font-mono text-rose-500/40 animate-pulse">
        RIZZ SURVEILLANCE ENABLED
      </div>
      <p className="eyebrow text-rose-450 tracking-widest uppercase">Welcome back, victim</p>
      <h1 className="text-3xl font-black text-white italic tracking-wide">Log in to continue the chaos.</h1>

      <form onSubmit={handleSubmit} className="form-grid mt-6">
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Corporate Tracking Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleFormChange("email", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:border-rose-500 transition-all outline-none"
            placeholder="your.crush@ignoring-you.com"
            required
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Secret Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:border-rose-500 transition-all outline-none"
            placeholder="••••••••••••"
            required
          />
          {form.password && (
            <p className="text-[10px] font-bold text-rose-400 mt-1 italic animate-pulse">
              {getPasswordInsult(form.password)}
            </p>
          )}
        </label>

        {error ? (
          <p className="error-text text-rose-500 text-xs font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl full">
            ❌ {error}
          </p>
        ) : null}

        <div className="full flex justify-center mt-4">
          <button
            onMouseEnter={handleButtonHover}
            className="btn primary px-8 py-3.5 rounded-full font-extrabold text-sm tracking-widest uppercase bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/20"
            type="submit"
            style={btnStyle}
            disabled={loading}
          >
            {loading ? "SURRENDERING SESSION..." : "SUBMIT RIZZ CREDENTIALS"}
          </button>
        </div>
      </form>

      <p className="switch-text text-slate-400 text-xs mt-6 text-center">
        New here?{" "}
        <button type="button" className="text-rose-400 hover:text-rose-300 underline font-semibold ml-1" onClick={onGoRegister}>
          Create an account to get rejected
        </button>
      </p>
    </section>
  );
};

export default Login;
