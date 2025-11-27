export enum CaseType {
  FAMILY = 'FAMILY',
  PROBATE = 'PROBATE',
  ELDER = 'ELDER'
}

export interface LegalCase {
  id: string;
  type: CaseType;
  title: string;
  caseNumber: string;
  venue: string;
  status: 'CRITICAL' | 'ACTIVE' | 'PENDING';
  nextHearing?: string;
  deadline?: string;
  description: string;
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