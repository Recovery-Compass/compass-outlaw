import { CaseType, LegalCase, PreFlightCheck, VerificationTask, ProfessionalWorkaround, JurisdictionKey } from './types';

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

// ============================================================================
// PDF VALIDATION SERVICE - Stage 2.5 E-Filing Compliance
// ============================================================================
export const PDF_VALIDATION_CONFIG = {
  endpoint: 'https://us-central1-compass-outlaw-38910.cloudfunctions.net/validate-pdf',
  timeout: 60000, // 60 seconds for validation
};

// ============================================================================
// PROFESSIONAL WORKAROUND - JURISDICTION-SPECIFIC CONTACTS
// ============================================================================
export const PROFESSIONAL_WORKAROUND: Record<JurisdictionKey, ProfessionalWorkaround> = {
  // LA County (Pasadena) - Family Law
  "los_angeles_pasadena": {
    type: "LDA",
    name: "Vazquez Legal Document Solutions",
    phone: "(442) 249-3879",
    email: "Vazquezldasolutions@yahoo.com",
    service: "Family Law E-Filing Service",
    rate: "$400 per filing"
  },
  
  // Monterey County - Probate
  "monterey_probate": {
    type: "Attorney",
    name: "Ravi Patel, Esq.",
    firm: "Ravi Law",
    phone: "(510) 443-0443",
    email: "ravi@ravilaw.com",
    service: "Heggstad Petitions & Probate E-Filing",
    rate: "$0 upfront, contingent fee on success"
  },

  // LA County - Legal Malpractice
  "los_angeles_malpractice": {
    type: "Attorney",
    name: "Klein & Wilson LLP",
    phone: "(949) 239-0907",
    website: "https://www.kleinwilson.com/",
    service: "Legal Malpractice Litigation",
    rate: "$0 upfront, 33-40% contingent fee"
  },

  // Texas / CA - Banking Disputes
  "banking_dispute": {
    type: "Attorney",
    name: "Lawpoint or Kazerouni Law Group",
    website: "https://www.lawpoint.com/ or https://www.kazlg.com/",
    service: "Consumer Protection & Banking Disputes",
    rate: "$0 upfront, contingent fee"
  },

  // Default / Fallback
  "default": {
    type: "Generic",
    name: "Compass Outlaw Support",
    email: "support@recovery-compass.org",
    service: "Manual Review & Assistance",
    rate: "Case-by-case"
  }
};

// Map case IDs to jurisdiction keys for dynamic workaround display
export const CASE_JURISDICTION_MAP: Record<string, JurisdictionKey> = {
  '1': 'los_angeles_pasadena',    // Sayegh v. Sayegh (Family Law)
  '2': 'monterey_probate',         // Judy Jones Trust (Probate)
  '3': 'banking_dispute',          // Elder Abuse / JP Morgan
  '4': 'los_angeles_malpractice',  // State Bar v. Kolodji
  '5': 'los_angeles_malpractice',  // H Bui Law Firm
  '6': 'los_angeles_pasadena'      // Joyce Sayegh (Family)
};

// ============================================================================
// GRID-LOCK SPEC V15.1 - NUCLEAR OPTION (Absolute Point Coordinates)
// ============================================================================
export const GRID_LOCK_SPEC_V15_1 = {
  // === ABSOLUTE POINT COORDINATES (NO FLOATING-POINT ERRORS) ===
  topMarginPt: 72,          // Exactly 1 inch (72 pts) - NOT "1in"
  bottomMarginPt: 48,       // Exactly 0.667 inch
  leftMarginPt: 72,         // Exactly 1 inch
  rightMarginPt: 36,        // Exactly 0.5 inch
  
  // === THE NUCLEAR GRID LOCK ===
  baselineskipPt: 24,       // THE SECRET SAUCE (24pt, NOT 28.8pt!)
  lineskipPt: 0,            // Zero tolerance
  lineskiplimitPt: -999,    // ← NUCLEAR: Force alignment (prevent ALL glue)
  parskipPt: 0,             // Zero paragraph spacing
  topskipPt: 0,             // Start at absolute top pixel
  raggedbottom: true,       // Prevent vertical justification stretch
  
  // === FONT ENFORCEMENT (XeLaTeX Required) ===
  fontEngine: 'xelatex' as const,
  fontFamily: 'Times New Roman',
  fontSizePt: 12,
  
  // === GRID GEOMETRY ===
  linesPerPage: 28,
  pageHeightPt: 792,        // 11 inches * 72pt
  pageWidthPt: 612,         // 8.5 inches * 72pt
  writableHeightPt: 672,    // 28 lines * 24pt
  
  // === BACKGROUND RENDERER ===
  backgroundRenderer: 'tikz' as const,
  
  // === VALIDATION THRESHOLDS (V15.1 Nuclear) ===
  targetSSIM: 0.99,         // 99% structural similarity required
  maxDriftPx: 2,            // Maximum allowed pixel drift
  maxIterations: 10         // Max \topmargin adjustment attempts
};

// ============================================================================
// GRID-LOCK SPEC V15.2 - FORENSIC FOUNDRY (PostScript Big Points)
// ============================================================================
export const GRID_LOCK_SPEC_V15_2 = {
  // === POSTSCRIPT BIG POINTS (1bp = 1/72 inch EXACTLY) ===
  topMarginBp: 72,            // 1 inch
  bottomMarginBp: 48,         // 0.667 inch
  leftMarginBp: 97.2,         // 1.35 inches (CRITICAL: clears 1.25in rail + 7.2bp gutter)
  rightMarginBp: 36,          // 0.5 inch
  
  // === THE V15.2 NUCLEAR LOCK ===
  baselineskipBp: 24,         // 24bp (NOT 24pt) - eliminates 2.5pt drift
  lineskipBp: 0,
  lineskiplimitBp: '-\\maxdimen',  // LaTeX infinity (stricter than -999pt)
  parskipBp: 0,
  topskipBp: 0,
  raggedbottom: true,
  
  // === LAST MILE FIX #3: TIKZ BASELINE CALIBRATION ===
  tikzYshiftBp: -10,          // Align line numbers to text baseline
  
  // === FONT ENFORCEMENT (LAST MILE FIX #2: XeLaTeX LOCKED) ===
  fontEngine: 'xelatex' as const,  // LOCKED - pdflatex will crash fontspec
  fontFamily: 'Times New Roman',
  fontPath: '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf',
  fontSizePt: 12,
  
  // === GRID GEOMETRY ===
  linesPerPage: 28,
  pageHeightPt: 792,
  pageWidthPt: 612,
  writableHeightBp: 672,      // 28 lines * 24bp
  backgroundRenderer: 'tikz' as const,
  
  // === 100/100 VALIDATION THRESHOLDS ===
  targetSSIM: 0.995,          // 99.5% (up from 99%)
  maxDriftPx: 0,              // ZERO tolerance (down from 2px)
  maxIterations: 5,
  
  // === VISUAL DUPLICATION DOCTRINE ===
  verbatimMode: true          // LOCKED - no copy-editing
};

// ============================================================================
// VISUAL DUPLICATION DOCTRINE - Forensic Evidence Mandate
// ============================================================================
export const VISUAL_DUPLICATION_DOCTRINE = {
  mandate: `FORENSIC FOUNDRY DIRECTIVE: Replicate the Master's VISUAL APPEARANCE exactly. 
A typo in the Master is a REQUIREMENT, not a bug. 
If the Master says "Exhibit D" when sequence suggests "Exhibit B", output "Exhibit D".
The court accepted the Master; changing ANY label creates record discrepancy.
This is a LEGAL EVIDENCE TOOL, not a copy-editing tool.`,
  
  exhibitOverrides: [
    { masterExhibitLabel: 'EXHIBIT D', forceLabel: true, pageNumber: 5 }
  ],
  
  forbidCopyEditing: true,
  
  autocorrectBlacklist: [
    'exhibit labels',
    'case numbers',
    'dates',
    'names',
    'dollar amounts'
  ]
};

// MCP Server Inventory (for CLI agents)
export const MCP_SERVER_INVENTORY = {
  pdf_vision: {
    name: "mcp-pdf-vision",
    purpose: "OpenCV/SSIM line alignment verification",
    script: "verify_alignment_hitl.py"
  },
  pandoc: {
    name: "mcp-pandoc", 
    purpose: "Markdown → XeLaTeX → PDF conversion",
    engine: "xelatex"
  },
  pdf_diff: {
    name: "mcp-pdf-diff",
    purpose: "Golden Master visual comparison (diff-pdf)",
    threshold: 0.995
  },
  vera_pdf: {
    name: "veraPDF",
    purpose: "PDF/A-2B compliance validation"
  }
};

// CRC 2.111 Compliance Checklist (12 items - V15.1 Nuclear)
export const CRC_2111_CHECKLIST_V15_1 = [
  { id: 'geometry', label: 'Geometry uses absolute points (72pt, not 1in)', critical: true },
  { id: 'line_height', label: 'Line height = 24pt (NOT 28.8pt)', critical: true },
  { id: 'lineskiplimit', label: '\\lineskiplimit=-999pt (NUCLEAR)', critical: true },
  { id: 'parskip', label: '\\parskip=0pt (Zero paragraph spacing)', critical: true },
  { id: 'font_engine', label: 'Font engine = XeLaTeX (not pdflatex)', critical: true },
  { id: 'font_family', label: 'Font = Times New Roman TTF (not mathptmx)', critical: true },
  { id: 'background', label: 'Background grid = TikZ (not eso-pic)', critical: true },
  { id: 'lines_28', label: 'Lines numbered 1-28 per page', critical: true },
  { id: 'margins', label: 'Margins = 72pt/48pt/72pt/36pt (T/B/L/R)', critical: true },
  { id: 'ssim', label: 'SSIM score ≥ 0.99 against Golden Master', critical: true },
  { id: 'drift', label: 'Max pixel drift ≤ 2px', critical: true },
  { id: 'pdfa', label: 'PDF/A-2B compliant', critical: true }
];

// ============================================================================
// CRC 2.111 CHECKLIST V15.2 - FORENSIC FOUNDRY (14 items)
// ============================================================================
export const CRC_2111_CHECKLIST_V15_2 = [
  // PostScript Units
  { id: 'geometry_bp', label: 'Geometry uses PostScript bp (NOT TeX pt)', critical: true },
  { id: 'line_height_bp', label: 'Line height = 24bp (NOT 24pt)', critical: true },
  { id: 'lineskiplimit', label: '\\lineskiplimit=-\\maxdimen', critical: true },
  { id: 'left_margin', label: 'Left margin = 1.35in (clears 1.25in rail)', critical: true },
  
  // Execution Engine
  { id: 'xelatex', label: 'XeLaTeX engine LOCKED (pdflatex forbidden)', critical: true },
  { id: 'font_times', label: 'True Times New Roman TTF loaded', critical: true },
  { id: 'font_path', label: 'fontPath resolves to valid TTF', critical: true },
  
  // Container
  { id: 'container_font', label: 'Container has msttcorefonts installed', critical: true },
  
  // TikZ Calibration
  { id: 'tikz_yshift', label: 'TikZ yshift=-10bp calibration', critical: true },
  
  // Visual Duplication Doctrine
  { id: 'verbatim', label: 'Verbatim Mode ON (no copy-editing)', critical: true },
  
  // Validation
  { id: 'ssim', label: 'SSIM ≥ 0.995 (auto-checked)', critical: true },
  { id: 'drift', label: 'Pixel drift = 0px (auto-checked)', critical: true },
  { id: 'page_numbers', label: 'Page numbers bottom center', critical: false },
  { id: 'seven_files', label: '7-file packaging (LASC compliance)', critical: true }
];

// Forbidden Terms (Anti-fabrication)
export const FORBIDDEN_TERMS = [
  '[CLIENT_NAME]', '[DATE]', '[AMOUNT]', 'Dear [', 
  'appears to be', 'likely', 'probably', 'seems to',
  'INSERT', 'PLACEHOLDER', 'TBD', 'FIXME', '{{', '}}'
];

// V15.1 Nuclear LaTeX Preamble (DEPRECATED - Use V15.2)
export const V15_1_NUCLEAR_PREAMBLE = `% === V15.1 NUCLEAR OPTION PREAMBLE (DEPRECATED) ===
\\documentclass[12pt,letterpaper]{article}
\\usepackage[paperwidth=612pt, paperheight=792pt, top=72pt, bottom=48pt, left=72pt, right=36pt, nohead, nofoot, nomarginpar]{geometry}
\\usepackage{fontspec}
\\setmainfont{Times New Roman}
\\setlength{\\baselineskip}{24pt}
\\setlength{\\lineskip}{0pt}
\\setlength{\\lineskiplimit}{-999pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\topskip}{0pt}
\\raggedbottom
% TikZ Background Grid handled by rendering engine`;

// ============================================================================
// V15.2 FORENSIC FOUNDRY PREAMBLE (XeLaTeX REQUIRED)
// ============================================================================
export const V15_2_NUCLEAR_PREAMBLE = `% === V15.2 FORENSIC FOUNDRY PREAMBLE (XeLaTeX REQUIRED) ===
\\documentclass[12pt,letterpaper]{article}

% === POSTSCRIPT UNITS GEOMETRY (CRITICAL) ===
\\usepackage{geometry}
\\geometry{
  paper=letterpaper,
  top=1.0in,
  bottom=0.667in,
  left=1.35in,    % CRITICAL: 1.35in clears 1.25in rail + 7.2bp gutter
  right=0.5in,
  footskip=0.25in
}

% === GRID-LOCK (PostScript bp, NOT TeX pt) ===
\\setlength{\\baselineskip}{24bp}
\\setlength{\\lineskip}{0bp}
\\setlength{\\lineskiplimit}{-\\maxdimen}
\\setlength{\\parskip}{0bp}
\\setlength{\\topskip}{0bp}
\\raggedbottom

% === TRUE TIMES NEW ROMAN (fontspec - XeLaTeX Only) ===
\\usepackage{fontspec}
\\setmainfont{Times New Roman}[
  Path = /usr/share/fonts/truetype/msttcorefonts/,
  Extension = .ttf,
  UprightFont = *,
  BoldFont = *_Bold,
  ItalicFont = *_Italic,
  Ligatures = TeX
]

% === TIKZ PLEADING FRAME (with -10bp yshift calibration) ===
\\usepackage{tikz}
\\usepackage{tikzpagenodes}

\\AddToHook{shipout/background}{
  \\begin{tikzpicture}[remember picture, overlay]
    % Double vertical rails at 1.25 inches
    \\draw[line width=0.5pt] ([xshift=1.20in]current page.north west) -- ([xshift=1.20in]current page.south west);
    \\draw[line width=0.5pt] ([xshift=1.25in]current page.north west) -- ([xshift=1.25in]current page.south west);
    
    % Line numbers 1-28 (with -10bp baseline calibration)
    \\foreach \\i in {1,...,28} {
      \\node[anchor=east, font=\\footnotesize] at ([xshift=1.15in, yshift={-1.0in - (\\i-1)*24bp - 10bp}]current page.north west) {\\i};
    }
  \\end{tikzpicture}
}`;
