import React, { useState } from 'react';
import { Target, Zap, Shield, FlaskConical, Calendar, ChevronRight, X } from 'lucide-react';
import { GLASS_HOUSE_SAYEGH, getDaysUntilHearing } from '../config/glassHouseConfig';

interface GlassHousePanelProps {
  onLaunchAutoLex: () => void;
}

const GlassHousePanel: React.FC<GlassHousePanelProps> = ({ onLaunchAutoLex }) => {
  const [showStrategy, setShowStrategy] = useState(false);
  const daysUntil = getDaysUntilHearing();
  const config = GLASS_HOUSE_SAYEGH;

  const getLeverIcon = (id: string) => {
    switch (id) {
      case 'golden-hammer': return <Zap className="w-4 h-4" />;
      case 'p01-smoking-gun': return <Target className="w-4 h-4" />;
      case 'clean-test': return <FlaskConical className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'BLOCKED': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <>
      {/* Main Panel */}
      <div className="relative bg-void-light/40 border border-red-500/30 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        {/* Header Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-red-950/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                <Target className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                  Glass House – Sayegh v. Sayegh
                  <span className="px-2 py-1 text-[10px] font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/50 rounded-sm animate-pulse">
                    CRITICAL
                  </span>
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {config.caseNumber} | LA Superior - Pasadena (Dept. L)
                </p>
              </div>
            </div>
            
            {/* Countdown */}
            <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-500/20 rounded-sm">
              <Calendar className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono text-slate-400">Hearing:</span>
              <span className="text-sm font-bold text-red-400">{config.hearingDate}</span>
              <span className="text-xs font-mono text-slate-500">({daysUntil} days)</span>
            </div>
          </div>
          
          <p className="mt-3 text-sm text-slate-400">
            <span className="text-slate-500">Objective:</span> {config.objective}
          </p>
        </div>

        {/* Levers Grid */}
        <div className="p-6">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            Key Leverage Points
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.levers.map((lever) => (
              <div 
                key={lever.id}
                className="group p-4 bg-void border border-white/5 hover:border-white/20 rounded-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white/5 rounded-sm text-slate-400 group-hover:text-emerald-500 transition-colors">
                    {getLeverIcon(lever.id)}
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border rounded-sm ${getStatusColor(lever.status)}`}>
                    {lever.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">{lever.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{lever.description}</p>
                <p className="text-[10px] font-mono text-slate-600">
                  Ref: {lever.evidenceRef}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-black/20 border-t border-white/5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowStrategy(true)}
            className="flex-1 py-3 px-4 bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-bold tracking-widest transition-all uppercase text-xs flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Open Glass House Strategy
          </button>
          <button
            onClick={onLaunchAutoLex}
            className="flex-1 py-3 px-4 bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600/20 hover:text-red-400 font-bold tracking-widest transition-all uppercase text-xs flex items-center justify-center gap-2"
          >
            Launch AutoLex for Sayegh Package
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strategy Modal */}
      {showStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-void-light border border-slate-700 rounded-sm shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 p-4 bg-void-light border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Glass House Strategy
              </h3>
              <button 
                onClick={() => setShowStrategy(false)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Objective */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mission Objective</h4>
                <p className="text-sm text-slate-300">
                  Expose Fahed's financial deception (FL-150 perjury) and invert the substance abuse 
                  narrative using Nuha's clean drug test. Secure immediate financial relief at the 
                  January 6, 2026 hearing.
                </p>
              </div>

              {/* SCL Framework */}
              <div className="p-4 bg-void border border-slate-800 rounded-sm">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">
                  SCL Framework Applied
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-bold text-red-400">SEISMIC:</span>
                    <span className="text-slate-400 ml-2">
                      FL-150 Line 11c is the fault line. $22,083/mo declared → $0 paid = perjury exposure.
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-cyan-400">CRYSTAL:</span>
                    <span className="text-slate-400 ml-2">
                      Clean test + P01 SMS solidified into Declaration + Exhibits.
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-orange-400">LAVA:</span>
                    <span className="text-slate-400 ml-2">
                      RFO flows into court as immediate support demand with impeachment package.
                    </span>
                  </div>
                </div>
              </div>

              {/* Trim Tab */}
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Trim Tab Action</h4>
                <p className="text-sm text-slate-300">
                  The <span className="font-bold text-amber-400">FL-150 Line 11c</span> is the small rudder 
                  that moves the big ship. One line of sworn testimony contradicts his payment behavior—
                  this invalidates his entire credibility.
                </p>
              </div>

              {/* 5-Bird Analysis */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">5-Bird Victory Analysis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-void border border-slate-800 rounded-sm">
                    <span className="text-emerald-500 font-bold">✓ OFFENSE:</span>
                    <span className="text-slate-400 ml-2">Financial perjury exposure</span>
                  </div>
                  <div className="p-2 bg-void border border-slate-800 rounded-sm">
                    <span className="text-emerald-500 font-bold">✓ RECOVERY:</span>
                    <span className="text-slate-400 ml-2">Retroactive support claim</span>
                  </div>
                  <div className="p-2 bg-void border border-slate-800 rounded-sm">
                    <span className="text-emerald-500 font-bold">✓ LOGISTICS:</span>
                    <span className="text-slate-400 ml-2">Sets up custody reversal</span>
                  </div>
                  <div className="p-2 bg-void border border-slate-800 rounded-sm">
                    <span className="text-emerald-500 font-bold">✓ TACTICAL:</span>
                    <span className="text-slate-400 ml-2">Forces immediate court action</span>
                  </div>
                  <div className="p-2 bg-void border border-slate-800 rounded-sm sm:col-span-2">
                    <span className="text-emerald-500 font-bold">✓ DETERRENCE:</span>
                    <span className="text-slate-400 ml-2">Demonstrates willingness to expose deception</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Package Documents</h4>
                <ol className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 text-xs font-bold rounded-sm">1</span>
                    Request for Order (RFO) – Urgent Support Argument
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 text-xs font-bold rounded-sm">2</span>
                    Nuha Declaration – Substance Narrative Inversion
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 text-xs font-bold rounded-sm">3</span>
                    Exhibit A-1 – Financial Impeachment Chart
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 text-xs font-bold rounded-sm">4</span>
                    Exhibit List & Evidence Index
                  </li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 p-4 bg-void-light border-t border-slate-700">
              <button
                onClick={() => {
                  setShowStrategy(false);
                  onLaunchAutoLex();
                }}
                className="w-full py-3 bg-red-600 text-white font-bold tracking-widest uppercase text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                Launch AutoLex to Generate Package
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlassHousePanel;
