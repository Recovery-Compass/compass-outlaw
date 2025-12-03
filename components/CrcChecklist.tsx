import React from 'react';
import { CrcChecklistItem } from '../types';
import { CRC_2111_CHECKLIST_V15_1, GRID_LOCK_SPEC_V15_1 } from '../constants';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

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
    
    // Auto-determine status for SSIM and drift based on values
    if (id === 'ssim' && ssimScore !== undefined) {
      return ssimScore >= GRID_LOCK_SPEC_V15_1.targetSSIM ? 'PASS' : 'FAIL';
    }
    if (id === 'drift' && driftOffset !== undefined) {
      return driftOffset <= GRID_LOCK_SPEC_V15_1.maxDriftPx ? 'PASS' : 'FAIL';
    }
    
    return 'PENDING';
  };

  const passCount = CRC_2111_CHECKLIST_V15_1.filter(item => getStatus(item.id) === 'PASS').length;
  const failCount = CRC_2111_CHECKLIST_V15_1.filter(item => getStatus(item.id) === 'FAIL').length;
  const isGoReady = failCount === 0 && passCount === CRC_2111_CHECKLIST_V15_1.length;

  return (
    <div className="bg-card border border-border rounded-sm">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          CRC 2.111 Compliance Matrix (V15.1 Nuclear)
        </h4>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-status-active">{passCount} PASS</span>
          <span className="text-status-critical">{failCount} FAIL</span>
          <span className="text-muted-foreground">{12 - passCount - failCount} PENDING</span>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-border">
        {CRC_2111_CHECKLIST_V15_1.map((item) => {
          const status = getStatus(item.id);
          
          return (
            <div 
              key={item.id}
              className={`p-3 flex items-center gap-3 ${
                status === 'FAIL' ? 'bg-status-critical/5' : ''
              }`}
            >
              {/* Status Icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                status === 'PASS' 
                  ? 'text-status-active' 
                  : status === 'FAIL'
                    ? 'text-status-critical'
                    : 'text-muted-foreground'
              }`}>
                {status === 'PASS' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : status === 'FAIL' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              {/* Label */}
              <span className={`flex-1 text-sm ${
                status === 'PASS' 
                  ? 'text-foreground' 
                  : status === 'FAIL'
                    ? 'text-status-critical'
                    : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>

              {/* Critical Badge */}
              {item.critical && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-status-critical/20 text-status-critical rounded">
                  Critical
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* GO/NO-GO Gate */}
      <div className={`p-4 border-t border-border ${
        isGoReady ? 'bg-status-active/10' : failCount > 0 ? 'bg-status-critical/10' : 'bg-muted/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isGoReady ? (
              <CheckCircle className="w-5 h-5 text-status-active" />
            ) : failCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-status-critical" />
            ) : (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`font-bold uppercase tracking-wider ${
              isGoReady ? 'text-status-active' : failCount > 0 ? 'text-status-critical' : 'text-muted-foreground'
            }`}>
              {isGoReady ? 'GO - Ready for Filing' : failCount > 0 ? 'NO-GO - Fix Critical Issues' : 'Pending Verification'}
            </span>
          </div>

          {/* Spec Reference */}
          <div className="text-[10px] font-mono text-muted-foreground">
            Grid-Lock: {GRID_LOCK_SPEC_V15_1.baselineskipPt}pt | 
            lineskiplimit: {GRID_LOCK_SPEC_V15_1.lineskiplimitPt}pt | 
            Engine: {GRID_LOCK_SPEC_V15_1.fontEngine}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrcChecklist;