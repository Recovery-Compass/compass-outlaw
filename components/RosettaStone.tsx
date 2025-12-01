import React, { useState, useCallback } from 'react';
import { Upload, FileText, Zap, CheckCircle, AlertCircle, Loader2, Database, FileJson, FileType, Copy, FolderOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnalysisStatus, ConversionResult } from '../types';
import { convertWithRosetta } from '../services/rosettaService';
import { ACTIVE_CASES } from '../constants';

const RosettaStone: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setStatus(AnalysisStatus.THINKING);
    setErrorMessage('');
    setFileName(file.name);

    try {
      const text = await file.text();
      const conversionResult = await convertWithRosetta(text, file.name, file.type);
      setResult(conversionResult);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (error) {
      console.error('Rosetta Stone conversion error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Conversion failed');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Markdown': return <FileText className="w-5 h-5" />;
      case 'JSON': return <FileJson className="w-5 h-5" />;
      case 'Parquet': return <Database className="w-5 h-5" />;
      default: return <FileType className="w-5 h-5" />;
    }
  };

  // Updated thresholds: 70 = Tier 1 Verified (50-10-20-20 Rule)
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const generateFortressPath = (caseId: string, filename: string) => {
    return `~/Fortress/02-CASES/${caseId}/evidence/rosetta-processed/${filename}`;
  };

  const copyLocalCommand = async () => {
    const command = `cp "${fileName}" ~/Fortress/rosetta-stone/input/`;
    await navigator.clipboard.writeText(command);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const copyFortressPath = async () => {
    if (!selectedCaseId || !fileName) return;
    const path = generateFortressPath(selectedCaseId, fileName);
    await navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-sm">
            <Database className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-100 uppercase">
              Rosetta Stone
            </h2>
            <p className="text-[10px] font-mono text-slate-500 tracking-widest">
              AI-POWERED FILE CONVERSION • PFV V14.2 COMPLIANT • 50-10-20-20 RULE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-[10px] font-mono font-bold border rounded-sm ${
            status === AnalysisStatus.IDLE ? 'text-slate-500 border-slate-700 bg-slate-800/50' :
            status === AnalysisStatus.THINKING ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10 animate-pulse' :
            status === AnalysisStatus.COMPLETE ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' :
            'text-red-400 border-red-500/50 bg-red-500/10'
          }`}>
            {status === AnalysisStatus.IDLE && 'AWAITING INPUT'}
            {status === AnalysisStatus.THINKING && 'CONVERTING...'}
            {status === AnalysisStatus.COMPLETE && 'CONVERSION COMPLETE'}
            {status === AnalysisStatus.ERROR && 'ERROR'}
          </span>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Panel: Input */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-void-light/40 border border-white/5 rounded-sm p-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              File Input
            </h3>
            
            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-sm p-8 transition-all ${
                dragActive 
                  ? 'border-cyan-500 bg-cyan-500/10' 
                  : 'border-slate-700 hover:border-slate-600 bg-black/20'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
                accept=".txt,.md,.json,.csv,.pdf,.docx,.html,.xml"
              />
              <div className="flex flex-col items-center text-center">
                <Upload className={`w-10 h-10 mb-3 ${dragActive ? 'text-cyan-500' : 'text-slate-600'}`} />
                <p className="text-sm text-slate-400 mb-1">
                  Drop file here or click to upload
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  TXT, MD, JSON, CSV, PDF, DOCX, HTML, XML
                </p>
              </div>
            </div>

            {/* Current File */}
            {fileName && (
              <div className="mt-4 p-3 bg-black/30 border border-white/5 rounded-sm">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-zen block mb-1">
                  Current File
                </label>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-mono text-slate-300 truncate">{fileName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Supported Formats Info */}
          <div className="bg-void-light/40 border border-white/5 rounded-sm p-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Output Formats
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileText className="w-3 h-3 text-emerald-500" />
                <span>Markdown</span>
                <span className="text-[9px] text-slate-600 ml-auto">PROSE</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileJson className="w-3 h-3 text-indigo-500" />
                <span>JSON + Schema</span>
                <span className="text-[9px] text-slate-600 ml-auto">HIERARCHICAL</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Database className="w-3 h-3 text-amber-500" />
                <span>Parquet</span>
                <span className="text-[9px] text-slate-600 ml-auto">TABULAR → LOCAL</span>
              </div>
            </div>
          </div>

          {/* Fortress Path Generator */}
          <div className="bg-void-light/40 border border-white/5 rounded-sm p-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FolderOpen className="w-3 h-3" />
              Generate Fortress Path
            </h3>
            <select 
              value={selectedCaseId} 
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">Select Case...</option>
              {ACTIVE_CASES.map(c => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
              ))}
            </select>
            
            {selectedCaseId && fileName && (
              <div className="mt-3 p-2 bg-black/40 rounded-sm">
                <code className="text-[10px] font-mono text-cyan-400 break-all block mb-2">
                  {generateFortressPath(selectedCaseId, fileName)}
                </code>
                <button 
                  onClick={copyFortressPath}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-sm text-[10px] text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copiedPath ? 'Copied!' : 'Copy Path'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Preview */}
        <div className="col-span-6 flex flex-col gap-4">
          {/* Parquet Heavy Lift Banner */}
          {result?.requiresLocalPipeline && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-amber-400">
                  ⚡️ HEAVY LIFT REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Parquet conversion requires the Local Pipeline. Copy this command to process in Fortress:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/50 px-3 py-2 text-xs font-mono text-cyan-400 rounded-sm overflow-x-auto">
                  cp "{fileName}" ~/Fortress/rosetta-stone/input/
                </code>
                <button 
                  onClick={copyLocalCommand}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-sm text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-xs">{copiedCommand ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 bg-void-light/40 border border-white/5 rounded-sm overflow-hidden flex flex-col">
            <div className="flex border-b border-white/5">
              <div className="flex-1 px-4 py-2 border-r border-white/5 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Original Content
                </span>
              </div>
              <div className="flex-1 px-4 py-2 bg-white/[0.02]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Converted Output
                </span>
              </div>
            </div>
            
            <div className="flex-1 flex min-h-0">
              {/* Original */}
              <div className="flex-1 border-r border-white/5 overflow-auto p-4">
                {status === AnalysisStatus.THINKING && (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </div>
                )}
                {status === AnalysisStatus.IDLE && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                    <FileText className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">Upload a file to begin</p>
                  </div>
                )}
                {result && (
                  <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-words">
                    {result.originalContent.slice(0, 5000)}
                    {result.originalContent.length > 5000 && '\n\n... [truncated]'}
                  </pre>
                )}
                {status === AnalysisStatus.ERROR && (
                  <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <AlertCircle className="w-12 h-12 mb-3" />
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}
              </div>
              
              {/* Converted */}
              <div className="flex-1 overflow-auto p-4 bg-black/20">
                {status === AnalysisStatus.THINKING && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-pulse" />
                      <p className="text-xs text-slate-500">Analyzing content structure...</p>
                    </div>
                  </div>
                )}
                {status === AnalysisStatus.IDLE && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                    <Zap className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">Converted output will appear here</p>
                  </div>
                )}
                {result && result.optimalFormat === 'Markdown' && (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{result.convertedContent}</ReactMarkdown>
                  </div>
                )}
                {result && (result.optimalFormat === 'JSON' || result.optimalFormat === 'Parquet') && (
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-words">
                    {result.convertedContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: PFV Dashboard */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Conversion Status */}
          <div className="bg-void-light/40 border border-white/5 rounded-sm p-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              PFV Dashboard
            </h3>
            
            {result ? (
              <div className="space-y-4">
                {/* Optimal Format */}
                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase tracking-zen block mb-2">
                    Optimal Format
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-black/30 border border-white/10 rounded-sm">
                    {getFormatIcon(result.optimalFormat)}
                    <span className="text-lg font-bold text-slate-100">{result.optimalFormat}</span>
                    {result.requiresLocalPipeline && (
                      <span className="ml-auto text-[9px] text-amber-400 font-mono">LOCAL ONLY</span>
                    )}
                  </div>
                </div>

                {/* ESV Score with 50-10-20-20 Rule */}
                <div>
                  <label className="text-[10px] text-slate-600 font-bold uppercase tracking-zen block mb-2">
                    Evidence Score (ESV) • 50-10-20-20 Rule
                  </label>
                  <div className="p-3 bg-black/30 border border-white/10 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-3xl font-black ${getScoreColor(result.evidenceScore)}`}>
                        {result.evidenceScore}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">/100</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreBarColor(result.evidenceScore)} transition-all duration-500`}
                        style={{ width: `${result.evidenceScore}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[9px] text-slate-600 font-mono">
                      Base:50 + Source:10 + Conversion:20 + Schema:20
                    </div>
                  </div>
                </div>

                {/* Tier Status - Updated threshold to 70 */}
                <div className={`flex items-center gap-2 p-3 rounded-sm ${
                  result.evidenceScore >= 70 
                    ? 'bg-emerald-500/10 border border-emerald-500/30' 
                    : 'bg-amber-500/10 border border-amber-500/30'
                }`}>
                  {result.evidenceScore >= 70 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm text-emerald-400 font-bold">TIER 1 VERIFIED</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <span className="text-sm text-amber-400 font-bold">REVIEW REQUIRED</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600">
                <Database className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Awaiting conversion</p>
              </div>
            )}
          </div>

          {/* PFV Metadata - Now YAML format */}
          <div className="flex-1 bg-void-light/40 border border-white/5 rounded-sm p-4 flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Agent Accountability Metadata (YAML)
            </h3>
            <div className="flex-1 min-h-0">
              {result ? (
                <textarea
                  readOnly
                  value={result.pfvMetadata}
                  className="w-full h-full bg-black/30 border border-white/5 rounded-sm p-3 text-[11px] font-mono text-slate-400 resize-none focus:outline-none focus:border-cyan-500/50"
                />
              ) : (
                <div className="h-full bg-black/30 border border-white/5 rounded-sm p-3 flex items-center justify-center">
                  <span className="text-[11px] text-slate-600 font-mono">
                    Metadata will appear after conversion
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* JSON Schema (if applicable) */}
          {result?.jsonSchema && (
            <div className="bg-void-light/40 border border-indigo-500/30 rounded-sm p-4">
              <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
                Inferred JSON Schema
              </h3>
              <pre className="text-[10px] font-mono text-slate-400 bg-black/30 p-3 rounded-sm overflow-auto max-h-40">
                {JSON.stringify(result.jsonSchema, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosettaStone;