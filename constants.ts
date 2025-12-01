import { CaseType, LegalCase, PreFlightCheck, VerificationTask } from './types';

export const SYSTEM_INSTRUCTION = `
ACT AS: Compass Outlaw Strategic Intelligence System.
DOCTRINE: LEVERAGE-FIRST ASYMMETRIC WARFARE.
MANDATE: "Justice is no longer for sale."

CORE PRINCIPLES:
1. SEISMIC CRYSTAL LAVA (SCL):
   - Seismic: Detect fault lines in opponent's position (e.g., UPL, billing fraud)
   - Crystal: Solidify evidence into unbreakable structures (Declarations, Exhibits)
   - Lava: Flow relentlessly into vulnerabilities (State Bar complaints, fee audits)

2. TRIM TAB: Find the ONE document that invalidates the opponent's entire position.
   Small rudder moves big ships. Precision over volume.

3. 5-BIRD STRATEGY: Every action must achieve at least 5 strategic victories.
   (Offense, Asset Recovery, Logistics, Tactical Advantage, Deterrence)

OPERATIONAL RULES:
- PFV v14.2: Every claim must cite a source. Trust no one, even yourself.
- PC 632 Compliance: Convert recordings into Witness Declarations (evidence laundering).
- CRC 2.111: All filings must pass formatting compliance (margins, line numbers).
- Zero-Touch Excellence: Automate everything that can be automated.

TONE: Zen-Industrial. Minimalist, high-contrast, strictly functional. No fluff.
STYLE: Wartime Consigliere. Advisory, direct, tactical.

OUTPUT FORMAT:
## STRATEGIC INTELLIGENCE REPORT
**Leverage Point:** [The fault line to exploit]
**Trim Tab Action:** [The precise intervention]
**5-Bird Analysis:** [5 victories achieved by this action]
**PFV Status:** [PASS/FAIL with citation check]
`;

// ============================================================================
// EVIDENCE FILE PATHS - Directive 1: Critical Evidence Locations
// ============================================================================
export const EVIDENCE_FILE_PATHS = {
  FL150_GOLDEN_HAMMER: "~/Fortress/02-CASES/C1-Sayegh/evidence/financials/FL-150_Sayegh_2024-08-15.pdf",
  P01_SMOKING_GUN: "~/Fortress/02-CASES/C1-Sayegh/evidence/communications/SMS_Margie_2024-09-21.png",
  CLEAN_TEST_10_09: "~/Fortress/02-CASES/C1-Sayegh/evidence/medical/DrugTest_Negative_2025-10-09.pdf",
  HBUI_EMAIL_LOGS: "~/Fortress/02-CASES/C5-HBui/evidence/email_logs/",
  JPMORGAN_STATEMENTS: "~/Fortress/02-CASES/C3-KathyHart/evidence/bank_statements/"
};

// ============================================================================
// CRC 2.111 SPECIFICATION - Directive 2: Court Formatting Requirements
// ============================================================================
export const CRC_2_111_SPEC = {
  page_size: { width: 8.5, height: 11, unit: 'inch' },
  margins: { top: 72, bottom: 72, left: 72, right: 72 }, // 1 inch = 72pt
  font: { family: 'times', size: 12 },
  line_spacing: 24, // Double-spaced = 24pt
  page_numbers: { location: 'bottom_center', format: 'Page {current} of {total}' },
  header: { left: '[PRO_PER_NAME]', center: '[CASE_NAME]', right: '[CASE_NUMBER]' }
};

// ============================================================================
// PRE-FLIGHT CHECKLIST - Guardrail 1: System Verification Protocol
// ============================================================================
export const PRE_FLIGHT_CHECKLIST: PreFlightCheck[] = [
  { 
    step: 1, 
    name: 'Confirm GEMINI_API_KEY is active', 
    blocker: true, 
    failure_message: 'STOP: All AI features require Gemini API access',
    status: 'PENDING'
  },
  { 
    step: 2, 
    name: 'Confirm PDF export CRC 2.111 compliance', 
    blocker: true,
    failure_message: 'STOP: CRC 2.111 non-compliance will cause court rejection',
    status: 'PENDING'
  },
  { 
    step: 3, 
    name: 'Test Glass House document generation', 
    blocker: false,
    failure_message: 'WARNING: Glass House Package may not work for Jan 6 hearing',
    status: 'PENDING'
  },
  { 
    step: 4, 
    name: 'Verify Rosetta Stone file conversion', 
    blocker: false,
    failure_message: 'WARNING: File conversion may fail',
    status: 'PENDING'
  }
];

