# COMPASS OUTLAW KNOWLEDGE BASE
**Version:** 4.0 (AI-Optimized)  
**Last Updated:** November 29, 2025

---

<!-- CONTEXT: AI_PARSING_ENABLED -->

## ENTITY REGISTRY

| ID | Entity | Role | Identifier | Case Link |
|----|--------|------|------------|-----------|
| E1 | Nuha Sayegh | Complainant/Client | - | 25PDFL01441 |
| E2 | Kirk A. Kolodji | Respondent/Former Attorney | Bar #327031 | BAR-327031 |
| E3 | Sean Kolodji | Unlicensed Brother (UPL) | NO BAR NUMBER | BAR-327031 |
| E4 | Eric B. Jones | Witness/Declarant | - | BAR-327031 |
| E5 | H Bui Law Firm | Current Counsel | - | 25PDFL01441 |
| E6 | Judy Brakebill Jones | Decedent/Trust Settlor | - | TBD-MONTEREY |

<!-- WARNING: E2 and E3 are DIFFERENT PEOPLE. E3 has NO bar license. -->

---

## CASE REGISTRY

| ID | Title | Number | Venue | Status | Critical Date |
|----|-------|--------|-------|--------|---------------|
| C1 | Sayegh v. Sayegh | 25PDFL01441 | LA Superior - Pasadena | CRITICAL | Jan 6, 2026 hearing |
| C2 | Judy Jones Trust | TBD-MONTEREY | Monterey Superior | ACTIVE | - |
| C3 | Elder Abuse Investigation | PENDING | Civil Division | PENDING | JP Morgan target |
| C4 | State Bar v. Kolodji | BAR-327031 | State Bar of CA | FILING | Ready to file |

---

## STRATEGIC DOCTRINE

### Leverage-First Asymmetric Warfare

```yaml
PRINCIPLES:
  SCL: # Seismic Crystal Lava
    seismic: "Detect fault lines (vulnerabilities)"
    crystal: "Solidify evidence into admissible form"
    lava: "Flow into adversary's weakness"
    example: "UPL = fault; Declaration = crystal; State Bar Complaint = lava"
  
  TRIM_TAB:
    definition: "Small rudder moves big ship"
    example: "One unanswered Oct 26 email invalidates $16k fee claim"
  
  FIVE_BIRD:
    definition: "Every action achieves 5+ strategic victories"
    targets: [Offense, Recovery, Logistics, Tactical, Deterrence]
```

---

## PFV v14.2 COMPLIANCE

### REQUIRED ✅
- Every factual claim MUST cite source file
- Convert recordings → Witness Declarations (PC 632)
- CRC 2.111 formatting for court filings
- Red Team every conclusion before presentation

### PROHIBITED ❌
- Fabricating facts, dates, names, case numbers
- Unverified entity relationships
- Template artifacts ("Dear :", unfilled fields)
- Mixing up E2 (Kirk/attorney) with E3 (Sean/unlicensed)

---

## FILE MANIFEST

| File | Purpose | Key Exports |
|------|---------|-------------|
| `constants.ts` | System prompt + case data | `SYSTEM_INSTRUCTION`, `ACTIVE_CASES` |
| `types.ts` | TypeScript interfaces | `CaseType`, `LegalCase`, `AnalysisStatus` |
| `geminiService.ts` | Gemini API wrapper | `generateIntelligenceReport()`, `draftLegalStrategy()` |
| `Dashboard.tsx` | Main command center | Tab navigation, case cards |
| `AutoLexArchitect.tsx` | Legal drafting engine | Drafting + State Bar complaint |
| `IntelligencePanel.tsx` | AI analysis interface | Financial intelligence reports |
| `LandingPage.tsx` | Entry splash screen | Logo + enter button |
| `nginx.conf` | Cloud Run serving | Health endpoint at `/health` |

---

## API CONTRACTS

### geminiService.ts

```typescript
// Intelligence Report
generateIntelligenceReport(
  fidelityContext: string,
  trustContext: string,
  buiContext: string
): Promise<{ text: string; sources: string[] }>

// Legal Drafting
draftLegalStrategy(
  recipient: string,
  keyFacts: string,
  desiredOutcome: string,
  tone: 'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'
): Promise<{ text: string; sources: string[] }>

// Complaint Template
loadComplaintTemplate(): string  // Pre-generated Kolodji complaint
```

### Configuration
```yaml
model: gemini-2.5-flash
temperature_reports: 0.2
temperature_drafting: 0.4
tools: [google_search_grounding]
```

---

## DEPLOYMENT CONFIG

```yaml
platform: google-cloud-run
port: 8080  # REQUIRED - do not change
container: nginx serving static build
health_endpoints:
  - /health      # nginx dynamic (preferred)
  - /health.json # static fallback
env_required:
  - GEMINI_API_KEY
auto_deploy: push to main → cloudbuild.yaml
```

---

## DESIGN TOKENS

```yaml
theme: zen-industrial
backgrounds:
  void: slate-950 (#020617)
  void-light: slate-900
status_colors:
  CRITICAL: red-500
  ACTIVE: emerald-500
  PENDING: amber-500
  FILING: indigo-500
typography:
  headers: system-sans, UPPERCASE, tracking-tight
  code: font-mono (JetBrains Mono)
  legal: font-serif (AutoLex output)
aesthetic_rules:
  allowed: [high_density, stark_contrast, glow_effects]
  prohibited: [rounded_corners_>sm, pastel_colors, generic_saas]
```

---

## EVIDENCE CHAIN (Operation Silent Partner)

```yaml
target: Kirk A. Kolodji (E2)
violations: [Rule 1.4, 1.5, 4.2, 5.3, B&P 6125]
leverage_value: $50,000 - $300,000+
status: GREEN_LIGHT_READY

exhibits:
  - id: EXHIBIT_I
    file: EXHIBIT_I_DECLARATION_OF_ERIC_JONES.md
    type: witness_testimony
  - id: SMS_EVIDENCE
    file: Sayegh_vs_Sayegh_Case_Evidence_SMS_*.pdf
    type: post_termination_contact
  - id: EMAIL_CHAIN
    folder: Kirk-And-Sean-Kolodji-Law-Firm/
    count: 134 emails
  - id: SMOKING_GUN
    file: Otter transcripts Oct 14
    type: recorded_statements
```

---

## QUICK REFERENCE

### Status Enum
```typescript
enum AnalysisStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
```

### Case Types
```typescript
enum CaseType {
  FAMILY = 'FAMILY',      // Red status
  PROBATE = 'PROBATE',    // Emerald status
  ELDER = 'ELDER',        // Amber status
  MALPRACTICE = 'MALPRACTICE',
  STATE_BAR = 'STATE_BAR' // Indigo status
}
```

---

**AUTHORITY:** PFV v14.2 + Constitution of the ReasoningBank
