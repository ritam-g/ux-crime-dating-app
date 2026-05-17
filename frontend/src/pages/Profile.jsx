import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile } from "../services/api.js";
import { playSound, pick } from "../chaos/ChaosEngine.js";

/**
 * @description Loads and updates the current user's profile with unhinged metric telemetry.
 * @returns A profile form.
 * @route GET /api/user/profile
 * @route PUT /api/user/profile
 * @access Private
 */
const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
    interests: "",
  });
  const [message, setMessage] = useState("");

  // Cursed states
  const [scanningAura, setScanningAura] = useState(false);
  const [auraScore, setAuraScore] = useState(null);
  const [baggageScore, setBaggageScore] = useState(78);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "",
        bio: user.bio || "",
        interests: Array.isArray(user.interests) ? user.interests.join(", ") : "",
      });
      // Pre-populate some random baggage metric
      setAuraScore(Math.floor(Math.random() * 800 - 400));
    }
  }, [user]);

  const handleScanAura = () => {
    setScanningAura(true);
    playSound("error", 0.2);
    setTimeout(() => {
      setScanningAura(false);
      const newScore = Math.floor(Math.random() * 1000 - 800);
      setAuraScore(newScore);
      playSound("vine", 0.5);
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Cursed interaction: typing changes baggage score randomly
    setBaggageScore((prev) => Math.min(100, Math.max(10, prev + (Math.random() > 0.5 ? 2 : -2))));
    if (Math.random() < 0.15) {
      playSound("pop", 0.05);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    playSound("ding", 0.5);

    try {
      await updateProfile({
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        bio: form.bio,
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      await refreshUser();
      setMessage("⚠️ PROFILE RIZZ UPGRADED SUCCESSFULLY. YOUR DATA IS NOW PART OF COGNITIVE TRAINING SETS.");
      playSound("nyan", 0.05);
    } catch (err) {
      setMessage("Failed to save changes. Please try crying about it.");
      playSound("sad");
    }
  };

  return (
    <section className="panel border-2 border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-2 right-4 text-[9px] font-mono text-rose-500/20">
        SUBJECT TELEMETRY INTERFACE
      </div>

      <p className="eyebrow text-rose-450 tracking-widest uppercase">Self-Deception Center</p>
      <h1 className="text-3xl font-black text-white italic tracking-wide">Optimize your digital lure.</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Side: Cursed Interactive Stats Panels */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Aura Scanner */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">🧠 AURA TRACKING</h3>
            <div className="text-center py-4">
              {scanningAura ? (
                <div className="text-sm font-semibold text-rose-400 animate-pulse">
                  INGESTING METRICS...
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className={`text-3xl font-black ${auraScore >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                    {auraScore !== null ? `${auraScore} pts` : "NOT SCANNED"}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">COSMIC AURA SCORE</span>
                </div>
              )}
            </div>
            <button
              onClick={handleScanAura}
              className="w-full bg-rose-500/10 border border-rose-500/35 text-rose-300 font-bold py-2 rounded-xl text-xs hover:bg-rose-500/20 active:scale-95 transition-all"
            >
              Scan Aura Score
            </button>
          </div>

          {/* Emotional Baggage Factor */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">💼 BAGGAGE TELEMETRY</h3>
              <span className="text-xs text-rose-450 font-bold font-mono">{baggageScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${baggageScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-light">
              This score reflects how frequently you check your ex's social media and type paragraphs in response to "k".
            </p>
          </div>
        </div>

        {/* Right Side: The Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="form-grid bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
            <label className="flex flex-col gap-2">
              <span className="text-slate-350 font-semibold text-xs uppercase tracking-widest">Public Label (Name)</span>
              <input
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-slate-350 font-semibold text-xs uppercase tracking-widest">Rot Factor (Age)</span>
              <input
                type="number"
                value={form.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-slate-350 font-semibold text-xs uppercase tracking-widest">Gender Target</span>
              <input
                value={form.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
              />
            </label>
            <label className="full flex flex-col gap-2">
              <span className="text-slate-350 font-semibold text-xs uppercase tracking-widest">Propaganda Bio</span>
              <textarea
                rows="3"
                value={form.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none resize-none"
              />
            </label>
            <label className="full flex flex-col gap-2">
              <span className="text-slate-350 font-semibold text-xs uppercase tracking-widest">Red Flags (Interests, separated by commas)</span>
              <input
                value={form.interests}
                onChange={(e) => handleInputChange("interests", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 transition-all outline-none"
              />
            </label>

            {message ? (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl full animate-pulse mt-2">
                {message}
              </p>
            ) : null}

            <button
              className="btn primary full mt-4 py-3.5 rounded-full font-black text-sm tracking-widest bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all shadow-lg shadow-rose-500/10"
              type="submit"
            >
              SAVE CHANGES & CONSOLE FEELINGS
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Profile;
