import io, textwrap
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER

# --- MASTER PHYSICS ENGINE v10.0 (CRC COMPLIANT) ---
# VERIFICATION: ALIGNED WITH CRC RULE 2.100-2.118
# ------------------------------------------------------------------
LEADING = 24.0      # Exact double spacing (CRC 2.108)
LINE_1_Y = 720.0    # Absolute Baseline (1 inch from top)
LEFT_RAIL_X = 97.2  # 1.35" Left Margin (Compliant > 1")
TEXT_START_X = 108.0# 1.50" Text Anchor
GUTTER_X = 300.0    # Caption Axis
RIGHT_RAIL_X = 550.0# Right Rail (Leaves ~0.86" margin)

# --- THE RAIL GEOMETRY (ABSOLUTE SYMMETRY) ---
# These variables control the vertical lines for BOTH sides.
TOP_RAIL_Y = 760    # Starts ABOVE Line 1 (Framing the page)
BOTTOM_MARGIN = 50  # Ends BELOW Line 28 (Framing the footer)

def get_line_y(line_num):
    """Calculates absolute Y-coordinate for Lines 1-28."""
    return LINE_1_Y - ((line_num - 1) * LEADING)

def draw_static_architecture(c, page_num, case_no, doc_title):
    """Draws the immutable grid, rails, and footer for ANY page."""

    # 1. GRID-LOCK: Line Numbers (Courier 12pt)
    c.setFont("Courier", 12)
    for i in range(1, 29):
        # Numbers explicitly aligned to the text baseline
        c.drawRightString(LEFT_RAIL_X - 12, get_line_y(i), str(i))

    # 2. THE RAILS (The "Cage")
    c.setLineWidth(1.0)
    
    # Left Double Rail (Top to Bottom)
    c.line(LEFT_RAIL_X, BOTTOM_MARGIN, LEFT_RAIL_X, TOP_RAIL_Y)
    c.line(LEFT_RAIL_X - 6, BOTTOM_MARGIN, LEFT_RAIL_X - 6, TOP_RAIL_Y)
    
    # Right Single Rail (Top to Bottom)
    # VERIFIED: Uses identical Y-coordinates to Left Rail
    c.line(RIGHT_RAIL_X, BOTTOM_MARGIN, RIGHT_RAIL_X, TOP_RAIL_Y)

    # 3. FOOTER (Centered between rails)
    # The Footer Separator Line (CRC 2.110 standard)
    c.line(LEFT_RAIL_X, BOTTOM_MARGIN, RIGHT_RAIL_X, BOTTOM_MARGIN) 
    
    c.setFont("Times-Roman", 10)
    footer_text = f"Case No: {case_no} | {doc_title} | Page {page_num}"
    c.drawCentredString(325, 30, footer_text) 

def generate_ordnance():
    filename = "VERIFIED_PLEADING_GOLD_v10.pdf"
    c = canvas.Canvas(filename, pagesize=LETTER)

    # --- PAGE 1 CONFIG ---
    CASE_NO = "25PR000590"
    TITLE = "MOTION TO DISQUALIFY COUNSEL"
    
    draw_static_architecture(c, 1, CASE_NO, TITLE)

    # 1. ATTORNEY BLOCK (Top Left)
    c.setFont("Times-Roman", 12)
    c.drawString(TEXT_START_X, get_line_y(1), "ERIC BRAKEBILL JONES")
    c.drawString(TEXT_START_X, get_line_y(2), "5634 Noel Drive, Temple City, CA 91780")
    c.drawString(TEXT_START_X, get_line_y(3), "(626) 348-3019 | Objector In Pro Per")

    # 2. COURT TITLE (Centered)
    c.setFont("Times-Bold", 12)
    c.drawCentredString(325, get_line_y(8), "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(325, get_line_y(9), "FOR THE COUNTY OF MONTEREY")

    # 3. CAPTION BOX (The "Cage")
    # Draw ")" down the middle
    for i in range(11, 18): 
        c.drawString(GUTTER_X, get_line_y(i), ")")

    # Left Side (Parties)
    c.setFont("Times-Roman", 12)
    c.drawString(TEXT_START_X, get_line_y(11), "Estate of JUDY BRAKEBILL JONES,")
    c.drawString(TEXT_START_X, get_line_y(12), "Decedent.")

    # Right Side (Case Details)
    c.drawString(GUTTER_X + 15, get_line_y(11), f"Case No.: {CASE_NO}")
    c.setFont("Times-Bold", 12)
    c.drawString(GUTTER_X + 15, get_line_y(12), TITLE)
    c.drawString(GUTTER_X + 15, get_line_y(13), "UNDER RULE 3.7")
    c.setFont("Times-Roman", 12)
    c.drawString(GUTTER_X + 15, get_line_y(14), "(Lawyer as Witness)")
    c.drawString(GUTTER_X + 15, get_line_y(15), "Dept: 13")
    c.drawString(GUTTER_X + 15, get_line_y(16), "Hearing Date: March 4, 2026")
    c.drawString(GUTTER_X + 15, get_line_y(17), "Time: 9:00 AM")

    # 4. CAPTION FLOOR (Locked at Line 17.5)
    c.line(TEXT_START_X, get_line_y(17.5), RIGHT_RAIL_X, get_line_y(17.5))

    # 5. BODY TEXT (With Overflow Logic)
    c.setFont("Times-Roman", 12)
    
    # Payload Text
    payload = [
        "TO ALL PARTIES AND THEIR ATTORNEYS OF RECORD:",
        " ",
        "PLEASE TAKE NOTICE that Objector ERIC BRAKEBILL JONES hereby moves to disqualify ALBERT J. NICORA, ESQ. and NICORA LAW OFFICES, LLP from representing Petitioner HEIDI MARICHEN JONES BLANCHARD in this matter pursuant to California Rule of Professional Conduct 3.7.",
        " ",
        "This motion is based on the grounds that Mr. Nicora is a necessary witness regarding the 'Genetic Marker' admission letter dated June 27, 2025.",
        " ",
        "The admission constitutes dispositive evidence of asset conversion ($10,985.00), creating a conflict of interest that mandates disqualification under Kennedy v. Eldridge (2011)."
    ]

    y_ptr = 19 # Start text at Line 19

    for block in payload:
        lines = textwrap.wrap(block, width=70) # Wrap to stay within rails
        for line in lines:
            # PAGINATION TRIGGER
            if y_ptr > 26: 
                c.drawString(TEXT_START_X, get_line_y(26), "// (Continued on Page 2)")
                c.showPage()
                
                # SETUP PAGE 2
                draw_static_architecture(c, 2, CASE_NO, TITLE)
                y_ptr = 1 # Start at Line 1 on Page 2
                c.setFont("Times-Roman", 12)

            c.drawString(TEXT_START_X, get_line_y(y_ptr), line)
            y_ptr += 1
        y_ptr += 1 # Extra space between paragraphs

    # 6. SIGNATURE BLOCK (Aligned)
    if y_ptr > 24: # Check if room exists
        c.showPage()
        draw_static_architecture(c, 2, CASE_NO, TITLE)
        y_ptr = 1

    y_ptr += 1
    c.drawString(TEXT_START_X, get_line_y(y_ptr), "DATED: January 14, 2026")
    y_ptr += 2
    # Signature Line
    c.line(TEXT_START_X, get_line_y(y_ptr), 350, get_line_y(y_ptr)) 
    c.drawString(TEXT_START_X, get_line_y(y_ptr+1), "ERIC BRAKEBILL JONES")
    c.drawString(TEXT_START_X, get_line_y(y_ptr+2), "Objector In Pro Per")

    c.save()
    print(f"✅ FINAL GOLD ORDNANCE GENERATED: {filename}")

if __name__ == "__main__":
    generate_ordnance()