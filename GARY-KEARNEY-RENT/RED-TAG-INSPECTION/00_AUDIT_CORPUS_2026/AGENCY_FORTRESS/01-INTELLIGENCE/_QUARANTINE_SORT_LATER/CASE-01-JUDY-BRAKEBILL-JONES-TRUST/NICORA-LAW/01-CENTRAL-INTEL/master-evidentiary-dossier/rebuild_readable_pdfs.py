#!/usr/bin/env python3
"""
NUCLEAR CORRECTIVE PASS: Rebuild Readable PDFs from Source Files
PFV v12 Compliant - Zero-Tolerance for False Mission Accomplished
"""

import re
import os
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from docx import Document

# Define paths
BASE_DIR = Path("/Users/ericjones/Compass Fortress/cases/judy-jones-probate-850")
PFV_DIR = BASE_DIR / "PFV_V12_FPF_V1_COMPLIANT_2025-11-16/core-filing-documents"
DOCX_DIR = BASE_DIR / "EMAIL_TO_ANUAR_CLEAN"
OUTPUT_DIR = BASE_DIR / "EMAIL_TO_ANUAR_READY"

# Document mapping with sources
DOCUMENTS = {
    "01_Ex_Parte_Application": {
        "source_type": "corrected_txt",
        "source_file": PFV_DIR / "01_Ex_Parte_Application_CORRECTED_2025-11-16.txt",
        "title": "EX PARTE APPLICATION FOR TEMPORARY RESTRAINING ORDER"
    },
    "02_Declaration_with_Exhibits": {
        "source_type": "corrected_txt",
        "source_file": PFV_DIR / "02_Declaration_with_Exhibits_CORRECTED_2025-11-16.txt",
        "title": "DECLARATION OF ERIC B. JONES WITH EXHIBITS"
    },
    "03a_Declaration_Good_Cause": {
        "source_type": "clean_txt",
        "source_file": DOCX_DIR / "03a_Declaration_Good_Cause_CLEAN_NO_METADATA.txt",
        "title": "DECLARATION FOR GOOD CAUSE EXCEPTION TO NOTICE"
    },
    "04_MPA": {
        "source_type": "corrected_txt",
        "source_file": PFV_DIR / "04_MPA_CORRECTED_2025-11-16.txt",
        "title": "MEMORANDUM OF POINTS AND AUTHORITIES"
    },
    "05_Proposed_TRO_OSC": {
        "source_type": "clean_txt",
        "source_file": DOCX_DIR / "05_Proposed_TRO_OSC_CLEAN_NO_METADATA.txt",
        "title": "PROPOSED TEMPORARY RESTRAINING ORDER AND ORDER TO SHOW CAUSE"
    },
    "06_Petition_850": {
        "source_type": "corrected_txt",
        "source_file": PFV_DIR / "06_Petition_850_CORRECTED_2025-11-16.txt",
        "title": "PETITION UNDER PROBATE CODE SECTION 850"
    },
    "07_Probate_Cover_Sheet": {
        "source_type": "clean_txt",
        "source_file": DOCX_DIR / "07_Probate_Cover_Sheet_CLEAN_NO_METADATA.txt",
        "title": "PROBATE COVER SHEET"
    }
}


