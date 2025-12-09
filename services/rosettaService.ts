import { supabase } from '@/src/integrations/supabase/client';
import { ConversionResult, CompassManifest, SourceQuality, ContentClassification } from '../types';

interface AnalysisResult {
  classification: ContentClassification;
  confidence: number;
  reasoning: string;
}

/**
 * Rosetta Stone v1.0 - AI-Powered File Converter
 * Optimizes files for maximum AI processing efficiency with PFV v14.2 compliance
 * Uses Supabase Edge Function for secure Gemini API access
 */
export const convertWithRosetta = async (
  content: string,
  fileName: string,
  mimeType: string
): Promise<ConversionResult> => {
  const timestamp = new Date().toISOString();

  try {
    // Call the edge function for Rosetta Stone conversion
    const { data, error } = await supabase.functions.invoke('gemini-draft', {
      body: {
        action: 'rosetta-stone',
        payload: { 
          content: content.slice(0, 10000), // Limit content size
          fileName,
          mimeType,
          timestamp
        }
      }
    });

    if (error) {
      console.error('Rosetta Stone edge function error:', error);
      throw new Error(error.message || 'Rosetta Stone conversion failed');
    }

    // If edge function returns the full result
    if (data.convertedContent) {
      return data as ConversionResult;
    }

    // Fallback: Build result from edge function response
    const analysis: AnalysisResult = data.analysis || {
      classification: 'PROSE' as ContentClassification,
      confidence: 50,
      reasoning: 'Default classification'
    };

    const convertedContent = data.text || content;
    const optimalFormat = analysis.classification === 'TABULAR' ? 'JSON' : 
                         analysis.classification === 'HIERARCHICAL' ? 'JSON' : 'Markdown';

    // Calculate ESV Score
    const sourceQuality = detectSourceQuality(mimeType, content);
    const conversionSuccess = convertedContent.length > 0;
    const schemaValid = analysis.classification === 'HIERARCHICAL' ? !!data.jsonSchema : null;
    const esvScore = calculateESVScore(sourceQuality, conversionSuccess, schemaValid);

    // Generate PFV Metadata
    const pfvMetadata = generatePFVMetadataYAML(fileName, optimalFormat, esvScore, timestamp, analysis);

    // Build manifest
    const manifest: CompassManifest = {
      sourceFileName: fileName,
      compassCaseID: null,
      classification: analysis.classification,
      esvScore,
      pfvMetadata,
      processedFileURL: '',
    };

    return {
      originalContent: content,
      convertedContent,
      optimalFormat: optimalFormat as 'Markdown' | 'Parquet' | 'JSON',
      evidenceScore: esvScore,
      pfvMetadata,
      jsonSchema: data.jsonSchema,
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
  if (mimeType.includes('text/') || 
      mimeType.includes('application/json') ||
      mimeType.includes('application/xml') ||
      mimeType.includes('text/markdown')) {
    return 'digital';
  }
  
  if (content.includes('[OCR]') || content.includes('[SCANNED]')) {
    return content.length > 1000 ? 'highres_scan' : 'lowres';
  }
  
  if (mimeType.includes('application/pdf') || mimeType.includes('application/vnd')) {
    return content.length > 500 ? 'digital' : 'highres_scan';
  }
  
  return 'digital';
}

/**
 * Calculate Evidence Score Value (ESV) using the 50-10-20-20 Rule
 */
function calculateESVScore(
  sourceQuality: SourceQuality,
  conversionSuccess: boolean,
  schemaValid: boolean | null
): number {
  let score = 50;

  if (sourceQuality === 'digital') {
    score += 10;
  } else if (sourceQuality === 'highres_scan') {
    score += 5;
  }

  if (conversionSuccess) {
    score += 20;
  } else {
    score -= 50;
  }

  if (schemaValid === true) {
    score += 20;
  } else if (schemaValid === false) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate PFV v14.2 Agent Accountability Metadata in YAML format
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
