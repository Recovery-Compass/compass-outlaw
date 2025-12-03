import React, { useState, useEffect, useRef } from 'react';
import { draftLegalStrategy, LegalStrategyResult, loadComplaintTemplate, draftGlassHouseDocument } from '../services/geminiService';
import { AnalysisStatus, GlassHouseSection } from '../types';
import { Gavel, AlertTriangle, FileText, Settings, PenTool, Scale, ExternalLink, CheckCircle, Copy, Download, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { GLASS_HOUSE_SAYEGH } from '../config/glassHouseConfig';
import { CRC_2_111_SPEC } from '../constants';

interface AutoLexArchitectProps {
  initialMode?: 'default' | 'glass-house';
}

const AutoLexArchitect: React.FC<AutoLexArchitectProps> = ({ initialMode = 'default' }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [draftResult, setDraftResult] = useState<LegalStrategyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'drafting' | 'complaint' | 'glass-house'>(
    initialMode === 'glass-house' ? 'glass-house' : 'drafting'
  );
  const [complaintText] = useState<string>(loadComplaintTemplate());
  const [copied, setCopied] = useState(false);

  // Drafting Engine state
  const [recipient, setRecipient] = useState("Albert J. Nicora (Opposing Counsel)");
  const [keyFacts, setKeyFacts] = useState("Client is Co-Executor. Trust assets are being misappropriated. House in Salinas is Trust property, not subject to probate.");
  const [desiredOutcome, setDesiredOutcome] = useState("Immediate confirmation of Trust asset status. Access to keys. Halt all probate proceedings.");
  const [tone, setTone] = useState<'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'>('FORMAL');

  // Glass House state
  const [glassHouseSection, setGlassHouseSection] = useState<GlassHouseSection>('rfo');
  const [glassHouseContext, setGlassHouseContext] = useState(`PLACEHOLDER DATES (To be confirmed by Nuha):
- Date of Marriage: [MONTH DD, YYYY]
- Date of Separation: [MONTH DD, YYYY]  
- Date Fahed stopped paying support: [MONTH DD, YYYY]
- Date of clean drug test: October 9, 2025 (CONFIRMED)
- Children's birthdates: [CHILD 1: MM/DD/YYYY], [CHILD 2: MM/DD/YYYY]`);
  const [glassHouseResult, setGlassHouseResult] = useState<LegalStrategyResult | null>(null);
  const [glassHouseStatus, setGlassHouseStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  
  // Batch generation state
  const [allDocuments, setAllDocuments] = useState<Record<GlassHouseSection, LegalStrategyResult | null>>({
    'rfo': null,
    'declaration': null,
    'exhibit-a1': null,
    'exhibit-list': null
  });
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  
  // Ref for auto-scroll after generation
  const outputPanelRef = useRef<HTMLDivElement>(null);

  // Update tab when initialMode changes
  useEffect(() => {
    if (initialMode === 'glass-house') {
      setActiveTab('glass-house');
    }
  }, [initialMode]);

  const handleCopyComplaint = async () => {
    await navigator.clipboard.writeText(complaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileComplaint = () => {
    window.open('https://apps.calbar.ca.gov/complaint/', '_blank');
  };

  const exportToPDF = (content: string, title: string, filename?: string, caseInfo?: { name: string; number: string; proPer: string }) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    // Use CRC 2.111 specification from constants
    const margin = CRC_2_111_SPEC.margins.top;
    const lineHeight = CRC_2_111_SPEC.line_spacing;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Use CRC 2.111 font specification
    doc.setFont(CRC_2_111_SPEC.font.family, 'normal');
    doc.setFontSize(CRC_2_111_SPEC.font.size);

    const addLineNumber = (lineNum: number, y: number) => {
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(String(lineNum), 36, y);
      doc.setFontSize(CRC_2_111_SPEC.font.size);
      doc.setTextColor(0, 0, 0);
    };

    // CRC 2.111 Header: Pro Per name (left), Case name (center), Case number (right)
    doc.setFontSize(10);
    if (caseInfo) {
      doc.text(caseInfo.proPer || 'PRO PER', margin, 36);
      doc.text(caseInfo.name, pageWidth / 2, 36, { align: 'center' });
      doc.text(caseInfo.number, pageWidth - margin, 36, { align: 'right' });
    } else {
      doc.text('COMPASS OUTLAW - LEGAL DOCUMENT', margin, 36);
      doc.text(new Date().toLocaleDateString(), pageWidth - margin - 60, 36);
    }
    doc.setFontSize(CRC_2_111_SPEC.font.size);

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    const titleLines = doc.splitTextToSize(title.toUpperCase(), maxWidth);
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight;
    });
    yPosition += lineHeight;

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const cleanContent = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\n{3,}/g, '\n\n');

    const paragraphs = cleanContent.split('\n\n');
    let lineNumber = 1;

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === '') return;

      const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
      
      lines.forEach((line: string) => {
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

      yPosition += lineHeight / 2;
    });

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

    const finalFilename = filename || title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${finalFilename}_${new Date().toISOString().split('T')[0]}.pdf`);
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

  // Glass House handlers
  const handleGlassHouseDraft = async () => {
    setGlassHouseStatus(AnalysisStatus.THINKING);
    setGlassHouseResult(null);
    const result = await draftGlassHouseDocument(glassHouseSection, glassHouseContext);
    setGlassHouseResult(result);
    setAllDocuments(prev => ({ ...prev, [glassHouseSection]: result }));
    setGlassHouseStatus(AnalysisStatus.COMPLETE);
    // Auto-scroll to output panel
    setTimeout(() => {
      outputPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Batch generate all Glass House documents
  const handleGenerateAllDocuments = async () => {
    setBatchGenerating(true);
    setBatchProgress(0);
    const sections: GlassHouseSection[] = ['rfo', 'declaration', 'exhibit-a1', 'exhibit-list'];
    const results: Record<GlassHouseSection, LegalStrategyResult | null> = {
      'rfo': null,
      'declaration': null,
      'exhibit-a1': null,
      'exhibit-list': null
    };

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      setBatchProgress(i + 1);
      setGlassHouseSection(section);
      const result = await draftGlassHouseDocument(section, glassHouseContext);
      results[section] = result;
      setAllDocuments(prev => ({ ...prev, [section]: result }));
    }

    setGlassHouseResult(results['exhibit-list']); // Show last generated
    setBatchGenerating(false);
    setGlassHouseStatus(AnalysisStatus.COMPLETE);
    // Auto-scroll to output panel after batch generation
    setTimeout(() => {
      outputPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleExportGlassHouseSection = () => {
    if (glassHouseResult) {
      const sectionConfig = GLASS_HOUSE_SAYEGH.sections[glassHouseSection];
      exportToPDF(
        glassHouseResult.text,
        `${sectionConfig.title} - Sayegh v. Sayegh`,
        sectionConfig.filename
      );
    }
  };

  const handleExportAllGlassHouse = async () => {
    const sections: GlassHouseSection[] = ['rfo', 'declaration', 'exhibit-a1', 'exhibit-list'];
    const caseInfo = {
      name: 'Sayegh v. Sayegh',
      number: GLASS_HOUSE_SAYEGH.caseNumber,
      proPer: 'NUHA SAYEGH, In Pro Per'
    };

    let exportCount = 0;
    for (const section of sections) {
      const doc = allDocuments[section];
      if (doc) {
        const sectionConfig = GLASS_HOUSE_SAYEGH.sections[section];
        exportToPDF(doc.text, sectionConfig.title, sectionConfig.filename, caseInfo);
        exportCount++;
        // Small delay between exports to prevent browser issues
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (exportCount === 0) {
      alert('No documents generated yet. Click "Generate All Documents" first.');
    } else if (exportCount < 4) {
      alert(`Exported ${exportCount} of 4 documents. Generate remaining documents to complete the package.`);
    }
  };

  const getSectionLabel = (section: GlassHouseSection): string => {
    return GLASS_HOUSE_SAYEGH.sections[section].title;
  };

  return (
    <div className="w-full h-full flex flex-col bg-void-light/50 border border-slate-800 backdrop-blur-sm p-6 rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-3">
          <Gavel className="w-6 h-6 text-indigo-500" />
          AUTOLEX ARCHITECT V2
        </h2>
        <div className={`text-xs font-mono px-2 py-1 rounded border ${
          (activeTab === 'glass-house' ? glassHouseStatus : status) === AnalysisStatus.THINKING 
            ? 'border-indigo-500/50 text-indigo-500 animate-pulse' 
            : (activeTab === 'glass-house' ? glassHouseStatus : status) === AnalysisStatus.COMPLETE 
              ? 'border-emerald-500/50 text-emerald-500' 
              : 'border-slate-700 text-slate-500'
        }`}>
          {(activeTab === 'glass-house' ? glassHouseStatus : status) === AnalysisStatus.IDLE ? 'READY' : (activeTab === 'glass-house' ? glassHouseStatus : status)}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
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
        <button
          onClick={() => setActiveTab('glass-house')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
            activeTab === 'glass-house'
              ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-transparent text-slate-400 border border-red-500/30 hover:border-red-500'
          }`}
        >
          <Target className="w-3 h-3" /> Glass House (Sayegh)
        </button>
      </div>

      {/* Glass House Panel */}
      {activeTab === 'glass-house' && (
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-hidden">
          {/* Section Header */}
          <div className="bg-red-950/30 border border-red-800/50 rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> Glass House Package v1 – Sayegh
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {GLASS_HOUSE_SAYEGH.caseNumber} | {GLASS_HOUSE_SAYEGH.hearingDate}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Select a document section to draft. Each generates a court-ready document for the Jan 6, 2026 hearing.
            </p>
          </div>

          {/* Section Selector */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {(['rfo', 'declaration', 'exhibit-a1', 'exhibit-list'] as GlassHouseSection[]).map((section) => (
              <button
                key={section}
                onClick={() => {
                  setGlassHouseSection(section);
                  if (allDocuments[section]) {
                    setGlassHouseResult(allDocuments[section]);
                  }
                }}
                className={`p-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-left relative ${
                  glassHouseSection === section
                    ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                    : allDocuments[section]
                      ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500'
                      : 'bg-void text-slate-400 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {allDocuments[section] && (
                  <CheckCircle className="absolute top-1 right-1 w-3 h-3 text-emerald-500" />
                )}
                {getSectionLabel(section)}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 h-full">
            {/* Input Panel */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 h-full min-h-0">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Selected Document
                </label>
                <div className="p-3 bg-void border border-slate-800 rounded-sm">
                  <p className="text-sm font-bold text-slate-200">{getSectionLabel(glassHouseSection)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Section Guidance
                </label>
                <div className="p-3 bg-void border border-slate-800 rounded-sm max-h-32 overflow-y-auto">
                  <p className="text-xs text-slate-400 whitespace-pre-line">
                    {GLASS_HOUSE_SAYEGH.sections[glassHouseSection].promptContext.slice(0, 300)}...
                  </p>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={glassHouseContext}
                  onChange={(e) => setGlassHouseContext(e.target.value)}
                  placeholder="Add any specific facts, dates, or details to include in this document..."
                  className="w-full h-32 bg-void border border-slate-800 p-3 text-sm text-slate-300 focus:border-red-500 focus:outline-none rounded-sm font-mono resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGlassHouseDraft}
                  disabled={glassHouseStatus === AnalysisStatus.THINKING || batchGenerating}
                  className="flex-1 py-3 bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600/20 hover:text-red-400 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {glassHouseStatus === AnalysisStatus.THINKING && !batchGenerating ? (
                    <span className="animate-pulse">GENERATING...</span>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      GENERATE ONE
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerateAllDocuments}
                  disabled={batchGenerating || glassHouseStatus === AnalysisStatus.THINKING}
                  className="flex-1 py-3 bg-emerald-600/10 border border-emerald-600/30 text-emerald-500 hover:bg-emerald-600/20 hover:text-emerald-400 font-bold tracking-widest transition-all uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {batchGenerating ? (
                    <span className="animate-pulse">GENERATING {batchProgress}/4...</span>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      GENERATE ALL 4
                    </>
                  )}
                </button>
              </div>

              {/* Document Status Indicators */}
              <div className="grid grid-cols-4 gap-1 mt-2">
                {(['rfo', 'declaration', 'exhibit-a1', 'exhibit-list'] as GlassHouseSection[]).map((section) => (
                  <div 
                    key={section}
                    className={`h-1 rounded-full transition-all ${
                      allDocuments[section] ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title={allDocuments[section] ? `${getSectionLabel(section)} - Generated` : `${getSectionLabel(section)} - Pending`}
                  />
                ))}
              </div>
            </div>

            {/* Output Panel */}
            <div ref={outputPanelRef} className="relative min-h-[300px] h-full bg-white text-slate-900 border border-slate-200 rounded-sm p-6 flex flex-col shadow-inner font-serif overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
              
              {!glassHouseResult && glassHouseStatus !== AnalysisStatus.THINKING && !batchGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Target className="w-12 h-12 opacity-20" />
                  <p className="text-xs font-sans uppercase tracking-widest">Glass House Document Workspace</p>
                  <p className="text-xs text-slate-500">Select a section and click Generate</p>
                </div>
              )}

              {(glassHouseStatus === AnalysisStatus.THINKING || batchGenerating) && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin"></div>
                  {batchGenerating ? (
                    <>
                      <p className="text-xs font-mono text-red-500 animate-pulse">BATCH GENERATING DOCUMENTS ({batchProgress}/4)...</p>
                      <div className="flex gap-2">
                        {(['rfo', 'declaration', 'exhibit-a1', 'exhibit-list'] as GlassHouseSection[]).map((s, i) => (
                          <div 
                            key={s} 
                            className={`w-3 h-3 rounded-full ${i < batchProgress ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs font-mono text-red-500 animate-pulse">DRAFTING GLASS HOUSE DOCUMENT...</p>
                  )}
                </div>
              )}

              {glassHouseResult && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable document content */}
                  <div className="flex-1 overflow-y-auto z-10 pr-2">
                    <div className="prose prose-sm max-w-none text-slate-800">
                      <ReactMarkdown>{glassHouseResult.text}</ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Export buttons - FIXED: Always visible outside scroll area */}
                  <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-200 flex flex-wrap justify-end gap-2 print:hidden bg-white z-20">
                    <button 
                      onClick={handleExportGlassHouseSection}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 rounded-sm transition-colors"
                    >
                      <Download className="w-3 h-3" /> Export {getSectionLabel(glassHouseSection)}
                    </button>
                    <button 
                      onClick={handleExportAllGlassHouse}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 text-white hover:bg-slate-700 rounded-sm transition-colors"
                    >
                      <Download className="w-3 h-3" /> Export Court Package
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
