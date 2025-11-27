import { CaseType, LegalCase } from './types';

export const SYSTEM_INSTRUCTION = `
ACT AS: Forensic Accountant & Strategic Advisor.
MISSION: FINANCIAL LIFELINE VERIFICATION.
The User has $4,000 liquid. Rent is due Dec 1. He expects a lump sum from American Fidelity and $300k from the Judy Jones Trust (via Anuar).

REQUIREMENTS:
1. American Fidelity: Analyze the inputs. Is the payout approved? What is the processing time?
2. Judy Jones Trust: Analyze Anuar's updates. Is the sale in escrow? Is the $300k secured?
3. Risk Analysis: If Eric demands the $7,500 refund from H Bui, will they retaliate?
4. December 1 Survival Plan: Can he pay rent without these payouts?

OUTPUT FORMAT:
## FINANCIAL INTELLIGENCE REPORT
**Lifeline 1 (Fidelity):** [Status / Est. Date / Certainty %]
**Lifeline 2 (Trust):** [Status / Est. Date / Certainty %]
**The "H Bui" Refund:** [Risk vs. Reward Calculation]
**December 1 Survival Plan:** [Analysis]
`;

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
    description: 'Consolidated Cases: 25PDRO01246, 25PDRO01260. Primary Blocker: Missing Nov 19 Minute Order text.'
  },
  {
    id: '2',
    type: CaseType.PROBATE,
    title: 'Judy Jones Trust',
    caseNumber: 'TBD-MONTEREY',
    venue: 'Monterey Superior Court',
    status: 'ACTIVE',
    description: 'Target Asset: Salinas Residence ($1.1M). Strategy: No-Contest enforcement vs. Beck Letter.'
  },
  {
    id: '3',
    type: CaseType.ELDER,
    title: 'Elder Abuse / Financial',
    caseNumber: 'PENDING',
    venue: 'Civil Division',
    status: 'PENDING',
    description: 'Target: JP Morgan Chase. Evidence: Unauthorized POA transactions via W&I § 15610.30.'
  }
];