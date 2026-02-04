#!/bin/bash
#
# SIMPLE CRC 2.111 PDF CONVERSION
# Converts Word documents to PDF while preserving line numbering
#

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "PDF CONVERSION: CRC 2.111 FORMAT PRESERVATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Directories
SOURCE_DIR="/Users/ericjones/Compass Fortress/cases/judy-jones-probate-850/4-email-to-anuar-nov15/attachments/word-documents-with-headers"
OUTPUT_DIR="/Users/ericjones/Compass Fortress/cases/judy-jones-probate-850/1-core-filing-documents/ATTORNEY_READY_PDFS"
TEMP_DIR="/tmp/pdf_conversion_$$"

# Create directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "📁 Source: $SOURCE_DIR"
echo "📁 Output: $OUTPUT_DIR"
echo ""

echo "STEP 1: Convert text files to Word format"
echo "─────────────────────────────────────────────────────────────"
echo ""

cd "$SOURCE_DIR"

# Convert text files using simple copy to preserve formatting
for txt_file in *_FORMATTED.txt; do
    if [ -f "$txt_file" ]; then
        docx_file="${txt_file%.txt}.docx"
        echo "📝 $txt_file → $docx_file"

        # Use textutil (built-in macOS tool) for simple conversion
        textutil -convert docx "$txt_file" -output "$TEMP_DIR/$docx_file"

        echo "   ✅ Created"
    fi
done

echo ""
echo "STEP 2: Convert all Word documents to PDF"
echo "─────────────────────────────────────────────────────────────"
echo ""

count=0

# Convert existing Word docs
for docx_file in *.docx; do
    if [ -f "$docx_file" ]; then
        pdf_name="${docx_file%.docx}.pdf"
        echo "📄 Converting: $docx_file"

        soffice --headless --convert-to pdf --outdir "$OUTPUT_DIR" "$docx_file" &> /dev/null

        if [ -f "$OUTPUT_DIR/$pdf_name" ]; then
            echo "   ✅ SUCCESS"
            ((count++))
        else
            echo "   ❌ FAILED"
        fi
    fi
done

# Convert newly created Word docs from temp
cd "$TEMP_DIR"
for docx_file in *.docx; do
    if [ -f "$docx_file" ]; then
        pdf_name="${docx_file%.docx}.pdf"
        echo "📄 Converting: $docx_file"

        soffice --headless --convert-to pdf --outdir "$OUTPUT_DIR" "$docx_file" &> /dev/null

        if [ -f "$OUTPUT_DIR/$pdf_name" ]; then
            echo "   ✅ SUCCESS"
            ((count++))
        else
            echo "   ❌ FAILED"
        fi
    fi
done

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ CONVERSION COMPLETE: $count PDFs created"
echo "📁 Output: $OUTPUT_DIR"
echo "═══════════════════════════════════════════════════════════════"
