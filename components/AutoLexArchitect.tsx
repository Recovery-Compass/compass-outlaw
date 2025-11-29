import React, { useState } from 'react';
import { draftLegalStrategy, LegalStrategyResult, loadComplaintTemplate } from '../services/geminiService';
import { AnalysisStatus } from '../types';
import { Gavel, AlertTriangle, FileText, Settings, PenTool, Scale, ExternalLink, CheckCircle, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

const AutoLexArchitect: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [draftResult, setDraftResult] = useState<LegalStrategyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'drafting' | 'complaint'>('drafting');
  const [complaintText] = useState<string>(loadComplaintTemplate());
  const [copied, setCopied] = useState(false);

  const [recipient, setRecipient] = useState("Albert J. Nicora (Opposing Counsel)");
  const [keyFacts, setKeyFacts] = useState("Client is Co-Executor. Trust assets are being misappropriated. House in Salinas is Trust property, not subject to probate.");
  const [desiredOutcome, setDesiredOutcome] = useState("Immediate confirmation of Trust asset status. Access to keys. Halt all probate proceedings.");
  const [tone, setTone] = useState<'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'>('FORMAL');

  const handleCopyComplaint = async () => {
    await navigator.clipboard.writeText(complaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileComplaint = () => {
    window.open('https://apps.calbar.ca.gov/complaint/', '_blank');
  };

  const exportToPDF = (content: string, title: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 72; // 1 inch margins (CRC 2.111)
    const lineHeight = 24; // Double-spaced (CRC 2.111)
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Set font - Times New Roman equivalent
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    // Add line numbers column (CRC 2.111 requirement)
    const addLineNumber = (lineNum: number, y: number) => {
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(String(lineNum), 36, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    };

    // Header
    doc.setFontSize(10);
    doc.text('COMPASS OUTLAW - LEGAL DOCUMENT', margin, 36);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin - 60, 36);
    doc.setFontSize(12);

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    const titleLines = doc.splitTextToSize(title.toUpperCase(), maxWidth);
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight;
    });
    yPosition += lineHeight;

    // Body text
    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    // Strip markdown formatting for clean PDF
    const cleanContent = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/\n{3,}/g, '\n\n'); // Normalize line breaks

    const paragraphs = cleanContent.split('\n\n');
    let lineNumber = 1;

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === '') return;

      const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
      
      lines.forEach((line: string) => {
        // Check for page break
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          lineNumber = 1;
        }

        addLineNumber(lineNumber, yPosition);
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
        lineNumber++;
      });

      yPosition += lineHeight / 2; // Paragraph spacing
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 36,
        { align: 'center' }
      );
    }

    // Save
    const fileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportDraft = () => {
    if (draftResult) {
      exportToPDF(draftResult.text, `Legal Strategy - ${recipient}`);
    }
  };

  const handleExportComplaint = () => {
    exportToPDF(complaintText, 'State Bar Complaint - Kirk A Kolodji');
  };

  const handleDrafting = async () => {
    setStatus(AnalysisStatus.THINKING);
    setDraftResult(null);
    const result = await draftLegalStrategy(recipient, keyFacts, desiredOutcome, tone);
    setDraftResult(result);
    setStatus(AnalysisStatus.COMPLETE);
  };

  return (
    <div className="w-full h-full flex flex-col bg-void-light/50 border border-slate-800 backdrop-blur-sm p-6 rounded-sm">
      <div className="flex items-center justify-between mb-4">
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

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('drafting')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
            activeTab === 'drafting'
              ? 'bg-indigo-600 text-white'
              : 'bg-transparent text-slate-400 border border-slate-700 hover:border-slate-500'
          }`}
        >
          <PenTool className="w-3 h-3" /> Drafting Engine
        </button>
        <button
          onClick={() => setActiveTab('complaint')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
            activeTab === 'complaint'
              ? 'bg-red-600 text-white'
              : 'bg-transparent text-slate-400 border border-slate-700 hover:border-red-500'
          }`}
        >
          <Scale className="w-3 h-3" /> State Bar Complaint
        </button>
      </div>

      {/* State Bar Complaint Panel */}
      {activeTab === 'complaint' && (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Filing Guide */}
          <div className="bg-red-950/30 border border-red-800/50 rounded-sm p-4">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Step-by-Step Filing Guide
            </h3>
            <ol className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">1.</span>
                <span>Click "Copy Complaint Text" below to copy the full complaint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">2.</span>
                <span>Paste into Word/Google Docs, then Save as PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">3.</span>
                <span>Sign the Declaration section (Eric B. Jones signature line)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">4.</span>
                <span>Click "File Complaint" to open State Bar portal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">5.</span>
                <span>On portal: Start New Complaint → Enter Filer Info → Enter Respondent (Bar #327031)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">6.</span>
                <span>Paste Statement of Facts → Upload PDF + SMS Evidence + Email Exhibits</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleCopyComplaint}
              className="flex-1 min-w-[140px] py-3 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED!' : 'COPY TEXT'}
            </button>
            <button
              onClick={handleExportComplaint}
              className="flex-1 min-w-[140px] py-3 bg-indigo-600 border border-indigo-500 text-white hover:bg-indigo-700 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              EXPORT PDF
            </button>
            <button
              onClick={handleFileComplaint}
              className="flex-1 min-w-[140px] py-3 bg-red-600 border border-red-500 text-white hover:bg-red-700 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              FILE COMPLAINT
            </button>
          </div>

          {/* Complaint Text Viewer */}
          <div className="flex-1 bg-white text-slate-900 border border-slate-200 rounded-sm p-6 overflow-y-auto shadow-inner font-serif">
            <div className="prose prose-sm max-w-none text-slate-800">
              <ReactMarkdown>{complaintText}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Drafting Engine Panel */}
      {activeTab === 'drafting' && (
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
                     <button 
                       onClick={handleExportDraft}
                       className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 rounded-sm transition-colors"
                     >
                         <Download className="w-3 h-3" /> Export to PDF
                     </button>
                </div>
              </div>
            )}
        </div>
      </div>
      )}
    </div>
  );
};

export default AutoLexArchitect;