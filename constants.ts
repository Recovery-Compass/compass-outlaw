import { CaseType, LegalCase } from './types';

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
  },
  {
    id: '4',
    type: CaseType.MALPRACTICE,
    title: 'State Bar v. Kolodji',
    caseNumber: 'BAR-327031',
    venue: 'State Bar of California',
    status: 'FILING',
    description: 'Target: Kirk A. Kolodji (#327031). Violations: Rule 1.4, 1.5, 4.2, 5.3. UPL via Sean Kolodji. Leverage Value: $50K-$300K.'
  }
];