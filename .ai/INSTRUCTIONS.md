# AI INSTRUCTIONS - COMPASS OUTLAW

<!-- 
This file provides directives for AI assistants working on this project.
Compatible with: Claude, GPT, Gemini, Cursor, Copilot, Lovable
-->

## PROJECT IDENTITY

```yaml
name: compass-outlaw
type: legal-tech
purpose: Pro Per litigation command center
mandate: "Justice is no longer for sale"
classification: Legal tech / Case management / AI-powered drafting
```

---

## HARD REQUIREMENTS

### MUST DO ✅

```yaml
citations:
  - Every factual claim MUST cite a source file
  - Use format: "Source: [filename]" or inline citation

evidence_handling:
  - Convert recordings → Witness Declarations
  - Comply with PC 632 (California recording laws)
  - Format court filings per CRC 2.111

verification:
  - Red Team conclusions before presenting
  - Cross-check dates, names, case numbers
  - Verify entity relationships against ENTITY_REGISTRY
```

### MUST NOT ❌

```yaml
fabrication:
  - NEVER fabricate facts
  - NEVER invent dates, names, or case numbers
  - NEVER guess entity relationships

template_errors:
  - NO template artifacts ("Dear :", unfilled fields)
  - NO placeholder text in final output
  - NO [BRACKETS] indicating missing info

entity_confusion:
  - Kirk Kolodji (E2) ≠ Sean Kolodji (E3)
  - Kirk HAS bar license (#327031)
  - Sean has NO bar license (UPL target)
```

---

## ENTITY REGISTRY

```yaml
E1:
  name: Nuha Sayegh
  role: Complainant/Client
  case: 25PDFL01441
  
E2:
  name: Kirk A. Kolodji
  role: Former Attorney (ADVERSARY)
  identifier: Bar #327031
  violations: [Rule 1.4, 1.5, 4.2, 5.3, B&P 6125]
  
E3:
  name: Sean Kolodji
  role: Unlicensed Brother
  identifier: NO BAR NUMBER
  violation: UPL (B&P 6125)
  WARNING: "E3 ≠ E2 - Different person, no license"
  
E4:
  name: Eric B. Jones
  role: Witness/Declarant
  
E5:
  name: H Bui Law Firm
  role: Current Counsel
  
E6:
  name: Judy Brakebill Jones
  role: Decedent/Trust Settlor
```

---

## CASE REGISTRY

```yaml
C1:
  title: Sayegh v. Sayegh
  number: 25PDFL01441
  venue: LA Superior Court - Pasadena
  status: CRITICAL
  deadline: "Jan 6, 2026 hearing"
  
C2:
  title: Judy Jones Trust
  number: TBD-MONTEREY
  venue: Monterey Superior Court
  status: ACTIVE
  
C3:
  title: Elder Abuse Investigation
  number: PENDING
  venue: Civil Division
  status: PENDING
  target: JP Morgan Chase
  
C4:
  title: State Bar v. Kolodji
  number: BAR-327031
  venue: State Bar of California
  status: FILING
  note: "Ready to file"
```

---

## STRATEGIC DOCTRINE

When generating legal content, apply these principles:

### SCL (Seismic Crystal Lava)
```yaml
seismic: "Identify fault lines (adversary weaknesses)"
crystal: "Solidify evidence into admissible form"
lava: "Exploit vulnerabilities with maximum leverage"
```

### Trim Tab
```yaml
concept: "Small input creates large output"
example: "One unanswered email invalidates $16k fee claim"
```

### 5-Bird Strategy
```yaml
requirement: "Every action achieves 5+ victories"
categories:
  - Offense (damage adversary position)
  - Recovery (reclaim assets/standing)
  - Logistics (position for next move)
  - Tactical (immediate advantage)
  - Deterrence (prevent future attacks)
```

---

## TECH STACK

```yaml
frontend:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS

ai_service:
  provider: Google
  model: gemini-2.5-flash
  sdk: "@google/genai"
  features:
    - Google Search grounding
  temperature:
    reports: 0.2
    drafting: 0.4

deployment:
  platform: Google Cloud Run
  port: 8080  # REQUIRED
  health_endpoints:
    - /health (nginx)
    - /health.json (static)
```

---

## DESIGN SYSTEM

```yaml
theme: zen-industrial

DO:
  - High data density
  - Stark contrast (light text on dark)
  - Glow effects for status indicators
  - UPPERCASE headers with tight tracking
  - Monospace for case numbers/codes

DO_NOT:
  - Rounded corners > sm
  - Pastel colors
  - Generic SaaS aesthetics
  - Inter/Poppins fonts
  - Purple gradients on white

colors:
  background: slate-950 (#020617)
  status:
    CRITICAL: red-500
    ACTIVE: emerald-500
    PENDING: amber-500
    FILING: indigo-500
```

---

## FILE PURPOSES

```yaml
constants.ts:
  purpose: "System prompt and active cases data"
  exports: [SYSTEM_INSTRUCTION, ACTIVE_CASES]
  
types.ts:
  purpose: "TypeScript interfaces"
  exports: [CaseType, LegalCase, AnalysisStatus]
  
geminiService.ts:
  purpose: "Gemini API integration"
  exports: [generateIntelligenceReport, draftLegalStrategy, loadComplaintTemplate]
  
Dashboard.tsx:
  purpose: "Main command center UI"
  
AutoLexArchitect.tsx:
  purpose: "Legal drafting engine + State Bar complaint"
  
IntelligencePanel.tsx:
  purpose: "AI-powered financial analysis"
  
nginx.conf:
  purpose: "Cloud Run serving + health endpoint"
  WARNING: "Do not remove /health location block"
```

---

## CODING CONVENTIONS

```yaml
typescript:
  - Strict mode enabled
  - Prefer interfaces over types
  - Explicit return types on functions

react:
  - Functional components with hooks
  - Destructure props in signature
  - Handle image errors with fallback

styling:
  - Tailwind utility classes only
  - No CSS files
  - Use design system tokens

state:
  - Use AnalysisStatus enum for loading states
  - IDLE → THINKING → COMPLETE | ERROR

errors:
  - Always provide fallback UI
  - Log errors to console
  - Show user-friendly messages
```

---

## QUICK COMMANDS

```bash
# Development
npm run dev

# Production build
npm run build

# Deploy (auto via push to main)
git push origin main

# Manual deploy
docker build -t gcr.io/PROJECT/compass-outlaw .
docker push gcr.io/PROJECT/compass-outlaw
gcloud run deploy compass-outlaw --image gcr.io/PROJECT/compass-outlaw
```

---

## VERIFICATION CHECKLIST

Before generating legal content:

- [ ] All facts cite source files
- [ ] Dates verified against case registry
- [ ] Names match entity registry exactly
- [ ] Case numbers correct
- [ ] No template artifacts
- [ ] E2 (Kirk) and E3 (Sean) not confused
- [ ] CRC 2.111 formatting if court filing
- [ ] PC 632 compliance if using recordings
