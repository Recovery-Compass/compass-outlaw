import { GoogleGenAI } from "@google/genai";
import { ConversionResult } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

type ContentClassification = 'PROSE' | 'TABULAR' | 'HIERARCHICAL';

interface AnalysisResult {
  classification: ContentClassification;
  confidence: number;
  reasoning: string;
}

/**
 * Rosetta Stone v1.0 - AI-Powered File Converter
 * Optimizes files for maximum AI processing efficiency with PFV v14.2 compliance
 */
export const convertWithRosetta = async (
  content: string,
  fileName: string,
  mimeType: string
): Promise<ConversionResult> => {
  if (!apiKey) {
    throw new Error("API Key missing. Cannot perform Rosetta Stone conversion.");
  }

  const timestamp = new Date().toISOString();

  try {
    // Step 1: Content-Aware Analysis
    const analysisPrompt = `
${SYSTEM_INSTRUCTION}

=== ROSETTA STONE v1.0 – CONTENT ANALYSIS ===

Analyze the following content and classify it into one of three categories:
1. PROSE - Narrative text, articles, legal documents, declarations
2. TABULAR - Spreadsheet data, CSV, structured tables
3. HIERARCHICAL - Nested structures, configurations, tree-like data

FILE: ${fileName}
MIME TYPE: ${mimeType}

CONTENT (first 3000 chars):
${content.slice(0, 3000)}

Respond in this exact JSON format:
{
  "classification": "PROSE" | "TABULAR" | "HIERARCHICAL",
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>"
}
`;

    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: analysisPrompt,
      config: {
        temperature: 0.1,
      },
    });

    const analysisText = analysisResponse.text || '{"classification": "PROSE", "confidence": 50, "reasoning": "Default fallback"}';
    
    // Parse analysis result
    let analysis: AnalysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { classification: 'PROSE', confidence: 50, reasoning: 'Parse fallback' };
    } catch {
      analysis = { classification: 'PROSE', confidence: 50, reasoning: 'Parse fallback' };
    }

    // Step 2: Optimal Format Conversion based on classification
    let convertedContent: string;
    let optimalFormat: 'Markdown' | 'Parquet' | 'JSON';
    let jsonSchema: Record<string, any> | undefined;

    if (analysis.classification === 'TABULAR') {
      // Parquet conversion placeholder
      optimalFormat = 'Parquet';
      convertedContent = `// PARQUET CONVERSION NOTICE
// Parquet conversion requires Python backend with pyarrow library.
// This is a placeholder output.

// Detected tabular structure in: ${fileName}
// Confidence: ${analysis.confidence}%
// Reasoning: ${analysis.reasoning}

// To convert to Parquet, run:
// python rosetta_parquet.py --input "${fileName}" --output "${fileName.replace(/\.[^/.]+$/, '.parquet')}"

// Original content structure detected:
${content.slice(0, 1500)}`;

    } else if (analysis.classification === 'HIERARCHICAL') {
      // JSON conversion with schema inference
      optimalFormat = 'JSON';
      
      const jsonConversionPrompt = `
${SYSTEM_INSTRUCTION}

=== ROSETTA STONE v1.0 – JSON CONVERSION ===

Convert the following content to a well-structured JSON format.
Also infer a JSON Schema that validates the output.

FILE: ${fileName}

CONTENT:
${content.slice(0, 8000)}

Respond with two JSON objects separated by "---SCHEMA---":
1. The converted JSON data
---SCHEMA---
2. The JSON Schema for validation

Ensure the JSON is valid and properly escaped.
`;

      const jsonResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: jsonConversionPrompt,
        config: {
          temperature: 0.2,
        },
      });

      const jsonText = jsonResponse.text || '{}';
      const parts = jsonText.split('---SCHEMA---');
      
      // Extract JSON
      const jsonMatch = parts[0].match(/```json\n?([\s\S]*?)\n?```/) || parts[0].match(/\{[\s\S]*\}/);
      convertedContent = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : '{}';
      
      // Extract Schema
      if (parts[1]) {
        const schemaMatch = parts[1].match(/```json\n?([\s\S]*?)\n?```/) || parts[1].match(/\{[\s\S]*\}/);
        try {
          jsonSchema = schemaMatch ? JSON.parse(schemaMatch[1] || schemaMatch[0]) : undefined;
        } catch {
          jsonSchema = undefined;
        }
      }

    } else {
      // PROSE -> Markdown conversion
      optimalFormat = 'Markdown';
      
      const markdownConversionPrompt = `
${SYSTEM_INSTRUCTION}

=== ROSETTA STONE v1.0 – MARKDOWN CONVERSION ===

Convert the following content to clean, well-structured Markdown.

REQUIREMENTS:
- Preserve all factual content
- Use proper heading hierarchy (# ## ###)
- Format lists, tables, and code blocks appropriately
- Highlight key legal terms in **bold**
- Create logical sections

FILE: ${fileName}

CONTENT:
${content.slice(0, 10000)}

OUTPUT: Clean Markdown document.
`;

      const markdownResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: markdownConversionPrompt,
        config: {
          temperature: 0.3,
        },
      });

      convertedContent = markdownResponse.text || content;
    }

    // Step 3: Calculate ESV Score
    const esvScore = calculateESVScore(content, convertedContent, analysis.confidence);

    // Step 4: Generate PFV Metadata Footer
    const pfvMetadata = generatePFVMetadata(fileName, optimalFormat, esvScore, timestamp, analysis);

    return {
      originalContent: content,
      convertedContent,
      optimalFormat,
      evidenceScore: esvScore,
      pfvMetadata,
      jsonSchema,
    };

  } catch (error) {
    console.error("Rosetta Stone conversion error:", error);
    throw error;
  }
};

/**
 * Calculate Evidence Score Value (ESV) based on conversion quality
 */
function calculateESVScore(
  original: string,
  converted: string,
  classificationConfidence: number
): number {
  let score = 50; // Base score

  // Factor 1: Classification confidence (up to 30 points)
  score += Math.floor(classificationConfidence * 0.3);

  // Factor 2: Content preservation (up to 15 points)
  const originalWords = original.split(/\s+/).length;
  const convertedWords = converted.split(/\s+/).length;
  const preservationRatio = Math.min(convertedWords / originalWords, 1.5);
  if (preservationRatio > 0.5 && preservationRatio < 1.5) {
    score += 15;
  } else if (preservationRatio > 0.3) {
    score += 8;
  }

  // Factor 3: Structure detection (up to 5 points)
  if (converted.includes('#') || converted.includes('{') || converted.includes('|')) {
    score += 5;
  }

  // Cap at 100
  return Math.min(Math.round(score), 100);
}

/**
 * Generate PFV v14.2 Agent Accountability Metadata Footer
 */
function generatePFVMetadata(
  fileName: string,
  format: string,
  esv: number,
  timestamp: string,
  analysis: AnalysisResult
): Record<string, string> {
  return {
    'Agent-Identity': 'Rosetta Stone v1.0 (via Compass Outlaw)',
    'Conversion-Timestamp': timestamp,
    'Source-File': fileName,
    'Target-Format': format,
    'Content-Classification': analysis.classification,
    'Classification-Confidence': `${analysis.confidence}%`,
    'Evidence-Score-Value': `${esv}/100`,
    'PFV-Version': '14.2',
    'Compliance-Status': esv >= 60 ? 'COMPLIANT' : 'REVIEW REQUIRED',
    'Analysis-Reasoning': analysis.reasoning,
    'Model': 'gemini-2.5-flash',
    'Temperature': format === 'JSON' ? '0.2' : format === 'Markdown' ? '0.3' : '0.1',
  };
}
