import React from 'react';
import { CrcChecklistItem } from '../types';
import { CRC_2111_CHECKLIST_V15_2, GRID_LOCK_SPEC_V15_2 } from '../constants';
import { CheckCircle, XCircle, Clock, AlertTriangle, Ruler } from 'lucide-react';

interface CrcChecklistProps {
  checkResults?: Record<string, 'PASS' | 'FAIL' | 'PENDING'>;
  ssimScore?: number;
  driftOffset?: number;
}

const CrcChecklist: React.FC<CrcChecklistProps> = ({
  checkResults = {},
  ssimScore,
  driftOffset
}) => {
  const getStatus = (id: string): 'PASS' | 'FAIL' | 'PENDING' => {
    if (checkResults[id]) return checkResults[id];
    
    // Auto-determine status for SSIM and drift based on V15.2 thresholds
    if (id === 'ssim' && ssimScore !== undefined) {
      return ssimScore >= GRID_LOCK_SPEC_V15_2.targetSSIM ? 'PASS' : 'FAIL';
    }
    if (id === 'drift' && driftOffset !== undefined) {
      return driftOffset <= GRID_LOCK_SPEC_V15_2.maxDriftPx ? 'PASS' : 'FAIL';
    }
    
    return 'PENDING';
  };

  const passCount = CRC_2111_CHECKLIST_V15_2.filter(item => getStatus(item.id) === 'PASS').length;
  const failCount = CRC_2111_CHECKLIST_V15_2.filter(item => getStatus(item.id) === 'FAIL').length;
  const totalItems = CRC_2111_CHECKLIST_V15_2.length;
  const isGoReady = failCount === 0 && passCount === totalItems;

  return (
    <div className="bg-card border border-border rounded-sm shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            V15.2 Forensic Foundry Compliance
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className={passCount > 0 ? "text-status-active" : "text-muted-foreground"}>{passCount} PASS</span>
          <span className={failCount > 0 ? "text-status-critical" : "text-muted-foreground"}>{failCount} FAIL</span>
          <span className="text-muted-foreground">{totalItems - passCount - failCount} PENDING</span>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
        {CRC_2111_CHECKLIST_V15_2.map((item) => {
          const status = getStatus(item.id);
          
          return (
            <div 
              key={item.id}
              className={`p-3 flex items-center gap-3 transition-colors ${
                status === 'FAIL' ? 'bg-status-critical/10' : 'hover:bg-accent/5'
              }`}
            >
              {/* Status Icon */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === 'PASS' 
                  ? 'text-status-active bg-status-active/10' 
                  : status === 'FAIL'
                    ? 'text-status-critical bg-status-critical/10'
                    : 'text-muted-foreground bg-muted'
              }`}>
                {status === 'PASS' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : status === 'FAIL' ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Label */}
              <span className={`flex-1 text-xs font-mono ${
                status === 'PASS' 
                  ? 'text-foreground' 
                  : status === 'FAIL'
                    ? 'text-status-critical font-bold'
                    : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>

              {/* Critical Badge */}
              {item.critical && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-status-critical/10 text-status-critical rounded border border-status-critical/20">
                  Critical
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* GO/NO-GO Gate */}
      <div className={`p-4 border-t border-border ${
        isGoReady ? 'bg-status-active/10' : failCount > 0 ? 'bg-status-critical/10' : 'bg-card'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isGoReady ? (
              <CheckCircle className="w-5 h-5 text-status-active" />
            ) : failCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-status-critical animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`font-bold uppercase tracking-wider text-sm ${
              isGoReady ? 'text-status-active' : failCount > 0 ? 'text-status-critical' : 'text-muted-foreground'
            }`}>
              {isGoReady ? 'GO - FORENSIC READY' : failCount > 0 ? 'NO-GO - VIOLATIONS DETECTED' : 'Awaiting Validation'}
            </span>
          </div>

          {/* Spec Reference */}
          <div className="text-[9px] font-mono text-muted-foreground text-right hidden sm:block">
            Spec: V15.2 (PostScript)<br/>
            Engine: {GRID_LOCK_SPEC_V15_2.fontEngine}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrcChecklist;
