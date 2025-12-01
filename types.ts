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
  workflow?: 'glass-house-v1' | 'standard' | 'grid-lock-pc850';
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

// ============================================================================
// PRE-FLIGHT CHECK TYPES - Guardrail 1
// ============================================================================
export interface PreFlightCheck {
  step: number;
  name: string;
  blocker: boolean;
  failure_message: string;
  status?: 'PENDING' | 'PASS' | 'FAIL';
}

// ============================================================================
// VERIFICATION PROTOCOL TYPES - Guardrail 2
// ============================================================================
export interface VerificationTask {
  task: string;
  verification: string;
  blocker_if_false: string;
  status?: 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';
}

// ============================================================================
// GLASS HOUSE EXECUTION TYPES - Directive 3
// ============================================================================
export interface ExecutionStep {
  step: number;
  document: string;
  template: string;
  evidence_refs: string[];
  validation: string;
}

// ============================================================================
// CRC 2.111 SPECIFICATION TYPE - Directive 2
// ============================================================================
export interface CRCSpec {
  page_size: { width: number; height: number; unit: string };
  margins: { top: number; bottom: number; left: number; right: number };
  font: { family: string; size: number };
  line_spacing: number;
  page_numbers: { location: string; format: string };
  header: { left: string; center: string; right: string };
}