def strip_line_numbers(text):
    """
    Strip leading line numbers from pleading paper format.
    Handles formats like:
    - "1   ERIC B. JONES"
    - "12  SUPERIOR COURT"
    Also removes standalone numbers that appear mid-text (line numbers from pleading paper).
    """
    # First pass: remove line numbers from start of lines
    lines = []
    for line in text.split('\n'):
        # Strip line numbers at start of line (1-28 typically)
        cleaned = re.sub(r'^\s*\d{1,2}\s{2,}', '', line)
        lines.append(cleaned)

    text = '\n'.join(lines)

    # Second pass: remove mid-text line numbers (more aggressive)
    # Pattern: number preceded by space or punctuation, followed by space
    # Examples: "Trust. 3 2." or "Trust) 6 Sole"
    text = re.sub(r'([.)\]]\s+)\d{1,2}\s+(\d)', r'\1\2', text)  # "...Trust. 3 2." -> "...Trust. 2."
    text = re.sub(r'([.)\]]\s+)\d{1,2}\s+([A-Z])', r'\1\2', text)  # "...Trust. 6 Sole" -> "...Trust. Sole"
    text = re.sub(r'(\w)\s+\d{1,2}\s+(\d{1,2}\.)', r'\1 \2', text)  # "...Trust 15 6." -> "...Trust 6."

    # Remove sequences of just line numbers (from blank pleading pages)
    # Pattern: lines with just numbers like "1 2 3 4 5 6 7 8 ..."
    text = re.sub(r'\n\s*\d+\s+\d+\s+\d+\s+\d+.*?\n', '\n', text)
    text = re.sub(r'^(\s*\d+\s+){10,}$', '', text, flags=re.MULTILINE)

    # Clean up multiple spaces and extra blank lines
    text = re.sub(r'\s{3,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def extract_text_from_corrected_txt(file_path):
    """Extract and clean text from CORRECTED txt files with line numbers."""
    print(f"  Reading CORRECTED txt: {file_path.name}")
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Strip line numbers
    cleaned_text = strip_line_numbers(text)
    return cleaned_text


def extract_text_from_docx(file_path):
    """Extract text from DOCX files, handling one-word-per-paragraph corruption and filtering metadata."""
    print(f"  Reading DOCX: {file_path.name}")
    doc = Document(file_path)

    # Extract all paragraphs
    paragraphs = []
    current_sentence = []
    skip_mode = False

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            if current_sentence:
                paragraphs.append(' '.join(current_sentence))
                current_sentence = []
            paragraphs.append('')  # Preserve blank lines
            continue

        # Skip FPF metadata headers and certification blocks
        if text.startswith('==='):
            skip_mode = not skip_mode  # Toggle skip mode on separator lines
            continue
        if skip_mode:
            continue
        if 'Generated:' in text or 'Framework:' in text or 'Source:' in text:
            continue
        if text.startswith('[PAGE') and 'CONFIDENCE' in text:
            continue
        if 'VERIFIED INSTITUTIONAL DATA:' in text:
            continue
        if text.startswith('Petitioner: ERIC') or text.startswith('Address: 5634'):
            continue
        if text.startswith('Trust: The Judy') or text.startswith('Property:'):
            continue
        if 'Extraction Mode:' in text or 'STRICT EXTRACTION' in text:
            continue
        if 'Framework Compliance:' in text or 'FPF v1.0' in text:
            continue
        if 'CERTIFICATION:' in text or 'CONFIDENCE' in text:
            continue
        if text.startswith('■ [') and '%' in text:
            continue
        # Skip lines that are mostly boxes/symbols
        if text.count('■') > len(text) / 4:
            continue
        # Skip fabrication correction notices
        if 'FABRICATION CORRECT' in text.upper():
            continue

        # Replace box symbols with bullets or checkboxes
        text = text.replace('■ Yes', '☐ Yes')
        text = text.replace('■ No', '☐ No')
        text = text.replace('■■', '')  # Remove double boxes
        text = re.sub(r'■+', '', text)  # Remove all remaining box symbols

        # Check if text is a single word or very short (likely one-word-per-line corruption)
        if len(text.split()) <= 2 and not text.endswith('.') and not text.endswith(':'):
            current_sentence.append(text)
        else:
            if current_sentence:
                current_sentence.append(text)
                paragraphs.append(' '.join(current_sentence))
                current_sentence = []
            else:
                paragraphs.append(text)

    # Add any remaining sentence
    if current_sentence:
        paragraphs.append(' '.join(current_sentence))

    # Filter out empty paragraphs and clean up
    cleaned_paragraphs = []
    for p in paragraphs:
        p = p.strip()
        if p and len(p) > 1:  # Skip very short or empty
            cleaned_paragraphs.append(p)

    return '\n\n'.join(cleaned_paragraphs)


def create_readable_pdf(text, output_path, doc_title):
    """Create a clean, readable PDF without pleading paper formatting."""
    print(f"  Generating PDF: {output_path.name}")

    # Create PDF
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=1*inch,
        leftMargin=1*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )

    # Define styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor='black',
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        alignment=TA_LEFT,
        fontName='Helvetica'
    )

    # Build story
    story = []

    # Add title
    story.append(Paragraph(doc_title, title_style))
    story.append(Spacer(1, 0.3*inch))

    # Add content paragraphs
    paragraphs = text.split('\n\n')
    for para_text in paragraphs:
        if not para_text.strip():
            story.append(Spacer(1, 0.1*inch))
            continue

        # Clean up the text
        para_text = para_text.strip()

        # Skip page headers/footers from source
        if 'Page' in para_text and 'of' in para_text and len(para_text) < 50:
            continue

        # Replace multiple spaces with single space
        para_text = re.sub(r'\s+', ' ', para_text)

        # Create paragraph
        try:
            para = Paragraph(para_text, body_style)
            story.append(para)
            story.append(Spacer(1, 0.1*inch))
        except Exception as e:
            print(f"    Warning: Could not add paragraph: {str(e)[:50]}")
            continue

    # Build PDF
    doc.build(story)
    print(f"  ✓ PDF created: {output_path.name}")


