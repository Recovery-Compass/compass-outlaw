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