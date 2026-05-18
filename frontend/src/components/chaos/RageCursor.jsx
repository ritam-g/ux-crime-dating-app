/**
 * @file RageCursor.jsx
 * @description Renders a custom neon-pink broken-heart cursor whose size
 *   grows with every rage-worthy interaction.
 *
 * PERFORMANCE CONTRACT:
 *  - Mouse tracking uses a ref + RAF, never setState on every frame.
 *  - Size changes come from CSS variable `--rage-size` set by rageCursorManager.
 *  - React state only updates for the rage-level badge (≤ 5 discrete levels).
 *  - The real browser cursor is hidden via `cursor: none` on <html>.
 *
 * Hover effects:
 *  - Slight pulse animation on idle.
 *  - Glitch-distortion keyframes on "max rage" class.
 */
import { useEffect, useRef, useState } from "react";
import { initRageCursor, getRageProgress } from "../../utils/rageCursorManager.js";

// Badge thresholds → text shown next to cursor
const RAGE_BADGES = [
  { min: 0,    label: "" },
  { min: 0.15, label: "😬" },
  { min: 0.35, label: "😤" },
  { min: 0.55, label: "🤬" },
  { min: 0.75, label: "💀 MAX RAGE" },
];

const getBadge = (progress) => {
  for (let i = RAGE_BADGES.length - 1; i >= 0; i--) {
    if (progress >= RAGE_BADGES[i].min) return RAGE_BADGES[i].label;
  }
  return "";
};

const RageCursor = () => {
  const cursorRef  = useRef(null);
  const posRef     = useRef({ x: -200, y: -200 }); // start off-screen
  const rafRef     = useRef(null);
  const [badge, setBadge] = useState("");
  const [isMaxRage, setIsMaxRage] = useState(false);

  useEffect(() => {
    initRageCursor();

    // Hide the native cursor globally
    document.documentElement.style.cursor = "none";

    // ─── Mouse tracking via RAF — zero state changes ──────────────────────
    const onMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform =
              `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
          }
          rafRef.current = null;
        });
      }
    };

    // ─── Badge updater — sampled on interaction events, NOT mousemove ────
    const updateBadge = () => {
      const progress = getRageProgress();
      setBadge(getBadge(progress));
      setIsMaxRage(progress >= 0.75);
    };

    // Listen for custom rage events dispatched by interaction hooks
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("rage:increment", updateBadge);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("rage:increment", updateBadge);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Inject keyframe styles once */}
      <style>{`
        @keyframes rage-pulse {
          0%, 100% { filter: drop-shadow(0 0 6px #ff6b8b) drop-shadow(0 0 2px #ff4d74); }
          50%       { filter: drop-shadow(0 0 14px #ff1744) drop-shadow(0 0 6px #ff6b8b); }
        }
        @keyframes rage-glitch {
          0%   { clip-path: inset(10% 0 80% 0); transform: translate(-3px, 2px); }
          25%  { clip-path: inset(50% 0 20% 0); transform: translate(3px, -2px); }
          50%  { clip-path: inset(30% 0 50% 0); transform: translate(-2px, 0); }
          75%  { clip-path: inset(70% 0 5%  0); transform: translate(2px, 3px); }
          100% { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 0); }
        }
        .rage-cursor-el {
          pointer-events: none;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 2147483647;
          /* size driven by CSS variable set by rageCursorManager */
          width:  var(--rage-size, 18px);
          height: var(--rage-size, 18px);
          margin-left: calc(var(--rage-size, 18px) / -2);
          margin-top:  calc(var(--rage-size, 18px) / -2);
          will-change: transform, width, height;
          /* smooth size transitions */
          transition: width 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      height 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      margin 0.4s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: rage-pulse 1.8s ease-in-out infinite;
          user-select: none;
        }
        .rage-cursor-el.glitching {
          animation: rage-pulse 0.5s ease-in-out infinite,
                     rage-glitch 0.15s linear infinite alternate;
        }
        .rage-cursor-emoji {
          font-size: calc(var(--rage-size, 18px) * 0.72);
          line-height: 1;
          display: block;
          transition: font-size 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rage-badge {
          position: absolute;
          top: calc(var(--rage-size, 18px) * -0.9);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 9px;
          font-weight: 900;
          font-family: 'Inter', sans-serif;
          color: #ff4d74;
          text-shadow: 0 0 8px #ff1744;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .rage-cursor-el.glitching .rage-badge {
          opacity: 1;
        }
      `}</style>

      <div
        ref={cursorRef}
        className={`rage-cursor-el${isMaxRage ? " glitching" : ""}`}
        aria-hidden="true"
      >
        <span className="rage-cursor-emoji" role="img" aria-label="rage cursor">
          💔
        </span>
        {badge && <span className="rage-badge">{badge}</span>}
      </div>
    </>
  );
};

export default RageCursor;
