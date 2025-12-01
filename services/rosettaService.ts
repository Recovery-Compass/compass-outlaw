import { GoogleGenAI } from "@google/genai";
import { ConversionResult, CompassManifest, SourceQuality, ContentClassification } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

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
      // =========================================================================
      // DIRECTIVE 5: Graceful JSON Fallback for TABULAR content
      // Parquet pipeline not available in web UI - use JSON array format
      // =========================================================================
      console.warn('CRITICAL WARNING: Parquet pipeline not available. Falling back to JSON. For optimal tabular processing, use local pipeline.');
      
      optimalFormat = 'JSON';
      
      // Convert tabular data to JSON array format via Gemini
      const jsonFallbackPrompt = `
${SYSTEM_INSTRUCTION}

=== ROSETTA STONE v1.0 – TABULAR TO JSON FALLBACK ===

Convert the following tabular data to a well-structured JSON array format.
This is a DEGRADED OUTPUT because Parquet conversion requires the local pipeline.

FILE: ${fileName}

CONTENT:
${content.slice(0, 8000)}

REQUIREMENTS:
1. Convert each row to a JSON object
2. Use the header row (if present) as keys
3. Preserve data types where possible (numbers, dates, strings)
4. Return a valid JSON array

OUTPUT: Valid JSON array only, no explanation.
`;

      const jsonResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: jsonFallbackPrompt,
        config: {
          temperature: 0.2,
        },
      });

      const jsonText = jsonResponse.text || '[]';
      
      // Extract JSON array from response
      const jsonArrayMatch = jsonText.match(/\[[\s\S]*\]/);
      const jsonContent = jsonArrayMatch ? jsonArrayMatch[0] : '[]';
      
      // Add warning banner to output with local pipeline command
      convertedContent = `// ⚠️ DEGRADED OUTPUT: Parquet unavailable, using JSON fallback
// For optimal tabular processing, route to local pipeline:
// cp "${fileName}" ~/Fortress/rosetta-stone/input/
//
// Local pipeline provides:
// - Native Parquet compression (10x smaller files)
// - Column-oriented storage for faster queries
// - Full PyArrow schema inference
//
// This JSON fallback is functional but suboptimal for large datasets.

${jsonContent}`;

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

    // Step 3: Determine source quality and schema validity
    const sourceQuality = detectSourceQuality(mimeType, content);
    const conversionSuccess = convertedContent.length > 0 && !convertedContent.includes('CRITICAL FAILURE');
    const schemaValid = analysis.classification === 'HIERARCHICAL' ? !!jsonSchema : null;

    // Step 4: Calculate ESV Score using 50-10-20-20 Rule
    const esvScore = calculateESVScore(sourceQuality, conversionSuccess, schemaValid);

    // Step 5: Generate PFV Metadata YAML Footer
    const pfvMetadata = generatePFVMetadataYAML(fileName, optimalFormat, esvScore, timestamp, analysis);

    // Step 6: Build CompassManifest for local pipeline interoperability
    const manifest: CompassManifest = {
      sourceFileName: fileName,
      compassCaseID: null, // Set by UI when user selects case
      classification: analysis.classification,
      esvScore,
      pfvMetadata,
      processedFileURL: '', // Set after file is processed/downloaded
    };

    return {
      originalContent: content,
      convertedContent,
      optimalFormat,
      evidenceScore: esvScore,
      pfvMetadata,
      jsonSchema,
      manifest,
      requiresLocalPipeline: analysis.classification === 'TABULAR',
    };

  } catch (error) {
    console.error("Rosetta Stone conversion error:", error);
    throw error;
  }
};

/**
 * Detect source quality based on MIME type and content characteristics
 */
function detectSourceQuality(mimeType: string, content: string): SourceQuality {
  // Digital native formats (text-selectable)
  if (mimeType.includes('text/') || 
      mimeType.includes('application/json') ||
      mimeType.includes('application/xml') ||
      mimeType.includes('text/markdown')) {
    return 'digital';
  }
  
  // Check for scanned content indicators
  if (content.includes('[OCR]') || content.includes('[SCANNED]')) {
    return content.length > 1000 ? 'highres_scan' : 'lowres';
  }
  
  // PDF/DOCX could be either - assume digital if text is extractable
  if (mimeType.includes('application/pdf') || mimeType.includes('application/vnd')) {
    return content.length > 500 ? 'digital' : 'highres_scan';
  }
  
  return 'digital'; // Default to digital for text content
}

/**
 * Calculate Evidence Score Value (ESV) using the 50-10-20-20 Rule
 * Architect-Verified Algorithm for PFV V14.2 Compliance
 * 
 * Base Score: 50 points
 * Source Quality: +10 (digital) / +5 (highres) / +0 (lowres)
 * Conversion Integrity: +20 (success) / -50 (critical failure)
 * Schema Validation: +20 (valid) / -30 (invalid) / neutral (N/A)
 * 
 * Max Score: 100 | Passing Threshold: 70 (Tier 1 Verified)
 */
function calculateESVScore(
  sourceQuality: SourceQuality,
  conversionSuccess: boolean,
  schemaValid: boolean | null
): number {
  let score = 50; // Base score

  // Source Quality (+10 / +5 / +0)
  if (sourceQuality === 'digital') {
    score += 10;
  } else if (sourceQuality === 'highres_scan') {
    score += 5;
  }
  // lowres = +0

  // Conversion Integrity (+20 / -50)
  if (conversionSuccess) {
    score += 20;
  } else {
    score -= 50;
  }

  // Schema Validation (+20 / -30 / neutral if N/A)
  if (schemaValid === true) {
    score += 20;
  } else if (schemaValid === false) {
    score -= 30;
  }
  // null = neutral (N/A for non-hierarchical)

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate PFV v14.2 Agent Accountability Metadata in YAML format
 * For CompassManifest local pipeline interoperability
 */
function generatePFVMetadataYAML(
  fileName: string,
  format: string,
  esv: number,
  timestamp: string,
  analysis: AnalysisResult
): string {
  const tier = esv >= 70 ? 'Tier 1 Verified' : 'Review Required';
  
  return `---
Agent-Identity: Rosetta Stone v1.0 (via Compass Outlaw)
Conversion-Timestamp: ${timestamp}
Source-File: ${fileName}
Target-Format: ${format}
Content-Classification: ${analysis.classification}
Classification-Confidence: ${analysis.confidence}%
Evidence-Score-Value: ${esv}/100
Tier: ${tier}
PFV-Version: 14.2
Analysis-Reasoning: ${analysis.reasoning}
Model: gemini-2.5-flash
---`;
}
