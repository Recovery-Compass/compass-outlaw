#!/bin/bash
#
# PDF CONVERSION SCRIPT
# Converts all attorney-ready Word documents to PDF
# Uses LibreOffice (if available) or instructions for Adobe Acrobat Pro
#

echo "================================================================================"
echo "PDF CONVERSION: Attorney-Ready Documents → PDF Package"
echo "================================================================================"
echo ""

INPUT_DIR="/Users/ericjones/Compass Fortress/cases/judy-jones-probate-850/PFV_V12_FPF_V1_COMPLIANT_2025-11-16/core-filing-documents"
cd "$INPUT_DIR"

# Check if LibreOffice is available
if command -v soffice &> /dev/null; then
    echo "✅ LibreOffice found - converting documents..."
    echo ""
    
    for docx in *_ATTORNEY_READY.docx; do
        if [ -f "$docx" ]; then
            echo "Converting: $docx"
            soffice --headless --convert-to pdf --outdir "$INPUT_DIR" "$docx" 2>&1 | grep -v "javaldx:"
            if [ $? -eq 0 ]; then
                echo "✅ Created: ${docx%.docx}.pdf"
            else
                echo "❌ Failed: $docx"
            fi
            echo ""
        fi
    done
    
    echo "================================================================================"
    echo "CONVERSION COMPLETE"
    echo "================================================================================"
    echo ""
    echo "PDF files created in:"
    echo "  $INPUT_DIR"
    echo ""
    ls -lh *.pdf 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    
else
    echo "⚠️  LibreOffice not found in PATH"
    echo ""
    echo "ALTERNATIVE: Use Adobe Acrobat Pro"
    echo "================================================================================"
    echo ""
    echo "To convert using Adobe Acrobat Pro:"
    echo ""
    echo "1. Open Adobe Acrobat Pro"
    echo "2. File → Create → PDF from File"
    echo "3. Select each .docx file from:"
    echo "   $INPUT_DIR"
    echo "4. Save as PDF in the same directory"
    echo ""
    echo "OR use Batch Processing:"
    echo ""
    echo "1. Tools → Action Wizard → Create New Action"
    echo "2. Add step: Convert to PDF"
    echo "3. Run on all *_ATTORNEY_READY.docx files"
    echo ""
    echo "================================================================================"
    echo ""
    echo "Word documents ready for conversion:"
    ls -lh *_ATTORNEY_READY.docx | awk '{print "  " $9 " (" $5 ")"}'
fi

echo ""
echo "================================================================================"
echo "NEXT STEPS AFTER PDF CONVERSION"
echo "================================================================================"
echo "1. Review PDFs for formatting accuracy"
echo "2. Package with enhancement documents for Attorney Anuar"
echo "3. Send email using prepared email body"
echo ""
