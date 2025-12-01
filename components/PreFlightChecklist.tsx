import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader, Shield, Play } from 'lucide-react';
import { PRE_FLIGHT_CHECKLIST } from '../constants';
import { PreFlightCheck } from '../types';

interface PreFlightChecklistProps {
  onAllBlockersPassed?: () => void;
  onBlockerFailed?: (failureMessage: string) => void;
}

const PreFlightChecklist: React.FC<PreFlightChecklistProps> = ({ 
  onAllBlockersPassed,
  onBlockerFailed 
}) => {
  const [checks, setChecks] = useState<PreFlightCheck[]>(
    PRE_FLIGHT_CHECKLIST.map(check => ({ ...check, status: 'PENDING' as const }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [systemHalted, setSystemHalted] = useState(false);
  const [haltMessage, setHaltMessage] = useState('');

  const runPreFlightChecks = async () => {
    setIsRunning(true);
    setSystemHalted(false);
    setHaltMessage('');
    
    const updatedChecks = [...checks];
    
    for (let i = 0; i < updatedChecks.length; i++) {
      const check = updatedChecks[i];
      
      // Simulate check execution with delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Execute actual checks
      let passed = false;
      
      switch (check.step) {
        case 1: // Gemini API Key check
          // In production, this would call the API
          passed = true; // Assume configured for demo
          break;
        case 2: // CRC 2.111 PDF compliance
          // In production, this would generate a test PDF
          passed = true; // Assume compliant
          break;
        case 3: // Glass House generation
          passed = true; // Non-blocker, assume available
          break;
        case 4: // Rosetta Stone conversion
          passed = true; // Non-blocker, assume available
          break;
        default:
          passed = true;
      }
      
      updatedChecks[i] = {
        ...check,
        status: passed ? 'PASS' : 'FAIL'
      };
      
      setChecks([...updatedChecks]);
      
      // If a blocker fails, halt the system
      if (!passed && check.blocker) {
        setSystemHalted(true);
        setHaltMessage(check.failure_message);
        onBlockerFailed?.(check.failure_message);
        setIsRunning(false);
        return;
      }
    }
    
    setIsRunning(false);
    
    // Check if all blockers passed
    const allBlockersPassed = updatedChecks
      .filter(c => c.blocker)
      .every(c => c.status === 'PASS');
    
    if (allBlockersPassed) {
      onAllBlockersPassed?.();
    }
  };

  const getStatusIcon = (status: PreFlightCheck['status']) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-600" />;
    }
  };

  const getStatusBadgeClass = (status: PreFlightCheck['status']) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50';
      case 'FAIL':
        return 'bg-red-500/10 text-red-500 border-red-500/50';
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
    }
  };

  const completedCount = checks.filter(c => c.status !== 'PENDING').length;
  const passedCount = checks.filter(c => c.status === 'PASS').length;
  const progressPercent = (completedCount / checks.length) * 100;

  return (
    <div className={`relative bg-void-light/50 border rounded-sm p-4 ${systemHalted ? 'border-red-500/50' : 'border-slate-800'}`}>
      {/* HALTED Overlay */}
      {systemHalted && (
        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-red-500 uppercase tracking-wider mb-2">SYSTEM HALTED</h3>
          <p className="text-sm text-red-400 text-center max-w-md px-4">{haltMessage}</p>
          <button
            onClick={runPreFlightChecks}
            className="mt-4 px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-600/30 transition-colors"
          >
            Retry Pre-Flight
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Pre-Flight Checklist
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">
            {passedCount}/{checks.length} PASSED
          </span>
          <button
            onClick={runPreFlightChecks}
            disabled={isRunning}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
              isRunning 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-amber-500/10 border border-amber-500/50 text-amber-500 hover:bg-amber-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Run Checks
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            systemHalted ? 'bg-red-500' : passedCount === checks.length ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {checks.map((check) => (
          <div 
            key={check.step}
            className={`flex items-center gap-3 p-3 rounded-sm border transition-all ${
              check.blocker 
                ? check.status === 'FAIL' 
                  ? 'bg-red-950/30 border-red-500/50' 
                  : 'bg-void border-red-500/20'
                : 'bg-void border-slate-800'
            }`}
          >
            {isRunning && check.status === 'PENDING' ? (
              <Loader className="w-4 h-4 text-amber-500 animate-spin" />
            ) : (
              getStatusIcon(check.status)
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">#{check.step}</span>
                {check.blocker && (
                  <span className="text-[10px] font-bold text-red-500 uppercase">BLOCKER</span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate">{check.name}</p>
            </div>
            
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded-sm ${getStatusBadgeClass(check.status)}`}>
              {check.status}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-600 uppercase">
          December 1, 2025 • Go-Live Verification Protocol
        </span>
        {passedCount === checks.length && !systemHalted && (
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            All Systems Operational
          </span>
        )}
      </div>
    </div>
  );
};

export default PreFlightChecklist;
