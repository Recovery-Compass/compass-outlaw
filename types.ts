export enum CaseType {
  FAMILY = 'FAMILY',
  PROBATE = 'PROBATE',
  ELDER = 'ELDER',
  MALPRACTICE = 'MALPRACTICE',
  STATE_BAR = 'STATE_BAR'
}

export interface LegalCase {
  id: string;
  type: CaseType;
  title: string;
  caseNumber: string;
  venue: string;
  status: 'CRITICAL' | 'ACTIVE' | 'PENDING' | 'FILING' | 'COMPLETE';
  nextHearing?: string;
  deadline?: string;
  description: string;
  workflow?: 'glass-house-v1' | 'standard';
}

export interface IntelligenceReport {
  fidelityStatus: string;
  trustStatus: string;
  refundAnalysis: string;
  survivalPlan: string;
  rawText: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

// Glass House Package Types
export type GlassHouseSection = 'rfo' | 'declaration' | 'exhibit-a1' | 'exhibit-list';

export interface GlassHouseLever {
  id: string;
  name: string;
  description: string;
  evidenceRef: string;
  status: 'READY' | 'PENDING' | 'BLOCKED';
}

export interface GlassHouseSectionConfig {
  title: string;
  promptContext: string;
  filename: string;
}

export interface GlassHouseConfig {
  caseId: string;
  caseNumber: string;
  hearingDate: string;
  objective: string;
  levers: GlassHouseLever[];
  sections: Record<GlassHouseSection, GlassHouseSectionConfig>;
}

// Rosetta Stone Conversion Types
export type SourceQuality = 'digital' | 'highres_scan' | 'lowres';
export type ContentClassification = 'PROSE' | 'TABULAR' | 'HIERARCHICAL';

export interface CompassManifest {
  sourceFileName: string;
  compassCaseID: string | null;
  classification: ContentClassification;
  esvScore: number;     // Uses 50-10-20-20 rule
  pfvMetadata: string;  // Full YAML block
  processedFileURL: string;
}

export interface ConversionResult {
  originalContent: string;
  convertedContent: string;
  optimalFormat: 'Markdown' | 'Parquet' | 'JSON';
  evidenceScore: number;
  pfvMetadata: string;  // Now YAML format
  jsonSchema?: Record<string, any>;
  manifest: CompassManifest;
  requiresLocalPipeline: boolean;
}
