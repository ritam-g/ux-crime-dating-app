import { useEffect, useState } from "react";
import { playSound, VIRUS_WARNINGS, FAKE_ACHIEVEMENTS, DATING_TIPS, pick } from "./ChaosEngine.js";

const ChaosOverlay = () => {
  const [popups, setPopups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeCaptcha, setActiveCaptcha] = useState(null);
  const [showPremiumAd, setShowPremiumAd] = useState(false);
  const [subwaySurfer, setSubwaySurfer] = useState(true);

  // Trigger random alerts and notifications
  useEffect(() => {
    const popupInterval = setInterval(() => {
      if (Math.random() < 0.35) {
        // Spawn virus warning
        const warning = pick(VIRUS_WARNINGS);
        const id = Date.now() + Math.random();
        setPopups((prev) => [...prev, { ...warning, id, x: 50 + (Math.random() - 0.5) * 30, y: 40 + (Math.random() - 0.5) * 30 }]);
        playSound("error");
      }
    }, 18000);

    const notifInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        const text = Math.random() < 0.5 ? pick(FAKE_ACHIEVEMENTS) : pick(DATING_TIPS);
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { text, id }]);
        playSound("ding", 0.15);
        // Auto-remove notification
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
      }
    }, 10000);

    return () => {
      clearInterval(popupInterval);
      clearInterval(notifInterval);
    };
  }, []);

  const closeWarning = (id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
    playSound("pop", 0.2);
  };

  const triggerCaptcha = () => {
    setActiveCaptcha({
      question: "Select all individuals who will ghost you in 3 days:",
      options: [
        "Cute indie kid playing acoustic guitar 🎸",
        "Corporate product manager with blue checks 👔",
        "Self-proclaimed 'spiritual empath' 🕯️",
        "A literal brick wall 🧱",
      ],
      selected: [],
    });
    playSound("vine");
  };

  const handleCaptchaSubmit = () => {
    playSound("ding", 0.4);
    setActiveCaptcha(null);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] font-sans">
      {/* Dynamic Popups */}
      {popups.map((popup) => (
        <div
          key={popup.id}
          className="absolute bg-slate-950 border-4 border-rose-600 p-6 rounded-2xl w-80 shadow-2xl pointer-events-auto flex flex-col gap-4 animate-bounce"
          style={{ left: `${popup.x}%`, top: `${popup.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="flex justify-between items-center border-b border-rose-600/30 pb-2">
            <h4 className="text-rose-500 font-extrabold tracking-widest text-sm">{popup.title}</h4>
            <button onClick={() => closeWarning(popup.id)} className="text-slate-500 hover:text-white font-black">X</button>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed font-light">{popup.body}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                closeWarning(popup.id);
                setShowPremiumAd(true);
              }}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-2 rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              CLEAN NOW ($4.99)
            </button>
            <button
              onClick={() => closeWarning(popup.id)}
              className="px-3 bg-slate-800 text-slate-400 font-bold py-2 rounded-xl text-xs hover:bg-slate-700 transition-all"
            >
              Skip & Suffer
            </button>
          </div>
        </div>
      ))}

      {/* Notifications Panel */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 max-w-sm pointer-events-auto">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl backdrop-blur-md animate-[slideIn_0.3s_ease-out_forwards]"
          >
            <p className="text-white text-xs font-semibold">{notif.text}</p>
            <button
              onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
              className="text-slate-500 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Captcha Modal */}
      {activeCaptcha && (
        <div className="fixed inset-0 bg-black/80 pointer-events-auto flex items-center justify-center backdrop-blur-sm z-[100000]">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl w-96 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-rose-500 text-xs font-extrabold tracking-widest uppercase">HUMAN VERIFICATION</span>
              <span className="text-slate-500 text-[10px] font-mono">CODE: CRINGE-824</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">{activeCaptcha.question}</h3>
            <div className="grid grid-cols-1 gap-2">
              {activeCaptcha.options.map((opt, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-850 active:scale-[0.98] transition-all"
                >
                  <input type="checkbox" className="rounded border-slate-700 text-rose-500 focus:ring-rose-500" />
                  <span className="text-slate-350 text-xs">{opt}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleCaptchaSubmit}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-3 rounded-full text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              I accept my fate (Verify)
            </button>
          </div>
        </div>
      )}

      {/* Fake Premium Popup */}
      {showPremiumAd && (
        <div className="fixed inset-0 bg-black/80 pointer-events-auto flex items-center justify-center backdrop-blur-sm z-[100000]">
          <div className="bg-slate-950 border-4 border-yellow-500 p-8 rounded-3xl w-[420px] flex flex-col gap-6 shadow-2xl text-center relative overflow-hidden animate-pulse">
            {/* Cursed Ribbon */}
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-extrabold px-6 py-1 rotate-45 translate-x-4 translate-y-3 uppercase tracking-widest">
              BEST VALUE
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-yellow-500 text-4xl">👑</span>
              <h2 className="text-2xl font-black text-white italic tracking-wider">LOVE.EXE PREMIUM ULTRA GOLD</h2>
              <p className="text-slate-400 text-xs">Unlock absolute power over your love metrics.</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl flex flex-col gap-2.5 text-left border border-slate-800">
              <p className="text-xs text-slate-300">✅ See who deleted your matches immediately</p>
              <p className="text-xs text-slate-300">✅ Rizz multiplier (+400% aura boost)</p>
              <p className="text-xs text-slate-300">✅ Bypass emotional cooldown timers</p>
              <p className="text-xs text-slate-300">✅ Unlimited double texts (Normally banned)</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowPremiumAd(false);
                  playSound("nyan", 0.05);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold py-3.5 rounded-full text-sm transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
              >
                SUBSCRIBE FOR $9.99/MIN
              </button>
              <button
                onClick={() => setShowPremiumAd(false)}
                className="text-slate-500 hover:text-slate-400 font-bold text-xs"
              >
                No thanks, I prefer being lonely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subway Surfer Overlay Widget */}
      {subwaySurfer && (
        <div className="fixed bottom-6 left-6 pointer-events-auto bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 z-[99999] w-48 hover:opacity-10 transition-opacity">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Rizz stimulation</span>
            <button onClick={() => setSubwaySurfer(false)} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
            {/* Beautiful, low-latency, cursed loop GIF for focus stimulation */}
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3d6NGszcmplYTh5YjZkZG42dDcxYzRyc2RnaW1nbTF1b3JpZXpwNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LwsCiZPppvURC/giphy.gif"
              alt="stimulating loop"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[8px] text-center text-slate-400 font-medium">Keep scrolling to unlock dopamine!</span>
        </div>
      )}

      {/* Floating chaos elements */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/60 border border-white/5 py-1.5 px-4 rounded-full text-[10px] text-slate-400 font-mono tracking-wider backdrop-blur-sm flex items-center gap-3">
        <span>📶 SERVER STABILITY: <b className="text-rose-500">CRITICAL</b></span>
        <span>🔥 RIZZ SCORE: <b className="text-yellow-500">{Math.floor(Math.random() * 200 + 400)}</b></span>
        <button onClick={triggerCaptcha} className="hover:text-white underline text-rose-400 uppercase font-extrabold font-sans">Captcha Check</button>
      </div>
    </div>
  );
};

export default ChaosOverlay;
