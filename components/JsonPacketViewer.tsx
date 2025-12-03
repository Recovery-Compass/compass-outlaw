import React, { useState } from 'react';
import { LegalDraft, EvidencePacket, VrtResultV15_1, DriftCoordinate } from '../types';
import { FORBIDDEN_TERMS } from '../constants';
import { FileJson, AlertTriangle, Copy, Download, Eye, BarChart3 } from 'lucide-react';
import { useToast } from '@/src/hooks/use-toast';

interface JsonPacketViewerProps {
  legalDraft?: LegalDraft | null;
  evidencePacket?: EvidencePacket | null;
  vrtResult?: VrtResultV15_1 | null;
}

const JsonPacketViewer: React.FC<JsonPacketViewerProps> = ({
  legalDraft,
  evidencePacket,
  vrtResult
}) => {
  const [activeTab, setActiveTab] = useState<'draft' | 'evidence' | 'drift'>('draft');
  const { toast } = useToast();

  const highlightForbiddenTerms = (text: string): React.ReactNode => {
    let result = text;
    let hasForbidden = false;
    
    FORBIDDEN_TERMS.forEach(term => {
      if (text.includes(term)) {
        hasForbidden = true;
        result = result.replace(
          new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          `⚠️${term}⚠️`
        );
      }
    });
    
    return hasForbidden ? (
      <span className="text-status-critical">{result}</span>
    ) : (
      <span>{text}</span>
    );
  };

  const handleCopy = async (data: object | null) => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "JSON data copied for backend processing"
    });
  };

  const handleDownload = (data: object | null, filename: string) => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "JSON Exported",
      description: "Process with Claude CLI + XeLaTeX for court-ready PDF. jsPDF is FORBIDDEN."
    });
  };

  const renderDriftReport = () => {
    if (!vrtResult) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No VRT results available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-sm p-4">
            <span className="text-xs text-muted-foreground block mb-1">SSIM Score</span>
            <p className={`text-2xl font-mono ${
              vrtResult.ssimScore >= 0.99 ? 'text-status-active' : 'text-status-critical'
            }`}>
              {(vrtResult.ssimScore * 100).toFixed(2)}%
            </p>
            <span className="text-[10px] text-muted-foreground">Target: ≥99%</span>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <span className="text-xs text-muted-foreground block mb-1">Max Drift</span>
            <p className={`text-2xl font-mono ${
              vrtResult.driftOffset <= 2 ? 'text-status-active' : 'text-status-critical'
            }`}>
              {vrtResult.driftOffset.toFixed(1)}px
            </p>
            <span className="text-[10px] text-muted-foreground">Target: ≤2px</span>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <span className="text-xs text-muted-foreground block mb-1">Iterations</span>
            <p className="text-2xl font-mono text-foreground">
              {vrtResult.iterations}/10
            </p>
            <span className="text-[10px] text-muted-foreground">Alignment attempts</span>
          </div>
        </div>

        {/* Drift Coordinates Table */}
        {vrtResult.driftCoordinates && vrtResult.driftCoordinates.length > 0 && (
          <div className="bg-card border border-border rounded-sm">
            <div className="p-3 border-b border-border">
              <h5 className="text-xs font-mono text-muted-foreground uppercase">Drift Coordinates</h5>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="p-2 text-left">Page</th>
                    <th className="p-2 text-left">Line</th>
                    <th className="p-2 text-left">Drift</th>
                    <th className="p-2 text-left">Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {vrtResult.driftCoordinates.map((coord, idx) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="p-2 font-mono">{coord.page}</td>
                      <td className="p-2 font-mono">{coord.line}</td>
                      <td className={`p-2 font-mono ${
                        Math.abs(coord.drift_px) > 2 ? 'text-status-critical' : 'text-status-active'
                      }`}>
                        {coord.drift_px.toFixed(2)}px
                      </td>
                      <td className="p-2 font-mono text-muted-foreground">{coord.direction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Golden Master Reference */}
        <div className="text-xs text-muted-foreground font-mono">
          Compared against: {vrtResult.goldenMasterUsed}
        </div>
      </div>
    );
  };

  const currentData = activeTab === 'draft' ? legalDraft : activeTab === 'evidence' ? evidencePacket : null;

  return (
    <div className="bg-card border border-border rounded-sm flex flex-col h-full">
      {/* Tab Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 ${
              activeTab === 'draft'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileJson className="w-3 h-3" /> Legal Draft
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 ${
              activeTab === 'evidence'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-3 h-3" /> Evidence
          </button>
          <button
            onClick={() => setActiveTab('drift')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 ${
              activeTab === 'drift'
                ? 'bg-status-pending text-black'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3 h-3" /> Drift Report
          </button>
        </div>

        {activeTab !== 'drift' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(currentData)}
              disabled={!currentData}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Copy JSON"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(currentData, activeTab === 'draft' ? 'legal_draft' : 'evidence_packet')}
              disabled={!currentData}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Download JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'drift' ? (
          renderDriftReport()
        ) : currentData ? (
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
            {highlightForbiddenTerms(JSON.stringify(currentData, null, 2))}
          </pre>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
            <FileJson className="w-12 h-12 opacity-20 mb-4" />
            <p className="text-sm">No {activeTab === 'draft' ? 'legal draft' : 'evidence packet'} loaded</p>
            <p className="text-xs mt-2">Generate documents to view JSON structure</p>
          </div>
        )}
      </div>

      {/* Forbidden Terms Warning */}
      {currentData && FORBIDDEN_TERMS.some(term => JSON.stringify(currentData).includes(term)) && (
        <div className="p-3 border-t border-status-critical/30 bg-status-critical/10 flex items-center gap-2 text-status-critical text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>Warning: Forbidden terms detected. Review before proceeding.</span>
        </div>
      )}
    </div>
  );
};

export default JsonPacketViewer;