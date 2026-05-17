/**
 * @file CursorTrail.jsx
 * @description Renders emoji trails that follow the cursor around the screen.
 * Pure visual layer — no backend involvement.
 */
import { useEffect, useRef } from "react";
import { TRAIL_EMOJIS, pick } from "../chaos/ChaosEngine.js";

const CursorTrail = () => {
  const trailsRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      if (Math.random() > 0.15) return; // only spawn 15% of the time

      const el = document.createElement("div");
      el.textContent = pick(TRAIL_EMOJIS);
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX - 10}px;
        top: ${e.clientY - 10}px;
        font-size: ${14 + Math.random() * 12}px;
        pointer-events: none;
        z-index: 9999;
        animation: trailFade 0.8s ease-out forwards;
        user-select: none;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return <div ref={containerRef} style={{ display: "none" }} aria-hidden="true" />;
};

export default CursorTrail;
