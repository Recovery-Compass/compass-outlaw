import React, { useState } from 'react';
import { draftLegalStrategy, LegalStrategyResult } from '../services/geminiService';
import { AnalysisStatus } from '../types';
import { Gavel, AlertTriangle, Send, FileText, Settings, PenTool } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AutoLexArchitect: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [draftResult, setDraftResult] = useState<LegalStrategyResult | null>(null);

  const [recipient, setRecipient] = useState("Albert J. Nicora (Opposing Counsel)");
  const [keyFacts, setKeyFacts] = useState("Client is Co-Executor. Trust assets are being misappropriated. House in Salinas is Trust property, not subject to probate.");
  const [desiredOutcome, setDesiredOutcome] = useState("Immediate confirmation of Trust asset status. Access to keys. Halt all probate proceedings.");
  const [tone, setTone] = useState<'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'>('FORMAL');

  const handleDrafting = async () => {
    setStatus(AnalysisStatus.THINKING);
    setDraftResult(null);
    const result = await draftLegalStrategy(recipient, keyFacts, desiredOutcome, tone);
    setDraftResult(result);
    setStatus(AnalysisStatus.COMPLETE);
  };

  return (
    <div className="w-full h-full flex flex-col bg-void-light/50 border border-slate-800 backdrop-blur-sm p-6 rounded-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-3">
          <Gavel className="w-6 h-6 text-indigo-500" />
          AUTOLEX ARCHITECT V2
        </h2>
        <div className={`text-xs font-mono px-2 py-1 rounded border ${
          status === AnalysisStatus.THINKING ? 'border-indigo-500/50 text-indigo-500 animate-pulse' : 
          status === AnalysisStatus.COMPLETE ? 'border-emerald-500/50 text-emerald-500' : 'border-slate-700 text-slate-500'
        }`}>
          {status === AnalysisStatus.IDLE ? 'READY' : status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Input Control Panel */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Settings className="w-3 h-3" /> Strategy Configuration
            </label>
            <div className="grid grid-cols-3 gap-2">
                {['AGGRESSIVE', 'COLLABORATIVE', 'FORMAL'].map((t) => (
                    <button 
                        key={t}
                        onClick={() => setTone(t as any)}
                        className={`py-2 text-[10px] font-bold border rounded-sm transition-all ${
                            tone === t 
                            ? 'bg-indigo-500 text-white border-indigo-500' 
                            : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Recipient / Target</label>
            <input 
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none rounded-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Key Facts / Evidence</label>
            <textarea 
              value={keyFacts}
              onChange={(e) => setKeyFacts(e.target.value)}
              className="w-full bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none rounded-sm h-32 font-mono resize-none"
            />
          </div>

           <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">Desired Outcome</label>
            <textarea 
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              className="w-full bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none rounded-sm h-24 font-mono resize-none"
            />
          </div>
          
          <button
            onClick={handleDrafting}
            disabled={status === AnalysisStatus.THINKING}
            className="mt-4 py-3 bg-indigo-600/10 border border-indigo-600/30 text-indigo-500 hover:bg-indigo-600/20 hover:text-indigo-400 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2"
          >
            {status === AnalysisStatus.THINKING ? (
              <span className="animate-pulse">DRAFTING...</span>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                GENERATE LEGAL STRATEGY
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="relative h-full bg-white text-slate-900 border border-slate-200 rounded-sm p-6 overflow-hidden flex flex-col shadow-inner font-serif">
           {/* Paper Effect Overlay */}
           <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
           
           {!draftResult && status !== AnalysisStatus.THINKING && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
               <FileText className="w-12 h-12 opacity-20" />
               <p className="text-xs font-sans uppercase tracking-widest">Document Workspace Empty</p>
             </div>
           )}

           {status === AnalysisStatus.THINKING && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
               <p className="text-xs font-mono text-indigo-500 animate-pulse">COMPOSING...</p>
             </div>
           )}

           {draftResult && (
             <div className="flex-1 overflow-y-auto z-10">
               <div className="prose prose-sm max-w-none text-slate-800">
                 <ReactMarkdown>
                   {draftResult.text}
                 </ReactMarkdown>
               </div>
               
               <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-2 print:hidden">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Send className="w-3 h-3" /> Export to PDF
                    </button>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AutoLexArchitect;