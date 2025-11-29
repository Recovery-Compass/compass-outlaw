# COMPASS OUTLAW - AI CONTEXT FILE
<!-- This file is optimized for AI tool parsing -->

## PROJECT METADATA

```yaml
name: compass-outlaw
type: legal-tech
purpose: pro-per-litigation-command-center
mandate: "Justice is no longer for sale"
version: 1.0.0
last_updated: 2025-11-29
```

---

## ACTIVE ENTITIES

| ID | Name | Role | Identifier | Relationship |
|----|------|------|------------|--------------|
| E1 | Nuha Sayegh | Complainant | - | Client, victim of malpractice |
| E2 | Kirk A. Kolodji | Former Attorney | Bar #327031 | ADVERSARY - violated Rules 1.4, 1.5, 4.2, 5.3 |
| E3 | Sean Kolodji | Unlicensed Practice | NO LICENSE | E2's brother, UPL (B&P 6125) |
| E4 | Eric B. Jones | Witness | - | Declarant for State Bar complaint |
| E5 | H Bui Law Firm | Current Counsel | - | Replacing E2 for E1 |
| E6 | Judy Brakebill Jones | Decedent | - | Trust settlor (Probate case) |

<!-- CRITICAL: E2 ≠ E3. Kirk has bar license. Sean does NOT. -->

---

## ACTIVE CASES

| ID | Case | Number | Venue | Status | Next Action | Deadline |
|----|------|--------|-------|--------|-------------|----------|
| C1 | Sayegh v. Sayegh | 25PDFL01441 | LA Superior - Pasadena | CRITICAL | Hearing | Jan 6, 2026 |
| C2 | Judy Jones Trust | TBD-MONTEREY | Monterey Superior | ACTIVE | Filing | TBD |
| C3 | Elder Abuse | PENDING | Civil Division | PENDING | Investigation | TBD |
| C4 | State Bar v. Kolodji | BAR-327031 | State Bar of CA | FILING | Submit complaint | Ready |

---

## FILE MANIFEST

| Path | Type | Purpose | Exports |
|------|------|---------|---------|
| `App.tsx` | Component | Root app, routing | `<App />` |
| `constants.ts` | Config | System prompt, case data | `SYSTEM_INSTRUCTION`, `ACTIVE_CASES` |
| `types.ts` | Types | TypeScript interfaces | `CaseType`, `LegalCase`, `AnalysisStatus` |
| `services/geminiService.ts` | Service | AI integration | `generateIntelligenceReport`, `draftLegalStrategy` |
| `components/Dashboard.tsx` | Component | Main command center | `<Dashboard />` |
| `components/AutoLexArchitect.tsx` | Component | Legal drafting | `<AutoLexArchitect />` |
| `components/IntelligencePanel.tsx` | Component | AI analysis UI | `<IntelligencePanel />` |
| `components/LandingPage.tsx` | Component | Entry screen | `<LandingPage />` |
| `nginx.conf` | Config | Cloud Run server | Health endpoint |
| `Dockerfile` | Config | Container build | - |
| `cloudbuild.yaml` | Config | CI/CD pipeline | - |

---

## TECH STACK

```yaml
frontend:
  framework: react@19.2.0
  language: typescript
  bundler: vite
  styling: tailwindcss

ai:
  provider: google
  model: gemini-2.5-flash
  sdk: "@google/genai@^1.30.0"
  features: [google_search_grounding]

rendering:
  markdown: react-markdown@10.1.0
  icons: lucide-react@0.555.0

deployment:
  platform: google-cloud-run
  port: 8080
  container: nginx
  health: ["/health", "/health.json"]
  ci_cd: cloudbuild.yaml
```

---

## DESIGN SYSTEM

```yaml
theme: zen-industrial

colors:
  background:
    void: "slate-950"      # #020617 - primary bg
    void-light: "slate-900" # card backgrounds
  
  status:
    CRITICAL: "red-500"     # Family Law cases
    ACTIVE: "emerald-500"   # Probate cases
    PENDING: "amber-500"    # Elder Abuse cases
    FILING: "indigo-500"    # State Bar filings

typography:
  headers: "system-sans, uppercase, tracking-tight to tracking-widest"
  body: "system-sans"
  code: "font-mono (JetBrains Mono)"
  legal: "font-serif"

rules:
  DO:
    - high data density
    - stark contrast (light on dark)
    - glow effects for status
  DO_NOT:
    - rounded corners > sm
    - pastel colors
    - generic SaaS aesthetics
```

---

## API CONTRACTS

### generateIntelligenceReport
```typescript
function generateIntelligenceReport(
  fidelityContext: string,
  trustContext: string,
  buiContext: string
): Promise<{
  text: string;
  sources: string[];
}>
// Temperature: 0.2
// Uses: Google Search grounding
```

### draftLegalStrategy
```typescript
function draftLegalStrategy(
  recipient: string,
  keyFacts: string,
  desiredOutcome: string,
  tone: 'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'
): Promise<{
  text: string;
  sources: string[];
}>
// Temperature: 0.4
```

### loadComplaintTemplate
```typescript
function loadComplaintTemplate(): string
// Returns: Pre-generated Kolodji State Bar complaint
```

---

## COMPLIANCE REQUIREMENTS

### PFV v14.2 Standard

```yaml
REQUIRED:
  - cite_source_for_every_claim: true
  - recordings_to_declarations: "PC 632 compliance"
  - court_formatting: "CRC 2.111"
  - red_team_conclusions: true

PROHIBITED:
  - fabricate_facts: HARD_FAIL
  - wrong_dates_names_numbers: HARD_FAIL
  - template_artifacts: HARD_FAIL  # "Dear :", unfilled fields
  - entity_confusion: HARD_FAIL    # E2 ≠ E3
```

---

## STRATEGIC DOCTRINE

```yaml
framework: leverage-first-asymmetric-warfare

principles:
  SCL:  # Seismic Crystal Lava
    seismic: "Detect fault lines"
    crystal: "Solidify evidence"
    lava: "Exploit vulnerabilities"
  
  TRIM_TAB:
    concept: "Small input → Large output"
    example: "One email invalidates $16k claim"
  
  FIVE_BIRD:
    requirement: "Every action = 5+ victories"
    targets: [Offense, Recovery, Logistics, Tactical, Deterrence]
```

---

## ENVIRONMENT

```yaml
required:
  GEMINI_API_KEY: "Google AI Studio API key"

optional:
  NODE_ENV: "production (for deploys)"

ports:
  development: 8080
  production: 8080  # Cloud Run requirement
```

---

## LOGO HANDLING

```yaml
primary: "/public/compass-outlaw-logo-bg-removed.png"
styling: "invert class for dark backgrounds"
fallback: "SVG cowboy silhouette on image error"
implementation: "onError={() => setImgError(true)}"
```
