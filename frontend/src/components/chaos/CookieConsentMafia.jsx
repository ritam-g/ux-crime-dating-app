/**
 * @file CookieConsentMafia.jsx
 * @description Cursed cookie consent. Reject = more pain. Max 8 mini-popups.
 * Cursor-follow via RAF. Always escapable. Cleans up on unmount.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { addRage } from "../../utils/rageCursorManager.js";
import { pick } from "../../chaos/ChaosEngine.js";

const MINI_MSGS = [
  { title: "Are you sure? 🥺", body: "That hurt our feelings." },
  { title: "Reconsidering? 💭", body: "Our AI therapist is literally crying." },
  { title: "PLEASE 😭", body: "We only sell your heartbreak to 47 partners." },
  { title: "Last chance! 🚨", body: "Rejecting reduces your rizz score by 94%." },
  { title: "Emotionally unavailable?", body: "We'll track you anyway. 💀" },
  { title: "Big mistake. 🚩", body: "Our algorithms have noted your defiance." },
  { title: "Think of the cookies! 🍪", body: "They just want to love you." },
  { title: "We're not mad... 😤", body: "We're just logging everything." },
];

const MAX_MINIS = 8;
const LAG = 0.06;

const MiniPopup = ({ msg, style, onClose }) => (
  <div style={{ position: "fixed", width: 210, background: "linear-gradient(145deg,#1a0612,#0f0510)", border: "1.5px solid rgba(255,45,106,0.6)", borderRadius: 14, padding: "14px 14px 12px", boxShadow: "0 0 20px rgba(255,45,106,0.2)", zIndex: 2147483642, animation: "miniPop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards", fontFamily: "Inter,sans-serif", ...style }}>
    <button onClick={onClose} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "none", color: "rgba(245,239,232,0.35)", cursor: "pointer", fontSize: "0.7rem" }}>✕</button>
    <p style={{ fontSize: "0.75rem", fontWeight: 900, color: "#ff6b8b", margin: "0 0 5px", paddingRight: 16 }}>{msg.title}</p>
    <p style={{ fontSize: "0.68rem", color: "rgba(245,239,232,0.6)", margin: 0, lineHeight: 1.4 }}>{msg.body}</p>
  </div>
);

const CookieConsentMafia = ({ onDismiss }) => {
  const [rejectCount, setRejectCount] = useState(0);
  const [minis, setMinis]             = useState([]);
  const [shaking, setShaking]         = useState(false);
  const [gone, setGone]               = useState(false);
  const popupRef  = useRef(null);
  const targetPos = useRef({ x: window.innerWidth / 2 - 180, y: window.innerHeight / 2 - 140 });
  const curPos    = useRef({ ...targetPos.current });
  const rafRef    = useRef(null);
  const timerRefs = useRef([]);
  const following = rejectCount >= 3;

  /* Cursor follow — pure RAF, zero setState */
  useEffect(() => {
    if (!following) return;
    const onMove = (e) => { targetPos.current = { x: e.clientX - 180, y: e.clientY - 60 }; };
    const loop = () => {
      curPos.current.x += (targetPos.current.x - curPos.current.x) * LAG;
      curPos.current.y += (targetPos.current.y - curPos.current.y) * LAG;
      if (popupRef.current) {
        popupRef.current.style.left = `${curPos.current.x}px`;
        popupRef.current.style.top  = `${curPos.current.y}px`;
        popupRef.current.style.transform = "none";
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
  }, [following]);

  /* Cleanup all timers on unmount */
  useEffect(() => () => timerRefs.current.forEach(clearTimeout), []);

  const accept = useCallback(() => {
    setGone(true);
    const t = setTimeout(() => onDismiss?.(), 500);
    timerRefs.current.push(t);
  }, [onDismiss]);

  const reject = useCallback(() => {
    addRage();
    setRejectCount((c) => {
      const next = c + 1;
      /* Spawn minis */
      setMinis((prev) => {
        if (prev.length >= MAX_MINIS) return prev;
        const count = next <= 2 ? 2 : 1;
        const add = Array.from({ length: Math.min(count, MAX_MINIS - prev.length) }, () => ({
          id: Date.now() + Math.random(),
          msg: pick(MINI_MSGS),
          style: { top: `${10 + Math.random() * 68}vh`, left: `${5 + Math.random() * 78}vw` },
        }));
        return [...prev, ...add];
      });
      if (next >= 3) {
        setShaking(true);
        const t = setTimeout(() => setShaking(false), 500);
        timerRefs.current.push(t);
      }
      return next;
    });
  }, []);

  if (gone) return null;

  /* Accept button drifts slightly after 2 rejects */
  const acceptStyle = rejectCount === 2
    ? { transform: `translate(${30}px,${-10}px)`, transition: "transform 0.3s ease" }
    : {};

  return (
    <>
      <style>{`
        @keyframes miniPop { from{opacity:0;transform:scale(0.7) rotate(-4deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes cookieShake { 0%{translate:0 0}20%{translate:-5px 2px}40%{translate:5px -2px}60%{translate:-4px 1px}80%{translate:4px -1px}100%{translate:0 0} }
        @keyframes neonPulse { 0%,100%{box-shadow:0 0 30px rgba(255,45,106,0.35),0 0 80px rgba(255,45,106,0.1)} 50%{box-shadow:0 0 50px rgba(255,45,106,0.6),0 0 100px rgba(255,45,106,0.2)} }
        .ccm-popup { animation: neonPulse 2.5s ease-in-out infinite; }
        .ccm-popup.shaking { animation: cookieShake 0.08s linear infinite; }
        .ccm-accept:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(255,45,106,0.7) !important; }
        .ccm-reject:hover { background: rgba(255,45,106,0.1) !important; color: #ff6b8b !important; }
      `}</style>

      {/* Mini popups */}
      {minis.map((p) => (
        <MiniPopup key={p.id} msg={p.msg} style={p.style} onClose={() => setMinis((m) => m.filter((x) => x.id !== p.id))} />
      ))}

      {/* Main popup */}
      <div
        ref={popupRef}
        className={`ccm-popup${shaking ? " shaking" : ""}`}
        role="alertdialog"
        aria-modal="true"
        style={{
          position: "fixed", width: 360,
          left: "50%", top: "50%", transform: "translate(-50%,-50%)",
          background: "linear-gradient(145deg,#1a0a14,#120810)",
          border: "2px solid #ff2d6a", borderRadius: 20,
          padding: "26px 22px 20px", zIndex: 2147483641,
          fontFamily: "Inter,sans-serif", color: "#f5efe8",
        }}
      >
        {/* Always-visible escape hatch */}
        <button
          onClick={accept}
          title="Fine, I accept."
          style={{ position: "absolute", top: 9, right: 12, background: "none", border: "none", color: "rgba(245,239,232,0.18)", cursor: "pointer", fontSize: rejectCount >= 4 ? "0.68rem" : "0.5rem", transition: "all 0.3s" }}
        >
          {rejectCount >= 4 ? "✕ ok fine" : "·"}
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: "1.4rem" }}>🍪</span>
          <span style={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff2d6a", textShadow: "0 0 10px rgba(255,45,106,0.7)" }}>Cookie Consent Mafia™</span>
          {rejectCount > 0 && (
            <span style={{ marginLeft: "auto", background: "rgba(255,23,68,0.15)", border: "1px solid rgba(255,23,68,0.35)", color: "#ff4d74", fontSize: "0.58rem", fontWeight: 900, padding: "2px 8px", borderRadius: 999 }}>
              REJECTED ×{rejectCount}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: "1rem", fontWeight: 900, margin: "12px 0 6px", lineHeight: 1.3 }}>
          {rejectCount === 0 ? "Accept Emotional Damage Cookies? 💔"
            : rejectCount === 1 ? "We Track Your Heartbreak for Analytics 💀"
            : rejectCount === 2 ? "Rejecting Cookies May Reduce Your Rizz Score."
            : "Your Data Belongs to Us Already. So. 🤷"}
        </h2>

        <p style={{ fontSize: "0.76rem", color: "rgba(245,239,232,0.68)", lineHeight: 1.55, marginBottom: 12 }}>
          {rejectCount === 0
            ? "By using LOVE.EXE you agree to let our AI harvest your emotional data, failed situationships, and rizz metrics in real-time."
            : rejectCount <= 2
            ? "Our cookies are non-optional. They are mandatory for your emotional well-being and our quarterly reports."
            : "You have rejected our cookies multiple times. Our legal team is composing a strongly worded message. In Comic Sans."}
        </p>

        {/* Cookie list */}
        <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {["Heartbreak Tracking Cookies (Essential™)", "Rizz Analytics — 3rd party emotional brokers", "Ghost Detection Algorithms (Beta)", "Situationship Classifier v4.2 (Non-removable)"].map((item) => (
            <li key={item} style={{ fontSize: "0.7rem", color: "rgba(245,239,232,0.55)", display: "flex", gap: 6 }}>
              <span>🔴</span>{item}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            id="cookie-accept-btn"
            className="ccm-accept"
            onClick={accept}
            style={{ flex: 1, padding: "11px 16px", background: "linear-gradient(135deg,#ff2d6a,#ff005e)", color: "#fff", fontWeight: 900, fontSize: "0.73rem", letterSpacing: "0.07em", textTransform: "uppercase", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 0 18px rgba(255,45,106,0.45)", transition: "all 0.25s ease", ...acceptStyle }}
          >
            {rejectCount >= 3 ? "😭 Fine. Accept." : "Accept Emotional Damage"}
          </button>
          <button
            id="cookie-reject-btn"
            className="ccm-reject"
            onClick={reject}
            style={{ padding: "11px 14px", background: "rgba(255,255,255,0.04)", color: "rgba(245,239,232,0.5)", fontWeight: 700, fontSize: "0.7rem", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" }}
          >
            {rejectCount === 0 ? "Reject" : rejectCount === 1 ? "Still No" : rejectCount === 2 ? "NEVER" : "💀"}
          </button>
        </div>

        <p style={{ fontSize: "0.56rem", color: "rgba(245,239,232,0.22)", textAlign: "center", marginTop: 12, fontStyle: "italic" }}>
          Accepting cookies does not constitute informed consent. Nothing does. © LOVE.EXE Emotional Data Corp.
        </p>
      </div>
    </>
  );
};

export default CookieConsentMafia;
