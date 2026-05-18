import React, { useEffect, useState, useRef } from "react";

const ChatEntryVideoOverlay = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Trigger fade-in animation
    requestAnimationFrame(() => {
      setVisible(true);
    });

    // Auto cleanup after 4.5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      // Wait for fade out to complete before fully unmounting
      setTimeout(onClose, 300);
    }, 4500);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.3;
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // silently handle autoplay restrictions
        });
      }
    }
  }, []);

  return (
    <div
      className={`fixed top-20 right-8 z-[99999] pointer-events-none transition-all duration-300 ease-in-out flex flex-col ${
        visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4"
      }`}
      style={{
        width: "320px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "2px solid #ff007f",
        boxShadow: "0 0 25px rgba(255, 0, 127, 0.6), inset 0 0 15px rgba(255, 0, 127, 0.3)",
        backgroundColor: "#000",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/when_user_click_chat_buton.mp4"
        className="w-full h-auto object-cover border-b-2 border-[#ff007f]/50"
        playsInline
      />
      <div className="bg-black/90 text-[#ff007f] text-[11px] font-black text-center py-2.5 px-3 tracking-[0.2em] uppercase backdrop-blur-md">
        bro entered emotional damage zone 💀
      </div>
    </div>
  );
};

export default ChatEntryVideoOverlay;
