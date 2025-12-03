import React from 'react';
import { PipelineStage, VrtResultV15_1 } from '../types';
import { CheckCircle, XCircle, Loader2, FileText, Bot, FileCode, Target, Eye, User } from 'lucide-react';

interface PipelineTrackerProps {
  currentStage: PipelineStage;
  vrtResult?: VrtResultV15_1 | null;
  completedStages: PipelineStage[];
  failedStage?: PipelineStage | null;
}

const STAGES: { stage: PipelineStage; label: string; icon: React.ReactNode }[] = [
  { stage: PipelineStage.ROSETTA, label: 'Rosetta', icon: <FileText className="w-4 h-4" /> },
  { stage: PipelineStage.CLAUDE, label: 'Claude', icon: <Bot className="w-4 h-4" /> },
  { stage: PipelineStage.XELATEX, label: 'XeLaTeX', icon: <FileCode className="w-4 h-4" /> },
  { stage: PipelineStage.ALIGNING, label: 'Aligning', icon: <Target className="w-4 h-4" /> },
  { stage: PipelineStage.VRT, label: 'VRT', icon: <Eye className="w-4 h-4" /> },
  { stage: PipelineStage.HUMAN, label: 'Human', icon: <User className="w-4 h-4" /> },
];

const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  currentStage,
  vrtResult,
  completedStages,
  failedStage
}) => {
  const getStageStatus = (stage: PipelineStage) => {
    if (failedStage === stage) return 'failed';
    if (completedStages.includes(stage)) return 'complete';
    if (currentStage === stage) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          V15.1 Nuclear Pipeline
        </h4>
        {vrtResult && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className={vrtResult.ssimScore >= 0.99 ? 'text-status-active' : 'text-status-critical'}>
              SSIM: {(vrtResult.ssimScore * 100).toFixed(2)}%
            </span>
            <span className={vrtResult.driftOffset <= 2 ? 'text-status-active' : 'text-status-critical'}>
              Drift: {vrtResult.driftOffset.toFixed(1)}px
            </span>
            <span className="text-muted-foreground">
              Iter: {vrtResult.iterations}/10
            </span>
          </div>
        )}
      </div>

      {/* Stage Stepper */}
      <div className="flex items-center justify-between">
        {STAGES.map((stageInfo, index) => {
          const status = getStageStatus(stageInfo.stage);
          
          return (
            <React.Fragment key={stageInfo.stage}>
              {/* Stage Node */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  status === 'complete' 
                    ? 'bg-status-active/20 border-status-active text-status-active' 
                    : status === 'active'
                      ? 'bg-status-filing/20 border-status-filing text-status-filing animate-pulse'
                      : status === 'failed'
                        ? 'bg-status-critical/20 border-status-critical text-status-critical'
                        : 'bg-muted/50 border-muted text-muted-foreground'
                }`}>
                  {status === 'complete' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : status === 'failed' ? (
                    <XCircle className="w-5 h-5" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    stageInfo.icon
                  )}
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                  status === 'complete' 
                    ? 'text-status-active' 
                    : status === 'active'
                      ? 'text-status-filing'
                      : status === 'failed'
                        ? 'text-status-critical'
                        : 'text-muted-foreground'
                }`}>
                  {stageInfo.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  completedStages.includes(STAGES[index + 1].stage) || 
                  (completedStages.includes(stageInfo.stage) && currentStage === STAGES[index + 1].stage)
                    ? 'bg-status-active'
                    : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Alignment Progress (shown during ALIGNING stage) */}
      {currentStage === PipelineStage.ALIGNING && vrtResult && (
        <div className="mt-4 p-3 bg-status-pending/10 border border-status-pending/30 rounded-sm">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-status-pending">
              Adjusting \\topmargin for SSIM compliance...
            </span>
            <span className="text-muted-foreground">
              Target: ≥99% | Current: {(vrtResult.ssimScore * 100).toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-status-pending transition-all"
              style={{ width: `${vrtResult.ssimScore * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineTracker;