import { GlassHouseConfig, ExecutionStep } from '../types';
import { EVIDENCE_FILE_PATHS } from '../constants';

export const GLASS_HOUSE_SAYEGH: GlassHouseConfig = {
  caseId: '1',
  caseNumber: '25PDFL01441',
  hearingDate: 'January 6, 2026',
  objective: 'Financial relief + Substance narrative inversion',
  
  levers: [
    {
      id: 'golden-hammer',
      name: 'Golden Hammer – FL-150 Line 11c',
      description: 'Fahed declared $22,083/mo income, paid $0 support',
      evidenceRef: EVIDENCE_FILE_PATHS.FL150_GOLDEN_HAMMER,
      status: 'READY'
    },
    {
      id: 'p01-smoking-gun',
      name: 'P01 Smoking Gun – Margie SMS',
      description: '"Fahed goes up every year" – third-party income confirmation',
      evidenceRef: EVIDENCE_FILE_PATHS.P01_SMOKING_GUN,
      status: 'READY'
    },
    {
      id: 'clean-test',
      name: 'Nuha Clean Test – 10/09/2025',
      description: 'Negative drug test inverting custody narrative',
      evidenceRef: EVIDENCE_FILE_PATHS.CLEAN_TEST_10_09,
      status: 'READY'
    }
  ],
  
  sections: {
    rfo: {
      title: 'Urgent Support Argument (RFO)',
      filename: 'sayegh_rfo',
      promptContext: `Draft a Request for Order (RFO) for immediate spousal/child support.

KEY ARGUMENTS:
1. FL-150 Line 11c shows Fahed declared $22,083/mo gross income
2. Despite this income, Fahed has paid ZERO support to Nuha
3. This creates an immediate financial emergency for the children
4. The court should order immediate temporary support pending full hearing

RELIEF REQUESTED:
- Immediate temporary support order
- Retroactive support from date of separation
- Attorney fees contribution (if applicable)

FORMAT: California RFO format per CRC 2.111`
    },
    declaration: {
      title: 'Nuha Declaration – Substance Inversion',
      filename: 'sayegh_declaration',
      promptContext: `Draft a Declaration in support of RFO that inverts the substance abuse narrative.

KEY FACTS TO INCLUDE:
1. Nuha took a drug test on 10/09/2025 - results were NEGATIVE (clean)
2. This directly contradicts any claims that substance abuse affects her parenting ability
3. Nuha has been the primary caregiver throughout the marriage
4. The children's wellbeing is her highest priority

NARRATIVE STRATEGY (Substance Inversion):
- Lead with the clean test result as Exhibit A
- Pivot from defense to offense: if anyone has judgment issues, examine Fahed's financial deception
- Frame: Nuha is transparent (took test voluntarily), Fahed is deceptive (false FL-150)

FORMAT: Declaration under penalty of perjury, California format`
    },
    'exhibit-a1': {
      title: 'Financial Impeachment Exhibit A-1',
      filename: 'sayegh_exhibit_a1',
      promptContext: `Create a Financial Impeachment Exhibit comparing:

COLUMN 1 - DECLARED (FL-150):
- Fahed's sworn income: $22,083/month
- Source: FL-150 Line 11c filed November 2025

COLUMN 2 - ACTUAL SUPPORT PAID:
- Amount paid to Nuha: $0
- Period: [Date of separation] to present

COLUMN 3 - THIRD-PARTY CONFIRMATION (P01):
- Margie SMS: "Fahed goes up every year" 
- Implies income has been INCREASING, not decreasing
- Corroborates that Fahed has means but chooses not to pay

VISUAL FORMAT:
Create a clear comparison table that the court can easily read.
Include headers, source citations for each figure.
This exhibit should make the financial discrepancy undeniable.`
    },
    'exhibit-list': {
      title: 'Exhibit List & Evidence Index',
      filename: 'sayegh_exhibit_list',
      promptContext: `Generate a court-formatted Exhibit List for the Sayegh Glass House Package.

EXHIBITS TO INDEX:
- Exhibit A: Nuha Drug Test Results (10/09/2025) - NEGATIVE
- Exhibit A-1: Financial Impeachment Chart (FL-150 vs. Actual)
- Exhibit B: FL-150 Income & Expense Declaration (Fahed)
- Exhibit C: P01 SMS Evidence - Margie "goes up every year"
- Exhibit D: Bank statements showing $0 support received
- Exhibit E: [Placeholder for additional evidence]

FORMAT:
Standard California court exhibit list with:
- Exhibit letter/number
- Description
- Number of pages
- Date of document (if applicable)
- Authentication status

Include a brief legend explaining the exhibit labeling system.`
    }
  }
};

// ============================================================================
// GLASS HOUSE EXECUTION SEQUENCE - Directive 3: Document Generation Order
// ============================================================================
export const GLASS_HOUSE_EXECUTION_SEQUENCE: ExecutionStep[] = [
  { 
    step: 1, 
    document: 'sayegh_rfo', 
    template: 'RFO_TEMPLATE_FL300', 
    evidence_refs: ['FL150_GOLDEN_HAMMER'], 
    validation: 'MUST cite exact dollar amounts from FL-150 ($22,083/mo declared, $0 paid)' 
  },
  { 
    step: 2, 
    document: 'sayegh_declaration', 
    template: 'DECLARATION_TEMPLATE_MC030', 
    evidence_refs: ['CLEAN_TEST_10_09', 'P01_SMOKING_GUN'], 
    validation: 'MUST invert substance abuse narrative with test results' 
  },
  { 
    step: 3, 
    document: 'sayegh_exhibit_a1', 
    template: 'FINANCIAL_CHART', 
    evidence_refs: ['FL150_GOLDEN_HAMMER'], 
    validation: 'MUST show $22,083 declared vs $0 paid with source citations' 
  },
  { 
    step: 4, 
    document: 'sayegh_exhibit_list', 
    template: 'EXHIBIT_INDEX', 
    evidence_refs: ['ALL'], 
    validation: 'MUST list all exhibits with page numbers and authentication status' 
  }
];

// Helper to get section titles for UI
export const getGlassHouseSectionTitle = (section: keyof typeof GLASS_HOUSE_SAYEGH.sections): string => {
  return GLASS_HOUSE_SAYEGH.sections[section].title;
};

// Calculate days until hearing
export const getDaysUntilHearing = (): number => {
  const hearing = new Date('2026-01-06');
  const today = new Date();
  const diffTime = hearing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Calculate days until foreclosure deadline
export const getDaysUntilForeclosure = (): number => {
  const foreclosureDate = new Date('2025-12-03');
  const today = new Date();
  const diffTime = foreclosureDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get execution step by document name
export const getExecutionStep = (document: string): ExecutionStep | undefined => {
  return GLASS_HOUSE_EXECUTION_SEQUENCE.find(step => step.document === document);
};
