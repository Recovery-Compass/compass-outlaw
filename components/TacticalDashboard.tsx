import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Clock, Shield, FileCheck, Zap, Target, ChevronRight } from 'lucide-react';
import { DEC_1_VERIFICATION_PROTOCOL } from '../constants';
import { VerificationTask } from '../types';

interface TacticalPhase {
  id: number;
  name: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETE' | 'BLOCKED';
  gate?: TacticalGate;
}

interface TacticalGate {
  id: 'G1' | 'G2' | 'G3';
  name: string;
  criteria: string;
  status: 'GO' | 'NO-GO' | 'CHECKING';
}

const TacticalDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState<Record<string, VerificationTask>>(DEC_1_VERIFICATION_PROTOCOL);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate countdowns
  const foreclosureDate = new Date('2025-12-03T17:00:00');
  const hearingDate = new Date('2026-01-06T08:30:00');
  
  const foreclosureDiff = foreclosureDate.getTime() - currentTime.getTime();
  const hearingDiff = hearingDate.getTime() - currentTime.getTime();
  
  const foreclosureDays = Math.floor(foreclosureDiff / (1000 * 60 * 60 * 24));
  const foreclosureHours = Math.floor((foreclosureDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const hearingDays = Math.floor(hearingDiff / (1000 * 60 * 60 * 24));

  // 5-Phase Progress
  const phases: TacticalPhase[] = [
    { id: 1, name: 'PRE-FLIGHT', status: 'COMPLETE' },
    { id: 2, name: 'EVIDENCE', status: 'COMPLETE', gate: { id: 'G1', name: 'API Health', criteria: 'Gemini active', status: 'GO' } },
    { id: 3, name: 'GENERATION', status: 'ACTIVE', gate: { id: 'G2', name: 'Evidence Integrity', criteria: 'Files verified', status: 'GO' } },
    { id: 4, name: 'CRC 2.111', status: 'PENDING', gate: { id: 'G3', name: 'Formatting', criteria: 'Court compliant', status: 'CHECKING' } },
    { id: 5, name: 'DEPLOY', status: 'PENDING' },
  ];

  const completedCount = (Object.values(tasks) as VerificationTask[]).filter(t => t.status === 'COMPLETE').length;
  const totalTasks = Object.keys(tasks).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const toggleTaskStatus = (key: string) => {
    setTasks(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: prev[key].status === 'COMPLETE' ? 'INCOMPLETE' : 'COMPLETE'
      }
    }));
  };

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'COMPLETE': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'ACTIVE': return <Zap className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'BLOCKED': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getGateColor = (status: string) => {
    switch (status) {
      case 'GO': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'NO-GO': return 'bg-red-500/20 border-red-500/50 text-red-400';
      default: return 'bg-amber-500/20 border-amber-500/50 text-amber-400 animate-pulse';
    }
  };

  return (
    <div className="space-y-4">
      {/* Grid-Lock Sprint Banner - Fixed, Non-Dismissible */}
      <div className="bg-amber-950 border border-amber-500/50 px-4 py-3 rounded-sm">
        <div className="flex items-center justify-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            Grid-Lock Sprint (Nov 20-21, 2025): 0/7 PDFs Generated. Never Again.
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        </div>
      </div>

      {/* Main Tactical Panel */}
      <div className="bg-void-light/40 border border-white/10 rounded-sm overflow-hidden">
        {/* Header with Mission Clock */}
        <div className="p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                Tactical Command
              </h2>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Foreclosure Countdown */}
              <div className={`flex items-center gap-2 ${foreclosureDays <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono">
                  FORECLOSURE: {foreclosureDays}D {foreclosureHours}H
                </span>
              </div>
              
              {/* Hearing Countdown */}
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono">
                  HEARING: {hearingDays}D
                </span>
              </div>
              
              {/* Current Time */}
              <span className="text-xs font-mono text-slate-500">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Phase Progress Stepper */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {phases.map((phase, index) => (
              <React.Fragment key={phase.id}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-sm border flex items-center justify-center ${
                    phase.status === 'COMPLETE' ? 'bg-emerald-500/20 border-emerald-500/50' :
                    phase.status === 'ACTIVE' ? 'bg-amber-500/20 border-amber-500/50' :
                    phase.status === 'BLOCKED' ? 'bg-red-500/20 border-red-500/50' :
                    'bg-slate-800/50 border-slate-700'
                  }`}>
                    {getPhaseIcon(phase.status)}
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${
                    phase.status === 'ACTIVE' ? 'text-amber-400' :
                    phase.status === 'COMPLETE' ? 'text-emerald-400' :
                    'text-slate-500'
                  }`}>
                    {phase.name}
                  </span>
                </div>
                {index < phases.length - 1 && (
                  <ChevronRight className={`w-4 h-4 ${
                    phases[index + 1].status !== 'PENDING' ? 'text-emerald-500' : 'text-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* GO/NO-GO Gates */}
        <div className="p-4 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              GO/NO-GO Gates
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {phases.filter(p => p.gate).map(phase => (
              <div 
                key={phase.gate!.id}
                className={`px-3 py-2 border rounded-sm ${getGateColor(phase.gate!.status)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">{phase.gate!.id}</span>
                  <span className="text-[10px] font-bold uppercase">{phase.gate!.status}</span>
                </div>
                <p className="text-xs">{phase.gate!.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Task Progress */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                December 1 Verification Protocol
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {completedCount}/{totalTasks} ({progressPercent}%)
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-slate-800 rounded-sm mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Task Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {(Object.entries(tasks) as [string, VerificationTask][]).map(([key, task]) => (
              <button
                key={key}
                onClick={() => toggleTaskStatus(key)}
                className={`p-3 border rounded-sm text-left transition-all ${
                  task.status === 'COMPLETE' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' 
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  {task.status === 'COMPLETE' 
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Circle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <span className={`text-[10px] font-mono ${
                      task.status === 'COMPLETE' ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {key}
                    </span>
                    <p className={`text-xs ${
                      task.status === 'COMPLETE' ? 'text-slate-300' : 'text-slate-400'
                    }`}>
                      {task.task}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Critical Alert - Foreclosure Warning */}
        {foreclosureDays <= 3 && (
          <div className="p-4 bg-red-950/50 border-t border-red-500/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-red-400">
                  CRITICAL: Jones Trust Foreclosure in {foreclosureDays}D {foreclosureHours}H
                </p>
                <p className="text-xs text-red-400/70">
                  Grid-Lock Sprint PC 850 filing required. Irreversible asset loss imminent.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalDashboard;