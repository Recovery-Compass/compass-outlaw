import { supabase } from '@/src/integrations/supabase/client';
import { GlassHouseSection, LegalDraft } from '../types';
import { GLASS_HOUSE_SAYEGH } from '../config/glassHouseConfig';
import { GRID_LOCK_SPEC_V15_2 } from '../constants';

export interface IntelligenceResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const generateIntelligenceReport = async (
  fidelityContext: string,
  trustContext: string,
  buiContext: string
): Promise<IntelligenceResult> => {
  try {
    const prompt = `
INPUT DATA:
1. American Fidelity Context: ${fidelityContext}
2. Judy Jones Trust (Anuar) Context: ${trustContext}
3. H Bui Refund Context: ${buiContext}

Generate a comprehensive Financial Intelligence Report analyzing the above contexts. Include:
- Key findings and patterns
- Risk assessment
- Recommended actions
- Timeline of events
`;

    const { data, error } = await supabase.functions.invoke('gemini-draft', {
      body: {
        action: 'intelligence',
        payload: { prompt, temperature: 0.2 }
      }
    });

    if (error) {
      console.error('Intelligence report error:', error);
      return {
        text: `## SYSTEM ERROR\n${error.message || 'Failed to generate intelligence report.'}`,
        sources: []
      };
    }

    return { text: data.text || 'No intelligence generated.', sources: [] };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      text: '## CRITICAL FAILURE\nIntelligence gathering failed. Connection to AI Core severed.',
      sources: []
    };
  }
};

export interface LegalStrategyResult {
  text: string;
}

// Pre-generated State Bar Complaint Template - Operation Silent Partner
export const loadComplaintTemplate = (): string => {
  return `# STATE BAR OF CALIFORNIA COMPLAINT
## Against Kirk A. Kolodji (Bar #327031)

### I. RESPONDENT INFORMATION
* **Name:** Kirk A. Kolodji
* **State Bar Number:** 327031
* **Law Firm:** Kolodji Family Law, PC
* **Status:** Active

### II. COMPLAINANT INFORMATION
* **Name:** Nuha Sayegh
* **Relationship:** Former Client (Oct 6-29, 2025)

### III. SUMMARY OF ALLEGED VIOLATIONS
Kirk A. Kolodji violated multiple California Rules of Professional Conduct during his 23-day representation.

| Rule | Description | Key Evidence |
|------|-------------|--------------|
| **Rule 1.4** | Failure to Communicate | Ignored Oct 26 urgent email; "Amateur" conduct per Witness Declaration |
| **Rule 1.5** | Unreasonable Fees | $16,306.42 for 23 days; Block billing |
| **Rule 4.2** | Contact with Represented Person | Nov 6, Nov 23, Nov 26 contacts after termination |
| **Rule 5.3** | Supervision of Non-Lawyers | Sean Kolodji (unlicensed) directed legal strategy |
| **B&P 6125** | Aiding Unauthorized Practice | Allowed unlicensed brother to bill at $175/hr |

### IV. DETAILED ALLEGATIONS

#### A. Rule 1.4 - Failure to Communicate
On October 25-26, 2025, Complainant sent urgent text and email instructions to correct a false Income & Expense Declaration ($5,500/mo income vs. $0 actual). Respondent failed to respond by the stated deadline and filed motions without correcting the error or obtaining consent.

#### B. Rule 1.5 - Unreasonable Fees
Respondent billed $16,306.42 for 23 days of representation ($709/day). The Los Angeles Superior Court later reduced these fees by $2,959.42 (18%) in its November 19, 2025 Order.

#### C. Rule 4.2 - Contact with Represented Person
After being substituted out on October 30, 2025, Respondent contacted Complainant directly on:
1. **Nov 6:** Email discussing case notices.
2. **Nov 23:** SMS asking about visitation schedules.
3. **Nov 26:** SMS asking for email address to re-engage representation.
Respondent knew Complainant was represented by H Bui Law Firm.

#### D. Rule 5.3 & B&P 6125 - Unauthorized Practice of Law
Respondent employed Sean Kolodji (unlicensed) and billed him as a "paralegal." Witness testimony confirms Sean Kolodji provided substantive legal analysis and strategy direction during client conferences.

### V. EXHIBIT I: DECLARATION OF ERIC B. JONES

**I, Eric B. Jones, declare as follows:**

1. I am over the age of eighteen and have personal knowledge of the facts set forth herein.
2. I serve as the authorized representative for Nuha Sayegh in *In re Marriage of Sayegh*.
3. **October 14, 2025 Conference:** I witnessed Ms. Sayegh state to Respondent: "The day before the hearing, you don't have the f***ing client be asking around for money... Send me the f***ing contract... it's completely unprofessional."
4. **Observation of Sean Kolodji:** I participated in case reviews where Sean Kolodji (unlicensed) led the discussion. I heard him state:
   * "The problem is in the moving papers... the application doesn't really make the argument effectively."
   * "We're going to focus on the things that... her story needs to be told."
5. **October 6, 2025:** I heard Kirk Kolodji state: "my brother is working on getting... a groundwork for an updated, sort of supplemental declaration," confirming Sean was drafting legal documents.

I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.

Executed on November 28, 2025.

________________________
**Eric B. Jones**
Declarant

### VI. EVIDENCE LIST (ATTACHED SEPARATELY)
* **Exhibit A:** SMS Screenshots (Nov 23-26)
* **Exhibit C:** Nov 6 Email Chain
* **Exhibit E:** Billing Invoices
`;
};

