import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-void overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-800/10 rounded-full blur-[120px]" />
      </div>

      <div 
        className={`flex flex-col items-center z-10 transition-all duration-1000 ease-out transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Logo Representation */}
        <div className="mb-8 relative group">
           {!imgError ? (
             <img 
               src="compass-outlaw-logo-bg-removed.png" 
               alt="Compass Outlaw Logo" 
               onError={() => setImgError(true)}
               className="w-48 h-48 object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
             />
           ) : (
             /* Fallback SVG Outlaw Silhouette */
             <svg 
               viewBox="0 0 100 120" 
               className="w-48 h-48 text-slate-100 drop-shadow-2xl transition-all duration-500 group-hover:scale-105 fill-current"
             >
               {/* Wide-Brim Cowboy Hat */}
               <ellipse cx="50" cy="18" rx="48" ry="8" />
               <path d="M5 18 Q50 0 95 18 L88 28 Q50 15 12 28 Z" />
               <rect x="20" y="28" width="60" height="15" rx="2" />
               {/* Hat Band */}
               <rect x="22" y="38" width="56" height="4" opacity="0.3" />
               {/* Shadowed Face */}
               <path d="M25 43 L25 70 Q25 85 50 90 Q75 85 75 70 L75 43 Q50 38 25 43" opacity="0.95" />
               {/* Bandana Mask */}
               <path d="M28 65 Q50 58 72 65 L72 82 Q50 75 28 82 Z" opacity="0.7" />
               {/* Bandana V-Point */}
               <path d="M35 82 L50 105 L65 82 Q50 88 35 82" />
               {/* Eye shadow hint */}
               <ellipse cx="38" cy="55" rx="6" ry="3" opacity="0.15" />
               <ellipse cx="62" cy="55" rx="6" ry="3" opacity="0.15" />
             </svg>
           )}
           {/* Subtle glow behind the logo */}
           <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-20 pointer-events-none"></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter text-slate-100 mb-4 text-center uppercase">
          Compass <span className="text-slate-500">Outlaw</span>
        </h1>

        <p className="text-sm md:text-base font-mono text-slate-400 tracking-[0.2em] uppercase mb-12 text-center">
          Justice is no longer for sale
        </p>

        <button
          onClick={onEnter}
          className="group relative px-12 py-4 bg-transparent border border-slate-700/50 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-500 rounded-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-800/30 transition-all duration-500" />
          <span className="relative font-sans font-bold tracking-widest flex items-center gap-2">
            ENTER <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
          </span>
        </button>
      </div>

      {/* Footer System Status */}
      <div className="absolute bottom-8 text-[10px] font-mono text-slate-600 tracking-widest">
        SYSTEM: ONLINE // V2.0 // SLATE-950
      </div>
    </div>
  );
};

export default LandingPage;