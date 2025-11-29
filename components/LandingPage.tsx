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
               src="/compass-outlaw-logo-bg-removed.png" 
               alt="Compass Outlaw Logo" 
               onError={() => setImgError(true)}
               className="w-48 h-48 object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-105 invert"
             />
           ) : (
              <svg
                viewBox="0 0 100 100"
                className="w-48 h-48 text-slate-100 fill-current drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
              >
                <ellipse cx="50" cy="28" rx="45" ry="8" />
                <path d="M15 28 Q20 15, 50 12 Q80 15, 85 28" />
                <rect x="30" y="12" width="40" height="16" rx="4" />
                <ellipse cx="50" cy="52" rx="22" ry="26" />
                <path d="M28 48 L50 75 L72 48 Q70 60, 50 70 Q30 60, 28 48" />
                <path d="M50 70 L45 85 M50 70 L55 85 M50 70 L50 88" />
                <ellipse cx="40" cy="45" rx="5" ry="2" className="fill-void" />
                <ellipse cx="60" cy="45" rx="5" ry="2" className="fill-void" />
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

    </div>
  );
};

export default LandingPage;