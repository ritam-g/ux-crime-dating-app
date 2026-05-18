import React from 'react';

/**
 * @description Core brand logo component with cursed neon aesthetics.
 */
const BrandLogo = ({ size = 'medium', animated = true, glow = true, className = '' }) => {
  const sizeClass = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-24 h-24',
    xl: 'w-32 h-32'
  }[size] || 'w-12 h-12';

  return (
    <div className={`relative flex-shrink-0 ${sizeClass} ${className}`}>
      <img
        src="/Gemini_Generated_Image_x8gdl5x8gdl5x8gd.png"
        alt="Love.exe Logo"
        className={`w-full h-full object-cover rounded-xl border border-rose-500/40 
          ${glow ? 'shadow-[0_0_15px_rgba(255,0,127,0.4)]' : ''} 
          ${animated ? 'hover:scale-105 hover:rotate-3 transition-all duration-300 ease-out glitch-hover' : ''}`}
      />
      {animated && glow && (
        <div className="absolute inset-0 rounded-xl bg-rose-500/20 mix-blend-overlay pointer-events-none heartbeat-pulse" />
      )}
    </div>
  );
};

export default BrandLogo;
