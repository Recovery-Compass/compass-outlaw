import { PDFValidationResult } from '../types';
import { PDF_VALIDATION_CONFIG } from '../constants';

export const validatePDF = async (file: File): Promise<PDFValidationResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PDF_VALIDATION_CONFIG.timeout);

    const response = await fetch(PDF_VALIDATION_CONFIG.endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        error: data.error || 'Validation failed',
        details: data.details || 'Unknown error occurred during PDF validation'
      };
    }

    return {
      status: 'success',
      font_check: data.font_check,
      pdfa_conversion: data.pdfa_conversion,
      download_url: data.download_url
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'error',
        error: 'Validation timeout',
        details: 'The validation process took too long. Please try again or use the professional workaround.'
      };
    }
    return {
      status: 'error',
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Failed to connect to validation service'
    };
  }
};
