import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { uploadProfileImage } from "../services/api.js";
import { playSound } from "../chaos/ChaosEngine.js";

/**
 * @description Registers a new user and stores the auth cookie under heavy duress.
 * @returns A registration form.
 * @route POST /api/auth/register
 * @access Public
 */
const Register = ({ onGoLogin }) => {
  const { register, refreshUser } = useAuth();
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

  // Profile Image states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Runaway button state
  const [escapeCount, setEscapeCount] = useState(0);
  const [btnStyle, setBtnStyle] = useState({});
  const [buttonStatus, setButtonStatus] = useState("🏃‍♂️ Agility: 100% (High escape energy)");

  const handleButtonHover = () => {
    if (escapeCount === 0) {
      setBtnStyle({
        transform: `translate(${Math.random() > 0.5 ? 120 : -120}px, ${Math.random() > 0.5 ? 40 : -40}px)`,
        transition: "all 0.2s ease-out",
        position: "relative",
        zIndex: 50,
      });
      setEscapeCount(1);
      setButtonStatus("🏃‍♂️ Agility: 50% (Slightly out of breath)");
      playSound("sad", 0.3);
    } else if (escapeCount === 1) {
      setBtnStyle({
        transform: `translate(${Math.random() > 0.5 ? -85 : 85}px, ${Math.random() > 0.5 ? -35 : 35}px)`,
        transition: "all 0.2s ease-out",
        position: "relative",
        zIndex: 50,
      });
      setEscapeCount(2);
      setButtonStatus("🥵 Agility: 10% (Severely fatigued)");
      playSound("sad", 0.3);
    } else if (escapeCount === 2) {
      setBtnStyle({});
      setEscapeCount(3);
      setButtonStatus("💤 Button Exhausted (Safe to click now)");
      playSound("pop", 0.3);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, JPEG, PNG, and WEBP supported!");
      playSound("sad");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Mugshot exceeds 5MB size limit!");
      playSound("sad");
      return;
    }

    setUploadError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    playSound("pop", 0.35);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (!value && !form.name && !form.email && !form.password) {
      setEscapeCount(0);
      setButtonStatus("🏃‍♂️ Agility: 100% (High escape energy)");
      setBtnStyle({});
    }
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

      // After successful registration, if there's a profile picture, upload it
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append("profileImage", selectedFile);
          await uploadProfileImage(formData);
          await refreshUser();
          playSound("nyan", 0.08);
        } catch (uploadErr) {
          console.error("Profile image upload failed after registration:", uploadErr);
          // Don't block registration success if image fails, just play sad sound
          playSound("sad");
        }
      }
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
        {/* Cursed Profile Mugshot Upload */}
        <div className="full bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex flex-col items-center gap-4 relative overflow-hidden mb-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 w-full justify-center">
            <span>📸</span> MUGSHOT UPLOADER
          </h3>
          
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-rose-500/30 bg-slate-950 flex items-center justify-center relative group shadow-inner">
              {previewUrl ? (
                <img src={previewUrl} alt="Mugshot Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl animate-bounce">🤡</div>
              )}
              
              <label className="absolute inset-0 bg-slate-950/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-[10px] text-white font-black tracking-widest font-mono">REPLACE FACE</span>
              </label>
            </div>

            {selectedFile && (
              <div className="text-[10px] text-emerald-400 font-mono animate-pulse text-center">
                📁 READY: {selectedFile.name.substring(0, 20)}...
              </div>
            )}

            {uploadError && (
              <div className="text-[10px] text-rose-500 font-mono text-center font-bold">
                ❌ {uploadError}
              </div>
            )}

            <label className="mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="bg-slate-800 border border-slate-700 text-slate-350 font-bold px-6 py-2 rounded-xl text-xs hover:bg-slate-700 active:scale-95 transition-all text-center cursor-pointer select-none">
                Select Photo
              </div>
            </label>
          </div>
        </div>

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

        <div className="full flex flex-col items-center gap-3 mt-4">
          <button
            onMouseEnter={handleButtonHover}
            className="btn primary px-8 py-3.5 rounded-full font-extrabold text-sm tracking-widest uppercase bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/20"
            type="submit"
            style={btnStyle}
            disabled={loading}
          >
            {loading ? "INITIALIZING RIZZ ACCOUNT..." : "REGISTER TO GET REJECTED"}
          </button>
          
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">
            [ Telepathic Button Telemetry: <strong className="text-rose-400">{buttonStatus}</strong> ]
          </span>
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