export const draftLegalStrategy = async (
  recipient: string,
  keyFacts: string,
  desiredOutcome: string,
  tone: 'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'
): Promise<LegalStrategyResult> => {
  try {
    const prompt = `
RECIPIENT: ${recipient}
KEY FACTS: ${keyFacts}
DESIRED OUTCOME: ${desiredOutcome}
TONE: ${tone}

FORMATTING RULES:
1. Use standard legal correspondence headers if applicable.
2. Cite specific California Probate Codes where relevant (infer from context).
3. Be concise, authoritative, and direct.
4. If TONE is AGGRESSIVE, focus on liability and deadlines.
5. If TONE is COLLABORATIVE, focus on mutual benefit and resolution.

OUTPUT: The full draft text of the letter/email.
`;

    const { data, error } = await supabase.functions.invoke('gemini-draft', {
      body: {
        action: 'legal-strategy',
        payload: { prompt, temperature: 0.4 }
      }
    });

    if (error) {
      console.error('Legal strategy error:', error);
      return { text: `## SYSTEM ERROR\n${error.message || 'Failed to draft legal strategy.'}` };
    }

    return { text: data.text || 'Drafting failed.' };
  } catch (error) {
    console.error('Gemini AutoLex Error:', error);
    return { text: '## CRITICAL FAILURE\nAutoLex drafting failed.' };
  }
};

// Glass House Package Document Drafting (V15.2 Forensic Foundry Compliant)
export const draftGlassHouseDocument = async (
  section: GlassHouseSection,
  additionalContext: string
): Promise<LegalStrategyResult> => {
  const config = GLASS_HOUSE_SAYEGH;
  const sectionConfig = config.sections[section];
  
  // V15.2 Spec Injection
  const spec = GRID_LOCK_SPEC_V15_2;

  try {
    const prompt = `
=== GLASS HOUSE PACKAGE V1 – SAYEGH ===
CASE: ${config.caseNumber}
HEARING: ${config.hearingDate}
OBJECTIVE: ${config.objective}

**CRITICAL: V15.2 FORENSIC FOUNDRY COMPLIANCE REQUIRED**
All output must be structured for the following PostScript (bp) parameters:
- \\baselineskip=${spec.baselineskipBp}bp (NOT pt)
- \\lineskiplimit=${spec.lineskiplimitBp} (LaTeX infinity - zero glue)
- \\parskip=${spec.parskipBp}bp
- Font: Times New Roman via XeLaTeX fontspec (Path: ${spec.fontPath})
- Margins: ${spec.topMarginBp}bp top, ${spec.bottomMarginBp}bp bottom, ${spec.leftMarginBp}bp left, ${spec.rightMarginBp}bp right
- **LEFT MARGIN NOTE:** 97.2bp (1.35in) is required to clear the double vertical rail at 1.25in.

OUTPUT FORMAT: Generate content ready for JSON serialization.
The content will be rendered using the V15.2 XeLaTeX pipeline.

DOCUMENT TYPE: ${sectionConfig.title}

KEY LEVERAGE POINTS:
${config.levers.map(l => `• ${l.name}: ${l.description} [Evidence: ${l.evidenceRef}]`).join('\n')}

SECTION-SPECIFIC GUIDANCE:
${sectionConfig.promptContext}

ADDITIONAL CONTEXT FROM USER:
${additionalContext || 'None provided.'}

OUTPUT: Generate the complete ${sectionConfig.title} document content.
`;

    const { data, error } = await supabase.functions.invoke('gemini-draft', {
      body: {
        action: 'glass-house',
        payload: { prompt, temperature: 0.3 }
      }
    });

    if (error) {
      console.error('Glass House error:', error);
      return { text: `## SYSTEM ERROR\n${error.message || 'Failed to draft Glass House document.'}` };
    }

    return { text: data.text || 'Glass House document drafting failed.' };
  } catch (error) {
    console.error('Gemini Glass House Error:', error);
    return { text: '## CRITICAL FAILURE\nGlass House document drafting failed. Check API connection.' };
  }
};

// V15.2: Export to JSON for backend processing (replaces jsPDF)
export const exportToJson = (content: string, title: string, documentType: LegalDraft['document_type'] = 'DECLARATION'): LegalDraft => {
  const legalDraft: LegalDraft = {
    document_type: documentType,
    case_info: { 
      number: GLASS_HOUSE_SAYEGH.caseNumber, 
      name: 'Sayegh v. Sayegh', 
      venue: 'LA Superior - Pasadena' 
    },
    sections: [{ title, content }],
    grid_lock_ready: true, // V15.2 Ready
    vrt_result: undefined
  };
  
  return legalDraft;
};

export const downloadJson = (legalDraft: LegalDraft, filename: string): void => {
  const jsonString = JSON.stringify(legalDraft, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_v15-2_forensic.json`;
  a.click();
  URL.revokeObjectURL(url);
};
