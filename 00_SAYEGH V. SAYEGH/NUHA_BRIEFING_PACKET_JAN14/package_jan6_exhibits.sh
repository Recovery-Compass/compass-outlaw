#!/bin/bash
# EXHIBIT PACKAGING SCRIPT FOR JANUARY 6, 2026 HEARING
# Sayegh v. Sayegh (25PDFL01441)
# Purpose: Package evidence files, generate hashes, create manifest

set -e

FORTRESS_ROOT="/Users/ericjones/Fortress"
CASE_DIR="$FORTRESS_ROOT/02-CASES/Case-04_Sayegh-DVRO"
OUTPUT_DIR="$CASE_DIR/05-OUTPUT/JAN6_EXHIBIT_PACKAGE"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "========================================="
echo "EXHIBIT PACKAGING FOR JANUARY 6 HEARING"
echo "========================================="
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Define source files for exhibits
EXHIBIT_A_SOURCE="$CASE_DIR/evidence/december-email-discovery/8 conversations saved on Wed Dec 03 2025/2025-12-03T22-04 _nuhasayegh.ca_gmail.com_ 2Fwd_ - SAYEGH - Attorney_s fees.eml"
EXHIBIT_B_SOURCE="$CASE_DIR/evidence/december-email-discovery/8 conversations saved on Wed Dec 03 2025/2025-12-03T22-03 _nuhasayegh.ca_gmail.com_ Fwd_ - SAYEGH - Keech Decl. and Memo. re Nov. 19th Hearing.eml"
EXHIBIT_C_SOURCE="$CASE_DIR/H_BUI_MEMARI/FL150_ERROR_EVIDENCE_GUIDE.md"
EXHIBIT_D_SOURCE="$CASE_DIR/H_BUI_MEMARI/emails" # Directory with withdrawal emails
EXHIBIT_E_SOURCE="$CASE_DIR/evidence/december-email-discovery/Forensic_Report_December_Discovery_Collusion.md"

echo "Step 1: Copying exhibit files..."

# Exhibit A: Attorney Fees Email Thread
if [ -f "$EXHIBIT_A_SOURCE" ]; then
    cp "$EXHIBIT_A_SOURCE" "$OUTPUT_DIR/EXHIBIT_A_Attorney_Fees_Email_Nov19-26.eml"
    echo "  ✓ Exhibit A copied"
else
    echo "  ✗ WARNING: Exhibit A source not found"
fi

# Exhibit B: Strategy Sharing Email
if [ -f "$EXHIBIT_B_SOURCE" ]; then
    cp "$EXHIBIT_B_SOURCE" "$OUTPUT_DIR/EXHIBIT_B_Strategy_Sharing_Oct27.eml"
    echo "  ✓ Exhibit B copied"
else
    echo "  ✗ WARNING: Exhibit B source not found"
fi

# Exhibit C: FL-150 Error Evidence
if [ -f "$EXHIBIT_C_SOURCE" ]; then
    cp "$EXHIBIT_C_SOURCE" "$OUTPUT_DIR/EXHIBIT_C_FL150_Error_Evidence.md"
    echo "  ✓ Exhibit C copied"
else
    echo "  ✗ WARNING: Exhibit C source not found"
fi

# Exhibit E: Forensic Report
if [ -f "$EXHIBIT_E_SOURCE" ]; then
    cp "$EXHIBIT_E_SOURCE" "$OUTPUT_DIR/EXHIBIT_E_Forensic_Collusion_Report.md"
    echo "  ✓ Exhibit E copied"
else
    echo "  ✗ WARNING: Exhibit E source not found"
fi

echo ""
echo "Step 2: Generating SHA-256 checksums..."

# Generate checksums
cd "$OUTPUT_DIR"
shasum -a 256 EXHIBIT_* > EXHIBIT_CHECKSUMS_${TIMESTAMP}.txt 2>/dev/null || true
echo "  ✓ Checksums generated"

echo ""
echo "Step 3: Creating exhibit manifest..."