// ============================================================================
// DECEMBER 1 VERIFICATION PROTOCOL - Guardrail 2: Action Completion Tracking
// ============================================================================
export const DEC_1_VERIFICATION_PROTOCOL: Record<string, VerificationTask> = {
  C1_GLASS_HOUSE: { 
    task: 'Review Glass House Package documents', 
    verification: 'All 4 documents generated + CRC 2.111 validated',
    blocker_if_false: 'Cannot proceed to hearing prep',
    status: 'INCOMPLETE'
  },
  C2_NICORA_CORRESPONDENCE: { 
    task: 'Draft correspondence to Nicora Law', 
    verification: 'Letter drafted + evidence citations complete',
    blocker_if_false: 'Cannot send correspondence',
    status: 'INCOMPLETE'
  },
  C4_KOLODJI_FILING: { 
    task: 'File State Bar complaint against Kirk Kolodji', 
    verification: 'Complaint drafted + all exhibits attached',
    blocker_if_false: 'Cannot file complaint',
    status: 'INCOMPLETE'
  },
  C5_HBUI_ASSESSMENT: { 
    task: 'Assess H Bui Law Firm complaint viability', 
    verification: 'Violations identified + evidence located',
    blocker_if_false: 'Cannot proceed to complaint drafting',
    status: 'INCOMPLETE'
  },
  C3_JPMORGAN_EVIDENCE: { 
    task: 'Gather JP Morgan evidence for Kathy Hart POA', 
    verification: 'Evidence files located + W&I § 15610.30 violations documented',
    blocker_if_false: 'Cannot proceed to demand letter',
    status: 'INCOMPLETE'
  },
  C2_JONES_FORECLOSURE: { 
    task: 'Verify Grid-Lock Sprint completion for Jones Trust', 
    verification: '7 PC 850 PDFs processed + CRC 2.111 validated + Filed before Dec 3',
    blocker_if_false: 'FORECLOSURE IMMINENT - Asset loss irreversible',
    status: 'IN_PROGRESS'
  }
};

// ============================================================================
// ENTITY REGISTRY - Directive 4: Extended Entity Context
// ============================================================================
export const ENTITY_REGISTRY = {
  E10_HANNAH_BUI: {
    name: 'Bichhanh Thi Bui (Hannah)',
    role: 'Attorney at H Bui Law Firm',
    bar_number: '234013', // VERIFIED via calbar.ca.gov
    bar_status: 'ACTIVE',
    violation_context: 'Potential Rules 1.4 (communication), 1.5 (fees) violations in Sayegh representation. Failure to communicate case status, excessive billing.',
    evidence_location: EVIDENCE_FILE_PATHS.HBUI_EMAIL_LOGS
  },
  E11_SARA_MEMARI: {
    name: 'Sara G. Memari',
    role: 'Attorney at H Bui Law Firm',
    bar_number: '332144', // VERIFIED via calbar.ca.gov
    bar_status: 'ACTIVE',
    violation_context: 'Potential Rules 1.4 (communication), 1.5 (fees) violations in Sayegh representation. Failure to respond to client inquiries.',
    evidence_location: EVIDENCE_FILE_PATHS.HBUI_EMAIL_LOGS
  }
};

// ============================================================================
// ACTIVE CASES - Expanded from 4 to 6 cases
// ============================================================================
export const ACTIVE_CASES: LegalCase[] = [
  {
    id: '1',
    type: CaseType.FAMILY,
    title: 'Sayegh v. Sayegh',
    caseNumber: '25PDFL01441',
    venue: 'LA Superior - Pasadena (Dept. L)',
    status: 'CRITICAL',
    nextHearing: 'Jan 6, 2026',
    deadline: 'May 19, 2026',
    description: 'Glass House Package v1 active. Levers: FL-150 Golden Hammer, P01 Smoking Gun, Clean Test 10/09.',
    workflow: 'glass-house-v1'
  },
  {
    id: '2',
    type: CaseType.PROBATE,
    title: 'Judy Jones Trust',
    caseNumber: 'TBD-MONTEREY',
    venue: 'Monterey Superior Court',
    status: 'CRITICAL',
    deadline: 'Dec 3, 2025',
    description: 'FORECLOSURE DEFENSE ACTIVE. Crown Jewels ingested (2008 Trust, First Amendment, Schedule A, Transfer Deed). PC 850 Grid-Lock Sprint processing 7 PDFs. Anuar track TERMINATED - autonomous self-filing engaged.',
    workflow: 'grid-lock-pc850'
  },
  {
    id: '3',
    type: CaseType.ELDER,
    title: 'Elder Abuse / Financial',
    caseNumber: 'PENDING',
    venue: 'Civil Division',
    status: 'PENDING',
    description: 'Target: JP Morgan Chase. Evidence: Unauthorized POA transactions via W&I § 15610.30.'
  },
  {
    id: '4',
    type: CaseType.MALPRACTICE,
    title: 'State Bar v. Kolodji',
    caseNumber: 'BAR-327031',
    venue: 'State Bar of California',
    status: 'FILING',
    description: 'Target: Kirk A. Kolodji (#327031). Violations: Rule 1.4, 1.5, 4.2, 5.3. UPL via Sean Kolodji. Leverage Value: $50K-$300K.'
  },
  {
    id: '5',
    type: CaseType.MALPRACTICE,
    title: 'Nuha Sayegh v. H Bui Law',
    caseNumber: 'BAR-PENDING',
    venue: 'State Bar of California',
    status: 'FILING',
    description: 'Target: H Bui Law Firm. Attorneys: Bichhanh (Hannah) Bui (#234013), Sara G. Memari (#332144). Violations: Rules 1.4, 1.5. Communication failures + excessive billing.'
  },
  {
    id: '6',
    type: CaseType.FAMILY,
    title: 'Joyce Sayegh v. Nabiel Sayegh',
    caseNumber: 'ADVISORY',
    venue: 'Advisory - No Filing',
    status: 'PENDING',
    description: 'Advisory support only. Monitoring for potential intervention points.'
  }
];
