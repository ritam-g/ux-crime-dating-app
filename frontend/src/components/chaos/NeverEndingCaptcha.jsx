/**
 * @file NeverEndingCaptcha.jsx
 * @description The NEVER ENDING CAPTCHA — completes 3-5 rounds before granting
 *   real success. Each round shows a dating-themed meme captcha.
 *   Fake success animation plays between rounds to maximum frustration.
 *
 * CLEANUP: All timeouts tracked and cleared on unmount.
 * ALWAYS COMPLETABLE: max rounds hard-capped, final success is guaranteed.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { addRage } from "../../utils/rageCursorManager.js";
import { pick, randInt } from "../../chaos/ChaosEngine.js";

// ─── Captcha data ────────────────────────────────────────────────────────────

const CAPTCHAS = [
  {
    prompt: "Select all emotionally unavailable people",
    options: ["Responds 3 days later 📵", "Has 'not looking for anything serious' in bio 🚩", "A brick wall 🧱", "Still texting their ex 💀"],
    correctHint: "All of them. Obviously.",
  },
  {
    prompt: "Find the red flags 🚩",
    options: ["Love-bombs on day 1 💣", "Their mom 👩", "Uses 'k' as a complete sentence", "Calls their ex 'crazy' (all of them) 🤡"],
    correctHint: "1, 3, and 4. You should know this.",
  },
  {
    prompt: "Who will ghost you?",
    options: ["Guy who said 'we should hang out soon' 2 months ago 👻", "Delivery driver 📦", "The barista who smiled at you ☕", "Literally everyone 💔"],
    correctHint: "Statistically: all of them.",
  },
  {
    prompt: "Pick the toxic reply",
    options: ["k", "ok", "fine 🙂", "no worries, I'm fine :)"],
    correctHint: "They are all weapons. Choose wisely.",
  },
  {
    prompt: "Which one says 'k' after an argument?",
    options: ["The one who 'doesn't like drama' 🎭", "Certified Main Character 👑", "Person who reads the message, puts phone down, picks it back up, reads again, puts phone down 📱", "All of the above"],
    correctHint: "The answer is yes.",
  },
  {
    prompt: "Select the situationship survivor",
    options: ["'We're just vibing' — 8 months 🌀", "Met at 2am, never in daylight 🌙", "Their contact is saved as 'Do Not Answer' ❌", "Actually in a healthy relationship 🦄"],
    correctHint: "Not the last one. That's a myth.",
  },
  {
    prompt: "Identify the walking red flag",
    options: ["Posts gym selfies with 'grind never stops' 💪", "'I don't do labels' 🏷️", "Responds to 'I miss you' with a meme 🤣", "Their Spotify is just The Weeknd 🎶"],
    correctHint: "Pick your villain.",
  },
];

const FAKE_SUCCESS_MSGS = [
  "✅ Verification complete! Almost...",
  "🎉 Great job! One more step...",
  "✓ Human confirmed. Probably. Just one more...",
  "💯 Passed! But wait—",
  "🏆 Impressive! Unfortunately...",
];

const MAX_ROUNDS = 5;
const MIN_ROUNDS = 3;

// ─── Component ────────────────────────────────────────────────────────────────

const NeverEndingCaptcha = ({ onSuccess, onDismiss }) => {
  const totalRounds = useRef(randInt(MIN_ROUNDS, MAX_ROUNDS));
  const [round, setRound]       = useState(0);
  const [captcha, setCaptcha]   = useState(() => pick(CAPTCHAS));
  const [selected, setSelected] = useState([]);
  const [phase, setPhase]       = useState("answering"); // "answering" | "fakeSuccess" | "done"
  const [fakeMsg, setFakeMsg]   = useState("");
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const nextRound = useCallback(() => {
    const nextIdx = round + 1;
    if (nextIdx >= totalRounds.current) {
      setPhase("done");
      const t = setTimeout(() => onSuccess?.(), 1200);
      timers.current.push(t);
    } else {
      setRound(nextIdx);
      setCaptcha(pick(CAPTCHAS));
      setSelected([]);
      setPhase("answering");
    }
  }, [round, onSuccess]);

  const handleSubmit = useCallback(() => {
    if (selected.length === 0) return;
    addRage();
    setFakeMsg(pick(FAKE_SUCCESS_MSGS));
    setPhase("fakeSuccess");
    const t = setTimeout(nextRound, 1800);
    timers.current.push(t);
  }, [selected, nextRound]);

  const toggleOption = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Progress bar width
  const progressPct = Math.round((round / totalRounds.current) * 100);

  return (
    <>
      <style>{`
        @keyframes nec-slide-in  { from{opacity:0;transform:translateY(18px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes nec-success   { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 70%{transform:scale(0.96)} 100%{transform:scale(1)} }
        @keyframes nec-checkmark { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
        @keyframes nec-spin      { to{transform:rotate(360deg)} }
        .nec-option { transition: all 0.18s ease; }
        .nec-option:hover { transform: translateX(4px); }
        .nec-option.selected { background: rgba(255,45,106,0.12) !important; border-color: rgba(255,45,106,0.5) !important; color: #ff8fab !important; }
        .nec-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .nec-submit:not(:disabled):hover { transform: scale(1.02); box-shadow: 0 0 28px rgba(255,45,106,0.6) !important; }
        .nec-fake-success { animation: nec-success 0.5s ease forwards; }
        .nec-progress-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 2147483640, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,sans-serif" }}>

        {/* Card */}
        <div style={{ width: 420, maxWidth: "94vw", background: "linear-gradient(160deg,#1a0a14,#0f0510)", border: "1.5px solid rgba(255,45,106,0.4)", borderRadius: 24, padding: "28px 26px 24px", boxShadow: "0 0 60px rgba(255,45,106,0.2)", animation: "nec-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.15em", color: "#ff2d6a", textTransform: "uppercase", textShadow: "0 0 10px rgba(255,45,106,0.7)" }}>
              💔 Human Verification — LOVE.EXE
            </span>
            <span style={{ fontSize: "0.58rem", color: "rgba(245,239,232,0.3)", fontFamily: "monospace" }}>
              CRINGE-{Math.floor(Math.random() * 900 + 100)}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, margin: "12px 0 20px", overflow: "hidden" }}>
            <div
              className="nec-progress-fill"
              style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#ff2d6a,#ff8fab)", borderRadius: 99, boxShadow: "0 0 8px rgba(255,45,106,0.6)" }}
            />
          </div>

          {/* Round counter */}
          <div style={{ fontSize: "0.62rem", color: "rgba(245,239,232,0.4)", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
            <span>Round {round + 1} of ???</span>
            <span style={{ color: "#ff4d74" }}>{selected.length} selected</span>
          </div>

          {/* PHASE: Answering */}
          {phase === "answering" && (
            <>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#fff", margin: "0 0 18px", lineHeight: 1.35 }}>
                {captcha.prompt}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {captcha.options.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`nec-option${selected.includes(idx) ? " selected" : ""}`}
                    onClick={() => toggleOption(idx)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "rgba(245,239,232,0.7)", fontSize: "0.78rem", fontWeight: 500, cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid", borderColor: selected.includes(idx) ? "#ff6b8b" : "rgba(255,255,255,0.2)", background: selected.includes(idx) ? "rgba(255,45,106,0.25)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>
                      {selected.includes(idx) && "✓"}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: "0.62rem", color: "rgba(245,239,232,0.3)", fontStyle: "italic", marginBottom: 16 }}>
                💡 Hint: {captcha.correctHint}
              </p>

              <button
                className="nec-submit"
                onClick={handleSubmit}
                disabled={selected.length === 0}
                style={{ width: "100%", padding: "13px 20px", background: "linear-gradient(135deg,#ff2d6a,#ff005e)", color: "#fff", fontWeight: 900, fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 0 20px rgba(255,45,106,0.4)", transition: "all 0.22s ease" }}
              >
                I am (probably) human — Verify →
              </button>
            </>
          )}

          {/* PHASE: Fake Success */}
          {phase === "fakeSuccess" && (
            <div className="nec-fake-success" style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#4ade80", margin: "0 0 8px" }}>{fakeMsg}</p>
              <p style={{ fontSize: "0.72rem", color: "rgba(245,239,232,0.5)" }}>Preparing next verification…</p>
              <div style={{ margin: "18px auto 0", width: 24, height: 24, border: "3px solid rgba(255,45,106,0.3)", borderTopColor: "#ff2d6a", borderRadius: "50%", animation: "nec-spin 0.7s linear infinite" }} />
            </div>
          )}

          {/* PHASE: Done */}
          {phase === "done" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#4ade80", margin: "0 0 8px" }}>
                You are (reluctantly) verified.
              </p>
              <p style={{ fontSize: "0.72rem", color: "rgba(245,239,232,0.5)" }}>
                Our AI wasn't convinced but we gave up. Proceeding…
              </p>
            </div>
          )}

          {/* Always-present dismiss */}
          {phase === "answering" && (
            <button
              onClick={onDismiss}
              style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "rgba(245,239,232,0.2)", fontSize: "0.62rem", cursor: "pointer", padding: 6 }}
            >
              skip (coward mode)
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NeverEndingCaptcha;