# Create manifest
cat > "EXHIBIT_MANIFEST_${TIMESTAMP}.txt" << EOF
EXHIBIT MANIFEST FOR JANUARY 6, 2026 HEARING
Case: Sayegh v. Sayegh (25PDFL01441)
Motion: CCP 473(b) Set Aside November 19, 2025 Orders
Generated: $(date)

EXHIBIT LIST:

EXHIBIT A: Attorney Fees Email Thread (November 19-26, 2025)
File: EXHIBIT_A_Attorney_Fees_Email_Nov19-26.eml
Description: Email communications between Kirk Kolodji and Fahed Sayegh regarding direct payment of \$11,000 attorney fees via Zelle, including negotiation, payment arrangements, and thank you email.
Proves: Financial capture of attorney by opposing party; conflict of interest.

EXHIBIT B: Pre-Hearing Strategy Sharing Email (October 27, 2025)
File: EXHIBIT_B_Strategy_Sharing_Oct27.eml  
Description: Email from Kirk Kolodji to Fahed Sayegh and Gilbert Quinones sharing legal declarations and memorandums 23 days before November 19 hearing.
Proves: Breach of attorney-client privilege; collusion with opposing party.

EXHIBIT C: FL-150 Error Evidence Guide
File: EXHIBIT_C_FL150_Error_Evidence.md
Description: Documentation of Income and Expense Declaration error listing Nuha's income as \$5,500 when actual income was \$0.
Proves: Material false information in sworn declaration; attorney failure to correct despite client notification.

EXHIBIT D: Attorney Withdrawal Email (November 21, 2025)
File: [TO BE ADDED - from H_BUI_MEMARI/emails folder]
Description: Email from Kirk Kolodji dated November 21, 2025 at 2:22 AM withdrawing representation 48 hours after November 19 hearing.
Proves: Abandonment during crisis; timing coincides with receipt of payments from opposing party.

EXHIBIT E: Forensic Report on Attorney Collusion
File: EXHIBIT_E_Forensic_Collusion_Report.md
Description: Comprehensive analysis of December 2025 email discovery showing systematic collusion pattern between Kirk Kolodji and Fahed Sayegh.
Proves: Pattern of attorney misconduct; financial dependence on opposing party; breach of fiduciary duty.

EXHIBIT F: November 19, 2025 Minute Order
File: [TO BE ADDED]
Description: Court minute order from November 19, 2025 hearing showing support orders based on false income figures.
Proves: Orders were based on materially false information.

INTEGRITY VERIFICATION:
SHA-256 checksums for all exhibits are recorded in EXHIBIT_CHECKSUMS_${TIMESTAMP}.txt
Any alteration of exhibit files will be detectable through checksum comparison.

FILING INSTRUCTIONS:
1. Convert all .eml and .md files to PDF format for court filing
2. Attach this manifest as cover page to exhibit package
3. Retain original files with checksums for evidentiary authentication if challenged

Generated by: Fortress Exhibit Packaging Script v1.0
Operator: Eric Jones / Nuha Sayegh (Pro Per)
EOF

echo "  ✓ Manifest created"

echo ""
echo "Step 4: Generating summary report..."

# Count files
EXHIBIT_COUNT=$(ls -1 EXHIBIT_* 2>/dev/null | grep -v "CHECKSUMS\|MANIFEST" | wc -l)

echo ""
echo "========================================="
echo "PACKAGING COMPLETE"
echo "========================================="
echo "Location: $OUTPUT_DIR"
echo "Exhibits packaged: $EXHIBIT_COUNT"
echo "Manifest: EXHIBIT_MANIFEST_${TIMESTAMP}.txt"
echo "Checksums: EXHIBIT_CHECKSUMS_${TIMESTAMP}.txt"
echo ""
echo "NEXT STEPS:"
echo "1. Review all exhibits for accuracy"
echo "2. Add Exhibit D (withdrawal email) manually"
echo "3. Add Exhibit F (Nov 19 minute order) manually"  
echo "4. Convert exhibits to PDF format for filing"
echo "5. Attach to Motion to Set Aside and Declaration"
echo ""
echo "To view manifest:"
echo "cat $OUTPUT_DIR/EXHIBIT_MANIFEST_${TIMESTAMP}.txt"
echo ""
