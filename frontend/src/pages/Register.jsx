import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { playSound } from "../chaos/ChaosEngine.js";

/**
 * @description Registers a new user and stores the auth cookie under heavy duress.
 * @returns A registration form.
 * @route POST /api/auth/register
 * @access Public
 */
const Register = ({ onGoLogin }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    bio: "",
    interests: "music,coffee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Runaway button state
  const [escapeCount, setEscapeCount] = useState(0);
  const [btnStyle, setBtnStyle] = useState({});

  const handleButtonHover = () => {
    if (escapeCount < 3) {
      const randomX = (Math.random() - 0.5) * 220;
      const randomY = (Math.random() - 0.5) * 140;
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
    if (Math.random() < 0.1) {
      playSound("pop", 0.1);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    playSound("vine", 0.5);

    try {
      await register({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed miserably.");
      playSound("error", 0.5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel relative overflow-hidden">
      <div className="absolute top-2 right-4 text-[10px] font-mono text-rose-500/40 animate-pulse">
        AURA RATING LOGGED BY SYSTEM
      </div>
      <p className="eyebrow text-rose-450 tracking-widest uppercase">Sign up for emotional toll</p>
      <h1 className="text-3xl font-black text-white italic tracking-wide">Create your profile.</h1>

      <form onSubmit={handleSubmit} className="form-grid mt-6">
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Fake Display Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
            placeholder="John Doe (or your real cringe alias)"
            required
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Spam Ingestion Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleFormChange("email", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
            placeholder="victim@love.exe"
            required
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Cursed Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
            placeholder="Make it strong, life is weak"
            required
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Physical Age (Years of Suffering)</span>
          <input
            type="number"
            value={form.age}
            onChange={(e) => handleFormChange("age", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
            placeholder="99"
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="text-slate-300 font-semibold text-sm">Societal Gender Role</span>
          <input
            type="text"
            value={form.gender}
            onChange={(e) => handleFormChange("gender", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
            placeholder="Male / Empath / Attack Helicopter"
          />
        </label>
        
        <label className="flex flex-col gap-2 full">
          <span className="text-slate-300 font-semibold text-sm">Desperate dating bio (Lie to look good)</span>
          <textarea
            value={form.bio}
            onChange={(e) => handleFormChange("bio", e.target.value)}
            rows="3"
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none resize-none"
            placeholder="Looking for a partner in crime (preferably tax evasion)"
          />
        </label>
        
        <label className="flex flex-col gap-2 full">
          <span className="text-slate-300 font-semibold text-sm">Interests (Comma-separated red flags)</span>
          <input
            type="text"
            value={form.interests}
            onChange={(e) => handleFormChange("interests", e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
            placeholder="red flags, coffee, toxic traits"
          />
          <span className="text-[10px] text-rose-450 italic mt-1 animate-pulse">
            ⚠️ Warning: Entering "coffee" or "gaming" decreases matching odds by 87%.
          </span>
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
            {loading ? "INITIALIZING RIZZ ACCOUNT..." : "REGISTER TO GET REJECTED"}
          </button>
        </div>
      </form>

      <p className="switch-text text-slate-400 text-xs mt-6 text-center">
        Already have an account?{" "}
        <button type="button" className="text-rose-400 hover:text-rose-300 underline font-semibold ml-1" onClick={onGoLogin}>
          Go to Login
        </button>
      </p>
    </section>
  );
};

export default Register;
