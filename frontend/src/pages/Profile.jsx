import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile, uploadProfileImage } from "../services/api.js";
import { playSound } from "../chaos/ChaosEngine.js";

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

  // Profile Image Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const auraTimerRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (auraTimerRef.current) {
        clearTimeout(auraTimerRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleScanAura = () => {
    setScanningAura(true);
    playSound("error", 0.2);
    if (auraTimerRef.current) {
      clearTimeout(auraTimerRef.current);
    }
    auraTimerRef.current = setTimeout(() => {
      setScanningAura(false);
      const newScore = Math.floor(Math.random() * 1000 - 800);
      setAuraScore(newScore);
      playSound("vine", 0.5);
      auraTimerRef.current = null;
    }, 1500);
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    playSound("pop", 0.35);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError("");
    playSound("error", 0.25);

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      await uploadProfileImage(formData);

      playSound("nyan", 0.08);
      await refreshUser();
      
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setUploading(false);
      setMessage("⚠️ RETINAL PROFILE PICTURE RE-BIOMETRICIZED SUCCESSFULLY!");
    } catch (err) {
      const serverErr = err.response?.data?.message || "Cloud upload failed. Vibe check rejected.";
      setUploadError(serverErr);
      playSound("sad");
      setUploading(false);
    }
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
    } catch {
      setMessage("Failed to save changes. Please try crying about it.");
      playSound("sad");
    }
  };

  return (
    <section className="panel border-2 border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden dramatic-shadow fake-loading-flash" data-chaos-label="identity unstable">
      <div className="absolute top-2 right-4 text-[9px] font-mono text-rose-500/20">
        SUBJECT TELEMETRY INTERFACE
      </div>

      <p className="eyebrow text-rose-450 tracking-widest uppercase">Self-Deception Center</p>
      <h1 className="text-3xl font-black text-white italic tracking-wide glitch-text">Optimize your digital lure.</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Side: Cursed Interactive Stats Panels */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Cursed Profile Mugshot Upload */}
          <div className="warning-card p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>📸</span> MUGSHOT UPLOADER
            </h3>
            
            <div className="flex flex-col items-center gap-3">
              {/* Image Preview / Current Photo */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-rose-500/30 bg-slate-950 flex items-center justify-center relative group shadow-inner">
                {previewUrl ? (
                  <img src={previewUrl} alt="Mugshot Preview" className="w-full h-full object-cover" />
                ) : user?.profileImage ? (
                  <img src={user.profileImage} alt="User Mugshot" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl animate-bounce">🤡</div>
                )}
                
                <label className="absolute inset-0 bg-slate-950/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <span className="text-[10px] text-white font-black tracking-widest font-mono">REPLACE FACE</span>
                </label>
              </div>

              {selectedFile && !uploading && (
                <div className="text-[10px] text-emerald-400 font-mono animate-pulse text-center">
                  📁 READY: {selectedFile.name.substring(0, 16)}...
                </div>
              )}

              {/* Loader with unhinged fake scanning state */}
              {uploading && (
                <div className="text-center w-full bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/25 animate-pulse">
                  <div className="text-xs font-bold text-rose-400">
                    🚨 FBI FACE SCANNING...
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    UPLOADING RETINAL BIOMETRICS
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="text-[10px] text-rose-500 font-mono text-center font-bold">
                  ❌ {uploadError}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="w-full bg-slate-800 border border-slate-700 text-slate-350 font-bold py-2 rounded-xl text-xs hover:bg-slate-700 active:scale-95 transition-all text-center cursor-pointer select-none">
                  Select File
                </div>
              </label>

              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black py-2 rounded-xl text-xs hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all select-none shadow-md shadow-rose-500/10"
                >
                  UPLOAD TO CLOUD
                </button>
              )}
            </div>
          </div>

          {/* Aura Scanner */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 fake-loading-flash">
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
              className="cursed-button w-full bg-rose-500/10 border border-rose-500/35 text-rose-300 font-bold py-2 rounded-xl text-xs hover:bg-rose-500/20 active:scale-95 transition-all"
              data-chaos-tip="results legally meaningless"
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
              className="btn primary cursed-button full mt-4 py-3.5 rounded-full font-black text-sm tracking-widest bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-95 transition-all shadow-lg shadow-rose-500/10"
              type="submit"
              data-chaos-tip="commit personality changes"
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
