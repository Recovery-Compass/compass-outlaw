# 1. GENERATE THE PAGINATED RECTIFIED SCRIPT
cat << 'EOF' > forge_kearney_paginated.py
import io, textwrap
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER

# --- MASTER PHYSICS ENGINE v7.4 (PAGINATED) ---
LEADING = 24.0      # Exact double spacing per CRC 2.108
LINE_1_Y = 720.0    # Absolute mathematical baseline
LEFT_RAIL_X = 97.2  # 1.35" Fortress Standard rail
TEXT_START_X = 108.0# 1.50" Text anchor
GUTTER_X = 300.0    # Caption box axis
RIGHT_RAIL_X = 550.0# Safety limit

def get_line_y(line_num): return LINE_1_Y - ((line_num - 1) * LEADING)

def draw_rails(c, page_num):
    # Left Rails (Double)
    c.setLineWidth(1.0)
    c.line(LEFT_RAIL_X, 50, LEFT_RAIL_X, 760)
    c.line(LEFT_RAIL_X - 6, 50, LEFT_RAIL_X - 6, 760)
    # Line Numbers 1-28
    c.setFont("Courier", 12)
    for i in range(1, 29):
        c.drawRightString(LEFT_RAIL_X - 12, get_line_y(i), str(i))
    # Footer - Rigidly set at y=30 to prevent any collision
    c.setFont("Times-Roman", 10)
    footer = f"NOTICE OF NON-COMPLIANCE | THEATER A | Page {page_num} of 2"
    c.drawCentredString(306, 30, footer)

def generate_rectified_ordnance():
    filename = "NOTICE_OF_VOID_LEASE_AND_DISGORGEMENT_FINAL.pdf"
    c = canvas.Canvas(filename, pagesize=LETTER)
    
    # === PAGE 1 ===
    draw_rails(c, 1)
    
    # 1. HEADER (Lines 1-3)
    c.setFont("Times-Roman", 12)
    c.drawString(TEXT_START_X, get_line_y(1), "ERIC BRAKEBILL JONES")
    c.drawString(TEXT_START_X, get_line_y(2), "5634 Noel Drive, Temple City, CA 91780")
    c.drawString(TEXT_START_X, get_line_y(3), "(626) 348-3019 | Petitioner In Pro Per")

    # 2. COURT TITLE (Line 8)
    c.setFont("Times-Bold", 12)
    c.drawCentredString(306, get_line_y(8), "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(306, get_line_y(9), "FOR THE COUNTY OF LOS ANGELES")

    # 3. CAPTION (Lines 11-15)
    for i in range(11, 16): c.drawString(GUTTER_X, get_line_y(i), ")")
    c.setFont("Times-Bold", 12)
    c.drawString(TEXT_START_X, get_line_y(11), "RE: 5634 NOEL DRIVE")
    c.drawString(GUTTER_X + 15, get_line_y(11), "DEMAND: $173,000.00")
    c.setFont("Times-Roman", 11)
    c.drawString(GUTTER_X + 15, get_line_y(12), "(Rent Disgorgement & CC 789.3)")

    # 4. BODY CONTENT (Starts Line 18)
    c.setFont("Times-Roman", 12)
    content_p1 = [
        "1. VOID LEASE: 5634 Noel Drive is an unpermitted 'Ghost Unit'. Parking widths of <10ft violate TCMC 9-1E-2. Pursuant to Espinoza v. Calva (2008), the lease is void ab initio. No rent is owed.",
        "",
        "2. DISGORGEMENT: Demand is made for the immediate refund of $75,000.00 in rent paid since May 2023 per Carter v. Cohen (2010).",
        "",
        "3. UTILITY BLOCKADE: Your 2.5-year refusal to transfer SCE service violates Civil Code 789.3. Statutory penalties ($100/day) now exceed $98,000.00."
    ]
    
    y_ptr = 18
    for block in content_p1:
        lines = textwrap.wrap(block, width=70)
        for line in lines:
            c.drawString(TEXT_START_X, get_line_y(y_ptr), line)
            y_ptr += 1
    
    c.showPage()

    # === PAGE 2 ===
    draw_rails(c, 2)
    c.setFont("Times-Roman", 12)
    
    content_p2 = [
        "4. RULE 3.3 VIOLATION: Your email of Jan 9 regarding a 'busy signal' is a fabrication rebutted by forensic carrier logs. This constitutes a lack of candor and bad faith communications.",
        "",
        "5. EVIDENCE PRESERVATION: All digital artifacts, including carrier metadata and // CONTEMPORANEOUS DETAILED NOTES // are preserved per PC 632 for trial.",
        "",
        "I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct."
    ]
    
    y_ptr = 2 # Start at Line 2 on Page 2
    for block in content_p2:
        lines = textwrap.wrap(block, width=70)
        for line in lines:
            c.drawString(TEXT_START_X, get_line_y(y_ptr), line)
            y_ptr += 1

    # SIGNATURE BLOCK (Buffered from Body)
    y_ptr += 2
    c.drawString(TEXT_START_X, get_line_y(y_ptr), "DATED: January 12, 2026")
    c.line(GUTTER_X, get_line_y(y_ptr), RIGHT_RAIL_X, get_line_y(y_ptr))
    c.drawString(GUTTER_X, get_line_y(y_ptr + 1), "ERIC BRAKEBILL JONES")

    c.save()
    print(f"✅ FINAL PAGINATED ORDNANCE FORGED: {filename}")

if __name__ == "__main__": generate_rectified_ordnance()
EOF

# 2. RUN THE SCRIPT
python3 forge_kearney_paginated.py

# 3. VERIFY
ls -lh NOTICE_OF_VOID_LEASE_AND_DISGORGEMENT_FINAL.pdf