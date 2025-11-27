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
               viewBox="0 0 512 512" 
               className="w-48 h-48 text-slate-100 drop-shadow-2xl transition-all duration-500 group-hover:scale-105 fill-current"
             >
               <path d="M480 160h-32c-5.1 0-9.9-2.6-12.9-6.9-10-14.3-25.9-24.1-43.1-27.1V80c0-26.5-21.5-48-48-48H168c-26.5 0-48 21.5-48 48v46c-17.2 3-33.1 12.8-43.1 27.1-3 4.3-7.8 6.9-12.9 6.9H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h16c8.8 0 16 7.2 16 16v16c0 53 43 96 96 96h192c53 0 96-43 96-96v-16c0-8.8 7.2-16 16-16h16c17.7 0 32-14.3 32-32s-14.3-32-32-32zM160 272c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
               <path d="M128 368v32c0 35.3 28.7 64 64 64h128c35.3 0 64-28.7 64-64v-32H128z"/>
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