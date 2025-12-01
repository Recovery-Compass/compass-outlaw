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