def main():
    print("=" * 80)
    print("NUCLEAR CORRECTIVE PASS: Rebuilding Readable PDFs")
    print("PFV v12 Gate 0 (Honesty) and Gate 6 (Format Integrity) Enforcement")
    print("=" * 80)
    print()

    # Verify output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    success_count = 0
    failure_log = []

    for doc_key, doc_info in DOCUMENTS.items():
        print(f"\nProcessing: {doc_key}")
        print(f"  Source Type: {doc_info['source_type']}")

        try:
            # Extract text based on source type
            if doc_info['source_type'] == 'corrected_txt':
                text = extract_text_from_corrected_txt(doc_info['source_file'])
            elif doc_info['source_type'] == 'clean_txt':
                # These are already clean txt files, just read them
                print(f"  Reading clean txt: {doc_info['source_file'].name}")
                with open(doc_info['source_file'], 'r', encoding='utf-8') as f:
                    text = f.read()
            elif doc_info['source_type'] == 'docx':
                text = extract_text_from_docx(doc_info['source_file'])
            else:
                raise ValueError(f"Unknown source type: {doc_info['source_type']}")

            # Verify we have content
            if len(text.strip()) < 100:
                raise ValueError(f"Extracted text too short ({len(text)} chars)")

            # Create PDF
            output_path = OUTPUT_DIR / f"{doc_key}_READABLE.pdf"
            create_readable_pdf(text, output_path, doc_info['title'])

            success_count += 1
            print(f"  ✓ SUCCESS: {doc_key}")

        except Exception as e:
            error_msg = f"✗ FAILED: {doc_key} - {str(e)}"
            print(f"  {error_msg}")
            failure_log.append(error_msg)

    # Final report
    print("\n" + "=" * 80)
    print(f"REBUILD COMPLETE")
    print(f"  Successes: {success_count}/7")
    print(f"  Failures: {len(failure_log)}/7")

    if failure_log:
        print("\nFAILURE LOG:")
        for error in failure_log:
            print(f"  {error}")
        print("\nPFV v12 GATE FAILED: Cannot claim mission accomplished with failures.")
        return 1
    else:
        print("\n✓ All 7 documents rebuilt successfully")
        print("  Next: Visual verification required before final sign-off")
        return 0


if __name__ == "__main__":
    sys.exit(main())
