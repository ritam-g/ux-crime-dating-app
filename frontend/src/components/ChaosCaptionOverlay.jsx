/**
 * @file ChaosCaptionOverlay.jsx
 * @description A high-intensity, unhinged brainrot caption overlay that center-stages emotional damage.
 */
import { useEffect, useState } from "react";

const TEASING_CAPTIONS = [
  "BRO SHE LEFT YOU ON READ 💀",
  "NAH THIS IS GETTING EMBARRASSING 😭",
  "STILL WAITING SINCE 1947",
  "TYPE FASTER BRO",
  "HE DEFINITELY TEXTING SOMEONE ELSE",
  "BRO GOT GHOSTED LIVE",
  "NO REPLY IS CRAZY 💀",
  "THIS CHAT IS FINISHED",
  "YOUR RIZZ FAILED",
  "EMOTIONAL DAMAGE DETECTED",
  "CHAT RESPONSE LOADING...",
  "BLUD IS IGNORED"
];

const ChaosCaptionOverlay = ({ duration = 12 }) => {
  const [caption, setCaption] = useState(TEASING_CAPTIONS[0]);
  const [progress, setProgress] = useState(0);
  const [dvdPosition, setDvdPosition] = useState({ x: 50, y: 100 });
  const [dvdVelocity, setDvdVelocity] = useState({ x: 4, y: 3 });

  // 1. Auto-change brainrot captions every 1.8 seconds to keep them triggered
  useEffect(() => {
    const captionInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * TEASING_CAPTIONS.length);
      setCaption(TEASING_CAPTIONS[idx]);
    }, 1800);

    return () => clearInterval(captionInterval);
  }, []);

  // 2. Screaming shake triggers upon initial overlay mount
  useEffect(() => {
    document.body.classList.add("shake-chaos");
    const timer = setTimeout(() => {
      document.body.classList.remove("shake-chaos");
    }, 800);

    return () => {
      document.body.classList.remove("shake-chaos");
      clearTimeout(timer);
    };
  }, []);

  // 3. Increment progress bar for fake emotional recovery
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  // 4. DVD Bouncing Warning Indicator
  useEffect(() => {
    let animationFrameId;

    const updateDvd = () => {
      setDvdPosition((pos) => {
        let nextX = pos.x + dvdVelocity.x;
        let nextY = pos.y + dvdVelocity.y;

        // Boundaries
        const boundX = window.innerWidth - 180;
        const boundY = window.innerHeight - 100;

        let bounceX = dvdVelocity.x;
        let bounceY = dvdVelocity.y;

        if (nextX <= 10 || nextX >= boundX) {
          bounceX = -dvdVelocity.x;
          nextX = nextX <= 10 ? 10 : boundX;
        }

        if (nextY <= 10 || nextY >= boundY) {
          bounceY = -dvdVelocity.y;
          nextY = nextY <= 10 ? 10 : boundY;
        }

        if (bounceX !== dvdVelocity.x || bounceY !== dvdVelocity.y) {
          setDvdVelocity({ x: bounceX, y: bounceY });
        }

        return { x: nextX, y: nextY };
      });

      animationFrameId = requestAnimationFrame(updateDvd);
    };

    animationFrameId = requestAnimationFrame(updateDvd);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dvdVelocity]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-[9999]" style={{ overflow: "hidden" }}>
      {/* Red vignette flashing border alert */}
      <div className="absolute inset-0 border-[8px] border-rose-600/30 animate-pulse pointer-events-none rounded-3xl z-10" />

      {/* DVD Bouncing Warning */}
      <div
        style={{
          position: "absolute",
          left: `${dvdPosition.x}px`,
          top: `${dvdPosition.y}px`,
        }}
        className="px-3.5 py-2 bg-rose-600 border-2 border-white text-white font-mono text-[10px] font-black uppercase rounded-full shadow-[0_0_20px_rgba(244,63,94,0.8)] z-30 transition-all duration-75 flex items-center gap-1.5"
      >
        <span>⚠️ LATE RESPONSE ALERT</span>
      </div>

      {/* Main Teasing Center Display Container */}
      <div className="absolute inset-x-0 top-[28%] flex flex-col items-center justify-center text-center px-4">
        {/* TikTok / YouTube Shorts styled giant bold captions */}
        <h1
          style={{
            fontFamily: "'Outfit', 'Impact', sans-serif",
            fontWeight: 900,
            textShadow: "0 0 10px rgba(0,0,0,1), 0 0 25px rgba(244,63,94,0.9), 0 0 40px rgba(244,63,94,0.7)",
            WebkitTextStroke: "2px black"
          }}
          className="text-4xl md:text-6xl text-yellow-300 uppercase tracking-tight scale-100 animate-[bounce_0.6s_infinite_alternate] select-none"
        >
          {caption}
        </h1>

        {/* Cringe subtitling banner */}
        <p className="mt-3.5 px-4 py-1.5 bg-black/90 border border-yellow-300 text-yellow-300 font-mono text-xs uppercase tracking-widest rounded-xl animate-pulse">
          🚨 STATUS: ABANDONED LIVE 🚨
        </p>
      </div>

      {/* Bottom Status bar for fake recovery generation */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-80 max-w-[90%] bg-black/90 border border-rose-500/40 p-4 rounded-3xl shadow-[0_0_30px_rgba(244,63,94,0.4)] flex flex-col gap-2 z-20">
        <div className="flex justify-between items-center text-[10px] font-mono text-rose-400 font-black tracking-wider">
          <span>GENERATING EMOTIONAL RECOVERY</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-rose-950/40 h-2.5 rounded-full overflow-hidden border border-rose-500/20">
          <div
            className="bg-rose-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(244,63,94,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[8px] font-mono text-slate-500 text-center uppercase tracking-widest animate-pulse mt-0.5">
          "System response quality: CRITICALLY LOW"
        </div>
      </div>
    </div>
  );
};

export default ChaosCaptionOverlay;
