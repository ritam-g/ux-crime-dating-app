/**
 * @file ChaosVideoOverlay.jsx
 * @description A floating, draggable glassmorphic video player for Chaos media triggers with high rendering performance.
 */
import { useEffect, useRef, useState } from "react";
import { playChaosAudio, stopChaosMedia } from "../utils/chaosTriggers.js";

const ChaosVideoOverlay = ({ videoAsset, onClose }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 360, y: window.innerHeight - 290 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [buffering, setBuffering] = useState(true);

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Recenter if the window is resized
  useEffect(() => {
    const handleResize = () => {
      setPosition({
        x: Math.max(20, window.innerWidth - 360),
        y: Math.max(20, window.innerHeight - 290)
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!videoAsset) return;

    // Trigger associated annoying sound
    playChaosAudio(videoAsset.triggerType);

    // Buffering simulator to test patience
    const timer = setTimeout(() => {
      setBuffering(false);
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay blocked, user interaction required", err);
        });
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      stopChaosMedia(); // ensures cleanup
    };
  }, [videoAsset]);

  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("video") || e.target.closest("input")) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Keep boundaries inside viewport
      newX = Math.max(10, Math.min(window.innerWidth - 340, newX));
      newY = Math.max(10, Math.min(window.innerHeight - 270, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleEnded = () => {
    onClose();
  };

  if (!videoAsset) return null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "320px",
        zIndex: 99999,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="bg-[#0b0f19]/90 backdrop-blur-xl border border-rose-500/40 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.3)] transition-all transform scale-100 animate-[bounce_0.4s_ease-out_1] hover:border-rose-500/60"
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-rose-500/10 border-b border-rose-500/20">
        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">
          ⚠️ ATTENTION DEFICIT INCIDENT
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white font-extrabold text-[10px] tracking-widest uppercase bg-rose-500/20 px-2.5 py-1 rounded-xl transition-all"
        >
          ❌ GET OUT
        </button>
      </div>

      {/* Video Content Panel */}
      <div className="relative aspect-video w-full bg-black/90 flex items-center justify-center">
        {buffering ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#030712] p-4 text-center z-10">
            <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider animate-pulse">
              LOADING REJECTION RECORDINGS...
            </p>
          </div>
        ) : null}

        <video
          ref={videoRef}
          src={videoAsset.src}
          volume={videoAsset.volume}
          autoPlay
          playsInline
          onEnded={handleEnded}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Footer Info Badge */}
      <div className="p-3 bg-rose-950/20 flex flex-col gap-1 border-t border-rose-500/10 text-center">
        <p className="text-[10px] font-bold text-slate-300 italic">
          "Unanswered texts are a badge of honor."
        </p>
        <div className="w-full bg-rose-500/20 h-1 rounded-full overflow-hidden mt-1">
          <div className="bg-rose-500 h-full animate-[loading_10s_linear_infinite]" style={{ animationDuration: `${videoAsset.duration || 10}s` }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChaosVideoOverlay;
