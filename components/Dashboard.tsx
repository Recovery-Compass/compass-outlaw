import React, { useState } from 'react';
import { Scale, Banknote, FileText, Calendar, Clock, Lock, Gavel, Database } from 'lucide-react';
import { ACTIVE_CASES } from '../constants';
import { CaseType } from '../types';
import IntelligencePanel from './IntelligencePanel';
import AutoLexArchitect from './AutoLexArchitect';
import GlassHousePanel from './GlassHousePanel';
import RosettaStone from './RosettaStone';
import PreFlightChecklist from './PreFlightChecklist';
import TacticalDashboard from './TacticalDashboard';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INTELLIGENCE' | 'AUTOLEX' | 'ROSETTA'>('OVERVIEW');
  const [imgError, setImgError] = useState(false);
  const [autoLexMode, setAutoLexMode] = useState<'default' | 'glass-house'>('default');
  const [preFlightPassed, setPreFlightPassed] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-red-500 border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
      case 'ACTIVE': return 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'PENDING': return 'text-amber-500 border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'FILING': return 'text-indigo-500 border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]';
      default: return 'text-slate-500 border-slate-500/50';
    }
  };

  const getCaseIcon = (type: CaseType) => {
    switch (type) {
      case CaseType.FAMILY: return <Scale className="w-5 h-5" />;
      case CaseType.PROBATE: return <Lock className="w-5 h-5" />;
      case CaseType.ELDER: return <Banknote className="w-5 h-5" />;
      case CaseType.MALPRACTICE: return <Gavel className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleLaunchGlassHouseAutoLex = () => {
    setAutoLexMode('glass-house');
    setActiveTab('AUTOLEX');
  };

  // Filter out case ID 1 (Sayegh) since it gets the featured Glass House panel
  const otherCases = ACTIVE_CASES.filter(c => c.id !== '1');

  return (
    <div className="w-full h-screen bg-void flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-void-light/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          {!imgError ? (
            <img 
              src="/compass-outlaw-logo-bg-removed.png" 
              alt="Compass Outlaw" 
              onError={() => setImgError(true)}
              className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] invert"
            />
          ) : (
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-100 fill-current">
              <ellipse cx="50" cy="28" rx="45" ry="8" />
              <path d="M15 28 Q20 15, 50 12 Q80 15, 85 28" />
              <rect x="30" y="12" width="40" height="16" rx="4" />
              <ellipse cx="50" cy="52" rx="22" ry="26" />
              <path d="M28 48 L50 75 L72 48 Q70 60, 50 70 Q30 60, 28 48" />
              <ellipse cx="40" cy="45" rx="5" ry="2" className="fill-void" />
              <ellipse cx="60" cy="45" rx="5" ry="2" className="fill-void" />
            </svg>
          )}
          
          <h1 className="text-lg font-black tracking-tighter text-slate-100 uppercase hidden md:block">
            Compass <span className="text-slate-500">Outlaw</span>
          </h1>
          <span className="hidden md:inline-block h-4 w-[1px] bg-slate-700 mx-2"></span>
          <span className={`hidden md:inline-block text-[10px] font-mono tracking-zen ${preFlightPassed ? 'text-emerald-500' : 'text-amber-500'}`}>
            {preFlightPassed ? 'OPERATIONAL' : 'PRE-FLIGHT PENDING'}
          </span>
        </div>
        
        <nav className="flex gap-2">
           <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-6 py-2 text-[10px] font-bold tracking-widest transition-all uppercase rounded-sm border ${activeTab === 'OVERVIEW' ? 'bg-slate-100 text-void border-slate-100' : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-800'}`}
           >
             Overview
           </button>
           <button 
            onClick={() => setActiveTab('INTELLIGENCE')}
            className={`px-6 py-2 text-[10px] font-bold tracking-widest transition-all uppercase rounded-sm border ${activeTab === 'INTELLIGENCE' ? 'bg-amber-500 text-void border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-800'}`}
           >
             Intel Report
           </button>
           <button 
            onClick={() => { setActiveTab('AUTOLEX'); setAutoLexMode('default'); }}
            className={`px-6 py-2 text-[10px] font-bold tracking-widest transition-all uppercase rounded-sm border ${activeTab === 'AUTOLEX' ? 'bg-indigo-500 text-white border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-800'}`}
           >
             AutoLex V2
           </button>
           <button 
            onClick={() => setActiveTab('ROSETTA')}
            className={`px-6 py-2 text-[10px] font-bold tracking-widest transition-all uppercase rounded-sm border flex items-center gap-2 ${activeTab === 'ROSETTA' ? 'bg-cyan-500 text-void border-cyan-500' : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-800'}`}
           >
             <Database className="w-3 h-3" /> Rosetta Stone
           </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative p-6">
        <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>

        {activeTab === 'OVERVIEW' && (
          <div className="h-full pb-12 overflow-y-auto space-y-6">
            {/* Pre-Flight Checklist - TOP OF PAGE */}
            <PreFlightChecklist 
              onAllBlockersPassed={() => setPreFlightPassed(true)}
              onBlockerFailed={() => setPreFlightPassed(false)}
            />

            {/* Tactical Command Dashboard */}
            <TacticalDashboard />

            {/* Featured: Glass House Panel for Sayegh Case */}
            <GlassHousePanel onLaunchAutoLex={handleLaunchGlassHouseAutoLex} />

            {/* Other Cases Grid */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                Other Active Cases ({otherCases.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCases.map((legalCase) => (
                  <div 
                    key={legalCase.id} 
                    className="group relative bg-void-light/40 border border-white/5 hover:border-white/20 transition-all duration-300 rounded-sm overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-black/50"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Card Header */}
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded bg-black/50 border border-white/10 text-slate-300 group-hover:text-white transition-colors`}>
                          {getCaseIcon(legalCase.type)}
                        </div>
                        <span className={`px-2 py-1 text-[10px] font-mono font-bold border rounded-sm ${getStatusColor(legalCase.status)}`}>
                          {legalCase.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 mb-1 tracking-tight">{legalCase.title}</h3>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">{legalCase.caseNumber}</p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] text-slate-600 font-bold uppercase tracking-zen">Venue</label>
                          <p className="text-sm font-mono text-slate-300">{legalCase.venue}</p>
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-[10px] text-slate-600 font-bold uppercase tracking-zen">Objective</label>
                          <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-slate-800 pl-3">
                            {legalCase.description}
                          </p>
                       </div>

                       {(legalCase.nextHearing || legalCase.deadline) && (
                         <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                            {legalCase.nextHearing && (
                              <div className="flex items-center gap-2 text-xs text-red-400">
                                 <Calendar className="w-3 h-3" />
                                 <span className="font-mono">{legalCase.nextHearing}</span>
                              </div>
                            )}
                            {legalCase.deadline && (
                              <div className="flex items-center gap-2 text-xs text-amber-400">
                                 <Clock className="w-3 h-3" />
                                 <span className="font-mono">{legalCase.deadline}</span>
                              </div>
                            )}
                         </div>
                       )}
                    </div>
                    
                    {/* Actions */}
                    <div className="p-3 bg-black/20 border-t border-white/5 flex justify-end group-hover:bg-black/40 transition-colors">
                       <button className="text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                         ACCESS FILE <FileText className="w-3 h-3" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'INTELLIGENCE' && (
          <div className="h-full pb-6">
            <IntelligencePanel />
          </div>
        )}

        {activeTab === 'AUTOLEX' && (
          <div className="h-full pb-6">
            <AutoLexArchitect initialMode={autoLexMode} />
          </div>
        )}

        {activeTab === 'ROSETTA' && (
          <div className="h-full pb-6">
            <RosettaStone />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
