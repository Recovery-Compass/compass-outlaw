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

// ============================================================================
// PDF VALIDATION TYPES - Stage 2.5 E-Filing Compliance
// ============================================================================
export interface PDFValidationResult {
  status: 'success' | 'error';
  font_check?: 'passed' | 'failed';
  pdfa_conversion?: 'passed' | 'failed';
  download_url?: string;
  error?: string;
  details?: string;
}

export enum ValidationStatus {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

// Jurisdiction keys for professional workaround mapping
export type JurisdictionKey = 
  | 'los_angeles_pasadena' 
  | 'monterey_probate' 
  | 'los_angeles_malpractice' 
  | 'banking_dispute' 
  | 'default';

export interface ProfessionalWorkaround {
  type: 'LDA' | 'Attorney' | 'Generic';
  name: string;
  firm?: string;
  phone?: string;
  email?: string;
  website?: string;
  service: string;
  rate: string;
}

// ============================================================================
// V15.1 NUCLEAR OPTION TYPES - Pipeline & Validation
// ============================================================================
export enum PipelineStage {
  ROSETTA = 'ROSETTA',      // Evidence preprocessing
  CLAUDE = 'CLAUDE',        // JSON assembly
  XELATEX = 'XELATEX',      // Grid-Lock rendering
  ALIGNING = 'ALIGNING',    // Iterative \topmargin adjustment
  VRT = 'VRT',              // Visual regression testing (SSIM)
  HUMAN = 'HUMAN'           // Final approval
}

export interface VrtResultV15_1 {
  passed: boolean;
  ssimScore: number;        // 0.0 - 1.0 (target: ≥0.99)
  driftOffset: number;      // Max pixel drift (target: ≤2px)
  iterations: number;       // \topmargin adjustment attempts
  goldenMasterUsed: string;
  driftCoordinates?: DriftCoordinate[];
}

export interface DriftCoordinate {
  page: number;
  line: number;
  drift_px: number;
  direction: 'UP' | 'DOWN';
}

export interface GridLockSpecV15_1 {
  topMarginPt: number;
  bottomMarginPt: number;
  leftMarginPt: number;
  rightMarginPt: number;
  baselineskipPt: number;
  lineskipPt: number;
  lineskiplimitPt: number;
  parskipPt: number;
  topskipPt: number;
  raggedbottom: boolean;
  fontEngine: 'xelatex' | 'pdflatex';
  fontFamily: string;
  fontSizePt: number;
  linesPerPage: number;
  pageHeightPt: number;
  pageWidthPt: number;
  writableHeightPt: number;
  backgroundRenderer: 'tikz' | 'eso-pic';
  targetSSIM: number;
  maxDriftPx: number;
  maxIterations: number;
}

export interface EvidencePacket {
  case_id: string;
  evidence_items: { id: string; title: string; file_path: string; esv_score: number }[];
  chain_of_custody: { agent: string; action: string; timestamp: string }[];
  pfv_status: 'VERIFIED' | 'PENDING' | 'FAILED';
}

export interface LegalDraft {
  document_type: 'RFO' | 'DECLARATION' | 'EXHIBIT' | 'MOTION';
  case_info: { number: string; name: string; venue: string };
  sections: { title: string; content: string }[];
  grid_lock_ready: boolean;
  vrt_result?: VrtResultV15_1;
}

export interface CrcChecklistItem {
  id: string;
  label: string;
  critical: boolean;
  status?: 'PASS' | 'FAIL' | 'PENDING';
}
