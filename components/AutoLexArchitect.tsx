import React, { useState, useEffect, useRef } from 'react';
import { draftLegalStrategy, LegalStrategyResult, loadComplaintTemplate, draftGlassHouseDocument, exportToJson, downloadJson } from '../services/geminiService';
import { AnalysisStatus, GlassHouseSection, ValidationStatus, JurisdictionKey, PDFValidationResult, ProfessionalWorkaround, PipelineStage, VrtResultV15_1, LegalDraft } from '../types';
import { Gavel, AlertTriangle, FileText, PenTool, Scale, CheckCircle, Copy, Download, Target, Upload, CheckCircle2, Phone, Mail, FileJson, ExternalLink, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GLASS_HOUSE_SAYEGH } from '../config/glassHouseConfig';
import { PROFESSIONAL_WORKAROUND, GRID_LOCK_SPEC_V15_1 } from '../constants';
import { validatePDF } from '../services/pdfValidationService';
import PipelineTracker from './PipelineTracker';
import CrcChecklist from './CrcChecklist';
import JsonPacketViewer from './JsonPacketViewer';
import { useToast } from '@/src/hooks/use-toast';

interface AutoLexArchitectProps {
  initialMode?: 'default' | 'glass-house';
}

const AutoLexArchitect: React.FC<AutoLexArchitectProps> = ({ initialMode = 'default' }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [draftResult, setDraftResult] = useState<LegalStrategyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'drafting' | 'complaint' | 'glass-house' | 'validator'>(
    initialMode === 'glass-house' ? 'glass-house' : 'drafting'
  );
  const [complaintText] = useState<string>(loadComplaintTemplate());
  const [copied, setCopied] = useState(false);

  // PDF Validation state (Stage 2.5)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(ValidationStatus.IDLE);
  const [validationResult, setValidationResult] = useState<PDFValidationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionKey>('los_angeles_pasadena');

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
  const { toast } = useToast();

  // V15.1 Nuclear Pipeline State
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.ROSETTA);
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([]);
  const [vrtResult, setVrtResult] = useState<VrtResultV15_1 | null>(null);
  const [currentLegalDraft, setCurrentLegalDraft] = useState<LegalDraft | null>(null);
  const [showJsonViewer, setShowJsonViewer] = useState(false);

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

  // V15.1: Export to JSON (replaces jsPDF - PDF generation is FORBIDDEN in browser)
  const handleExportToJson = (content: string, title: string, documentType: LegalDraft['document_type'] = 'DECLARATION') => {
    const legalDraft = exportToJson(content, title, documentType);
    setCurrentLegalDraft(legalDraft);
    downloadJson(legalDraft, title.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    toast({
      title: "JSON Exported",
      description: "Process with Claude CLI + XeLaTeX for court-ready PDF. jsPDF is FORBIDDEN."
    });
  };

  const handleExportDraft = () => {
    if (draftResult) {
      handleExportToJson(draftResult.text, `Legal Strategy - ${recipient}`, 'MOTION');
    }
  };

  const handleExportComplaint = () => {
    handleExportToJson(complaintText, 'State Bar Complaint - Kirk A Kolodji', 'MOTION');
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
      handleExportToJson(
        glassHouseResult.text,
        `${sectionConfig.title} - Sayegh v. Sayegh`,
        glassHouseSection === 'rfo' ? 'RFO' : glassHouseSection === 'exhibit-a1' || glassHouseSection === 'exhibit-list' ? 'EXHIBIT' : 'DECLARATION'
      );
    }
  };

  const handleExportAllGlassHouse = async () => {
    const sections: GlassHouseSection[] = ['rfo', 'declaration', 'exhibit-a1', 'exhibit-list'];

    let exportCount = 0;
    for (const section of sections) {
      const doc = allDocuments[section];
      if (doc) {
        const sectionConfig = GLASS_HOUSE_SAYEGH.sections[section];
        const docType: LegalDraft['document_type'] = section === 'rfo' ? 'RFO' : section.includes('exhibit') ? 'EXHIBIT' : 'DECLARATION';
        const legalDraft = exportToJson(doc.text, sectionConfig.title, docType);
        downloadJson(legalDraft, sectionConfig.filename);
        exportCount++;
        // Small delay between exports to prevent browser issues
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (exportCount === 0) {
      toast({
        title: "No documents to export",
        description: 'Click "Generate All Documents" first.',
        variant: "destructive"
      });
    } else {
      toast({
        title: `${exportCount} JSON files exported`,
        description: "Process with Claude CLI + XeLaTeX for court-ready PDFs."
      });
    }
  };

  const getSectionLabel = (section: GlassHouseSection): string => {
    return GLASS_HOUSE_SAYEGH.sections[section].title;
  };

  // PDF Validation handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setValidationStatus(ValidationStatus.IDLE);
      setValidationResult(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    
    setValidationStatus(ValidationStatus.VALIDATING);
    setValidationResult(null);
    
    const result = await validatePDF(selectedFile);
    setValidationResult(result);
    setValidationStatus(result.status === 'success' ? ValidationStatus.SUCCESS : ValidationStatus.FAILED);
  };

  const handleResetValidator = () => {
    setValidationStatus(ValidationStatus.IDLE);
    setValidationResult(null);
    setSelectedFile(null);
  };

  const getWorkaround = (): ProfessionalWorkaround => {
    return PROFESSIONAL_WORKAROUND[selectedJurisdiction] || PROFESSIONAL_WORKAROUND['default'];
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
        <button
          onClick={() => setActiveTab('validator')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-2 ${
            activeTab === 'validator'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-transparent text-slate-400 border border-emerald-500/30 hover:border-emerald-500'
          }`}
        >
          <Upload className="w-3 h-3" /> E-Filing Validator
        </button>
      </div>

      {/* Glass House Panel */}
      {activeTab === 'glass-house' && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
          {/* V15.1 Pipeline Tracker */}
          <PipelineTracker 
            currentStage={glassHouseStatus === AnalysisStatus.THINKING ? PipelineStage.CLAUDE : PipelineStage.ROSETTA}
            vrtResult={vrtResult}
            completedStages={glassHouseResult ? [PipelineStage.ROSETTA, PipelineStage.CLAUDE] : []}
          />

          {/* Section Header */}
          <div className="bg-red-950/30 border border-red-800/50 rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> Glass House Package v1 – Sayegh (V15.1 Nuclear)
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {GLASS_HOUSE_SAYEGH.caseNumber} | {GLASS_HOUSE_SAYEGH.hearingDate}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              JSON-First Pipeline: Documents exported as JSON for Claude CLI + XeLaTeX processing. jsPDF is FORBIDDEN.
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
                  
                  {/* Export buttons - V15.1: JSON export (jsPDF FORBIDDEN) */}
                  <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-200 flex flex-wrap justify-end gap-2 print:hidden bg-white z-20">
                    <button 
                      onClick={handleExportGlassHouseSection}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 rounded-sm transition-colors"
                    >
                      <FileJson className="w-3 h-3" /> Export JSON: {getSectionLabel(glassHouseSection)}
                    </button>
                    <button 
                      onClick={handleExportAllGlassHouse}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 text-white hover:bg-slate-700 rounded-sm transition-colors"
                    >
                      <FileJson className="w-3 h-3" /> Export All JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* E-Filing Validator Panel (Stage 2.5) */}
      {activeTab === 'validator' && (
        <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-950/30 border border-emerald-600/50 rounded-sm p-4">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <Upload className="w-5 h-5" /> Stage 2.5: E-Filing Validator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload your generated PDF to validate for court e-filing compliance (font embedding, PDF/A conversion)
            </p>
          </div>

          {/* Jurisdiction Selector */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-sm p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Select Jurisdiction (for professional workaround)
            </label>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value as JurisdictionKey)}
              className="w-full mt-2 bg-slate-900 border border-slate-600 rounded-sm p-2 text-slate-200 text-sm"
            >
              <option value="los_angeles_pasadena">LA County - Pasadena (Family Law)</option>
              <option value="monterey_probate">Monterey County (Probate)</option>
              <option value="los_angeles_malpractice">LA County (Malpractice)</option>
              <option value="banking_dispute">Banking Disputes</option>
            </select>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* IDLE State - File Upload */}
            {validationStatus === ValidationStatus.IDLE && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 rounded-sm bg-slate-900/50">
                <Upload className="w-16 h-16 text-slate-500 mb-6" />
                <p className="text-slate-400 mb-4 text-center">
                  {selectedFile 
                    ? <span className="text-emerald-400 font-bold">{selectedFile.name}</span>
                    : 'Upload your generated PDF for court compliance validation'
                  }
                </p>
                <div className="flex gap-4 items-center">
                  <label className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                    />
                    {selectedFile ? 'Change File' : 'Select PDF'}
                  </label>
                  {selectedFile && (
                    <button
                      onClick={handleValidate}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Validate for E-Filing
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VALIDATING State - Spinner */}
            {validationStatus === ValidationStatus.VALIDATING && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-12">
                <div className="w-20 h-20 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-emerald-400 text-lg font-bold animate-pulse">
                    Validating your document for court compliance...
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Checking font embedding... Converting to PDF/A format...
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS State - Download Button */}
            {validationStatus === ValidationStatus.SUCCESS && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-12 text-center">
                <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                <h3 className="text-2xl font-bold text-emerald-400">
                  ✅ Your document is technically valid and ready for e-filing!
                </h3>
                <div className="bg-emerald-950/30 border border-emerald-600/50 rounded-sm p-4 space-y-2 text-sm">
                  <p className="text-slate-300">Font Check: <span className="text-emerald-400 font-bold">{validationResult?.font_check || 'N/A'}</span></p>
                  <p className="text-slate-300">PDF/A Conversion: <span className="text-emerald-400 font-bold">{validationResult?.pdfa_conversion || 'N/A'}</span></p>
                </div>
                {validationResult?.download_url && (
                  <a 
                    href={validationResult.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-sm transition-colors text-lg"
                  >
                    <Download className="w-5 h-5" /> Download E-Filing Ready PDF
                  </a>
                )}
                <button onClick={handleResetValidator} className="text-xs text-slate-500 hover:text-slate-300">
                  Validate another document
                </button>
              </div>
            )}

            {/* FAILED State - Error + Professional Workaround */}
            {validationStatus === ValidationStatus.FAILED && (
              <div className="flex-1 flex flex-col space-y-6 p-6 overflow-y-auto">
                {/* Error Section */}
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-bold text-red-400 mt-4">❌ Validation Failed</h3>
                </div>
                
                <div className="bg-red-950/30 border border-red-800/50 rounded-sm p-4">
                  <p className="text-red-300 font-bold">{validationResult?.error}</p>
                  <p className="text-xs text-slate-500 mt-2">{validationResult?.details}</p>
                </div>
                
                {/* Professional Workaround - IMMEDIATE DISPLAY */}
                <div className="bg-amber-950/30 border border-amber-600/50 rounded-sm p-6">
                  <h4 className="text-amber-400 font-bold text-lg mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5" /> Professional Workaround Available
                  </h4>
                  <div className="space-y-3 text-sm">
                    <p className="text-slate-300">
                      <span className="text-slate-500">Provider:</span> <strong className="text-white">{getWorkaround().name}</strong>
                      {getWorkaround().firm && <span className="text-slate-400"> ({getWorkaround().firm})</span>}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Type:</span> <span className="text-amber-400">{getWorkaround().type}</span>
                    </p>
                    {getWorkaround().phone && (
                      <p className="text-slate-300">
                        <span className="text-slate-500">Phone:</span> <a href={`tel:${getWorkaround().phone}`} className="text-amber-400 hover:underline">{getWorkaround().phone}</a>
                      </p>
                    )}
                    {getWorkaround().email && (
                      <p className="text-slate-300">
                        <span className="text-slate-500">Email:</span> <a href={`mailto:${getWorkaround().email}`} className="text-amber-400 hover:underline">{getWorkaround().email}</a>
                      </p>
                    )}
                    {getWorkaround().website && (
                      <p className="text-slate-300">
                        <span className="text-slate-500">Website:</span> <a href={getWorkaround().website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">{getWorkaround().website}</a>
                      </p>
                    )}
                    <p className="text-slate-300">
                      <span className="text-slate-500">Service:</span> {getWorkaround().service}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Rate:</span> <span className="text-emerald-400 font-bold">{getWorkaround().rate}</span>
                    </p>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    {getWorkaround().phone && (
                      <a 
                        href={`tel:${getWorkaround().phone}`} 
                        className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider rounded-sm text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" /> Call Now
                      </a>
                    )}
                    {getWorkaround().email && (
                      <a 
                        href={`mailto:${getWorkaround().email}?subject=E-Filing Assistance Request`} 
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-wider rounded-sm text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" /> Send Email
                      </a>
                    )}
                  </div>
                </div>
                
                <button onClick={handleResetValidator} className="text-xs text-slate-500 hover:text-slate-300 text-center">
                  Try again with a different document
                </button>
              </div>
            )}
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
