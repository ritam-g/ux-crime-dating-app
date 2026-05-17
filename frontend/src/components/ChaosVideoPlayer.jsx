/**
 * @file ChaosVideoPlayer.jsx
 * @description A floating, draggable glassmorphic video overlay player for Chaos media triggers.
 */
import { useEffect, useRef, useState } from "react";
import { playChaosAudio } from "../utils/chaosTriggers.js";

const ChaosVideoPlayer = ({ videoAsset, onClose }) => {
  const [position, setPosition] = useState({ x: 30, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [buffering, setBuffering] = useState(true);

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Play associated annoying audio sound for this trigger type if configuration allows
    if (videoAsset) {
      playChaosAudio(videoAsset.triggerType);
    }

    // Fake buffering delay to heighten frustration
    const timer = setTimeout(() => {
      setBuffering(false);
      if (videoRef.current) {
        videoRef.current.play().catch((err) => {
          console.warn("Autoplay blocked, waiting for interaction", err);
        });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [videoAsset]);

  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("video")) return;
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
      
      // Boundary checks
      newX = Math.max(10, Math.min(window.innerWidth - 340, newX));
      newY = Math.max(10, Math.min(window.innerHeight - 280, newY));

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
        zIndex: 9999,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="bg-[#0b0f19]/90 backdrop-blur-xl border border-rose-500/40 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.35)] select-none transition-shadow hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] transform scale-100 animate-[bounce_0.5s_ease-out_1]"
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-rose-500/10 border-b border-rose-500/20">
        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">
          🚨 CHAOS INTERRUPT
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white font-extrabold text-[10px] tracking-widest uppercase bg-rose-500/20 px-2.5 py-1 rounded-xl transition-all"
        >
          ❌ CLOSE
        </button>
      </div>

      {/* Video Content Panel */}
      <div className="relative aspect-video w-full bg-black/80 flex items-center justify-center">
        {buffering ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#030712] p-4 text-center z-10">
            <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider animate-pulse">
              🚨 BUFFERING CHAOTIC INTERRUPT...
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
          "{videoAsset.title}"
        </p>
        <p className="text-[8px] font-mono text-slate-500">
          This clip is playing because you got left on read for 5.0s.
        </p>
      </div>
    </div>
  );
};

export default ChaosVideoPlayer;
