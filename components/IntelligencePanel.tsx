import React, { useState } from 'react';
import { generateIntelligenceReport, IntelligenceResult } from '../services/geminiService';
import { AnalysisStatus } from '../types';
import { BrainCircuit, AlertTriangle, CheckCircle, Terminal, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const IntelligencePanel: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [reportData, setReportData] = useState<IntelligenceResult | null>(null);

  // Default context based on the persona prompt, but editable by user
  const [fidelityContext, setFidelityContext] = useState("Pending approval. Emails indicate 'under review'. Need specifically date estimation.");
  const [trustContext, setTrustContext] = useState("Anuar says sale is pending. No escrow number provided yet.");
  const [buiContext, setBuiContext] = useState("Eric is demanding $7,500 refund. Risk of fee retaliation?");

  const handleRunAnalysis = async () => {
    setStatus(AnalysisStatus.THINKING);
    setReportData(null);
    const result = await generateIntelligenceReport(fidelityContext, trustContext, buiContext);
    setReportData(result);
    setStatus(AnalysisStatus.COMPLETE);
  };

  return (
    <div className="w-full h-full flex flex-col bg-void-light/50 border border-slate-800 backdrop-blur-sm p-6 rounded-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-amber-500" />
          FINANCIAL INTELLIGENCE
        </h2>
        <div className={`text-xs font-mono px-2 py-1 rounded border ${
          status === AnalysisStatus.THINKING ? 'border-amber-500/50 text-amber-500 animate-pulse' : 
          status === AnalysisStatus.COMPLETE ? 'border-emerald-500/50 text-emerald-500' : 'border-slate-700 text-slate-500'
        }`}>
          {status === AnalysisStatus.IDLE ? 'STANDBY' : status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Input Section */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Lifeline 1: Fidelity Data</label>
            <textarea 
              value={fidelityContext}
              onChange={(e) => setFidelityContext(e.target.value)}
              className="w-full bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-slate-600 focus:outline-none rounded-sm h-24 font-mono resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Lifeline 2: Trust Data</label>
            <textarea 
              value={trustContext}
              onChange={(e) => setTrustContext(e.target.value)}
              className="w-full bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-slate-600 focus:outline-none rounded-sm h-24 font-mono resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">H Bui Refund Scenario</label>
            <textarea 
              value={buiContext}
              onChange={(e) => setBuiContext(e.target.value)}
              className="w-full bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-slate-600 focus:outline-none rounded-sm h-24 font-mono resize-none"
            />
          </div>
          
          <button
            onClick={handleRunAnalysis}
            disabled={status === AnalysisStatus.THINKING}
            className="mt-4 py-3 bg-amber-600/10 border border-amber-600/30 text-amber-500 hover:bg-amber-600/20 hover:text-amber-400 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2"
          >
            {status === AnalysisStatus.THINKING ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              <>
                <Terminal className="w-4 h-4" />
                EXECUTE ANALYSIS
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="relative h-full bg-black/40 border border-slate-800 rounded-sm p-4 overflow-hidden flex flex-col">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50"></div>
           
           {!reportData && status !== AnalysisStatus.THINKING && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-700 space-y-4">
               <AlertTriangle className="w-12 h-12 opacity-20" />
               <p className="text-xs font-mono uppercase tracking-widest">Awaiting Data Input</p>
             </div>
           )}

           {status === AnalysisStatus.THINKING && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <div className="w-16 h-16 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin"></div>
               <p className="text-xs font-mono text-amber-500 animate-pulse">ESTABLISHING UPLINK...</p>
             </div>
           )}

           {reportData && (
             <div className="flex-1 overflow-y-auto prose prose-invert prose-sm max-w-none font-mono text-slate-300">
               <ReactMarkdown
                 components={{
                   h2: ({node, ...props}) => <h2 className="text-amber-500 border-b border-amber-500/20 pb-2 uppercase tracking-widest text-lg mt-0" {...props} />,
                   strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                   p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-xs md:text-sm" {...props} />,
                   ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-2 mb-4" {...props} />,
                   li: ({node, ...props}) => <li className="text-slate-400" {...props} />,
                 }}
               >
                 {reportData.text}
               </ReactMarkdown>

               {reportData.sources.length > 0 && (
                 <div className="mt-8 pt-4 border-t border-slate-800/50">
                    <h4 className="text-[10px] uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                       <CheckCircle className="w-3 h-3" /> Verified Sources
                    </h4>
                    <ul className="space-y-2">
                        {reportData.sources.map((source, idx) => (
                            <li key={idx} className="bg-void-light/30 rounded p-2 border border-slate-800 hover:border-emerald-500/30 transition-colors">
                                <a 
                                  href={source.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center justify-between text-xs text-slate-400 hover:text-emerald-400 group"
                                >
                                    <span className="truncate pr-4">{idx + 1}. {source.title}</span>
                                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                </a>
                            </li>
                        ))}
                    </ul>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default IntelligencePanel;