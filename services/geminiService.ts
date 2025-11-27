import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface IntelligenceResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const generateIntelligenceReport = async (
  fidelityContext: string,
  trustContext: string,
  buiContext: string
): Promise<IntelligenceResult> => {
  if (!apiKey) {
    return {
      text: "## SYSTEM ERROR\nAPI Key missing. Cannot generate intelligence report.",
      sources: []
    };
  }

  try {
    const prompt = `
      INPUT DATA:
      1. American Fidelity Context: ${fidelityContext}
      2. Judy Jones Trust (Anuar) Context: ${trustContext}
      3. H Bui Refund Context: ${buiContext}

      Generate the report adhering strictly to the required format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual/analytical output
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No intelligence generated.";

    // Extract grounding sources
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    chunks.forEach(chunk => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'External Source',
          uri: chunk.web.uri || '#'
        });
      }
    });

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "## CRITICAL FAILURE\nIntelligence gathering failed. Connection to AI Core severed.",
      sources: []
    };
  }
};

export interface LegalStrategyResult {
  text: string;
}

export const draftLegalStrategy = async (
  recipient: string,
  keyFacts: string,
  desiredOutcome: string,
  tone: 'AGGRESSIVE' | 'COLLABORATIVE' | 'FORMAL'
): Promise<LegalStrategyResult> => {
  if (!apiKey) {
    return { text: "## SYSTEM ERROR\nAPI Key missing. Cannot draft legal strategy." };
  }

  try {
    const prompt = `
      ACT AS: Senior Litigation Strategist (AutoLex Architect).
      TASK: Draft a legal correspondence.

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    return { text: response.text || "Drafting failed." };
  } catch (error) {
    console.error("Gemini AutoLex Error:", error);
    return { text: "## CRITICAL FAILURE\nAutoLex drafting failed." };
  }
};