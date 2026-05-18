import React from 'react';
import BrandLogo from './BrandLogo.jsx';

/**
 * @description Full brand header with logo, title, and cursed subtitle.
 */
const BrandHeader = ({ compact = false, showSubtitle = true, animated = true }) => {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} select-none`}>
      <BrandLogo size={compact ? 'small' : 'medium'} animated={animated} />
      <div className="flex flex-col justify-center">
        <h1 
          className={`m-0 font-extrabold uppercase tracking-widest text-white leading-tight
          ${compact ? 'text-sm' : 'text-xl'} 
          ${animated ? 'hover:text-rose-400 transition-colors duration-300 glitch-text' : ''}`}
        >
          Love.exe
        </h1>
        {showSubtitle && (
          <span 
            className={`font-mono text-rose-500/90 tracking-tight leading-none mt-0.5
            ${compact ? 'text-[9px]' : 'text-xs'}`}
          >
            Not Responding
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandHeader;
