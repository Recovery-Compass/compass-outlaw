import io, textwrap, os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER

# --- MASTER PHYSICS ENGINE v7.1 (Source: 00_FORTRESS_PHYSICS_ENGINE_v6.txt) ---
LEADING, LINE_1_Y = 24.0, 720.0
LEFT_RAIL_X, TEXT_START_X = 97.2, 108.0
GUTTER_X, RIGHT_RAIL_X = 300.0, 550.0
# Clerk Void (Stamp Zone): x: 300-612, y: 620-792 | Compliance: CRC 2.111
# ------------------------------------------------------------------------------

def get_line_y(line_num):
    return LINE_1_Y - ((line_num - 1) * LEADING)

def generate_ordnance():
    filename = "/Users/ericjones/AGENCY_FORTRESS/00_IMMEDIATE_ACTION_HOT/EX_PARTE_SAFETY_TORPEDO_v7_3.pdf"
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    c = canvas.Canvas(filename, pagesize=LETTER)
    
    # 1. GRID-LOCK: Shared Baseline numbering (Courier 12pt)
    c.setFont("Courier", 12)
    for i in range(1, 29):
        c.drawRightString(LEFT_RAIL_X - 12, get_line_y(i), str(i))

    # 2. THE RAIL: Double Vertical Rules (CRC 2.111)
    c.setLineWidth(1.0)
    c.line(LEFT_RAIL_X, 50, LEFT_RAIL_X, 760)
    c.line(LEFT_RAIL_X - 6, 50, LEFT_RAIL_X - 6, 760)

    # 3. ATTORNEY BLOCK: Restored Temple City Venue (M-033 Compliance)
    c.setFont("Times-Roman", 12)
    c.drawString(TEXT_START_X, get_line_y(1), "ERIC BRAKEBILL JONES")
    c.drawString(TEXT_START_X, get_line_y(2), "5634 Noel Drive, Temple City, CA 91780")
    c.drawString(TEXT_START_X, get_line_y(3), "(626) 348-3019 | eric@recovery-compass.org")
    c.drawString(TEXT_START_X, get_line_y(4), "Petitioner In Pro Per")

    # 4. THE VOID: Respect Clerk Stamp Zone (Header Strictly Line 8)
    c.setFont("Times-Bold", 12)
    c.drawCentredString(306, get_line_y(8), "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(306, get_line_y(9), "FOR THE COUNTY OF LOS ANGELES")

    # 5. CAPTION RECTIFICATION: Case 25PDFL01441
    for i in range(11, 18): c.drawString(GUTTER_X, get_line_y(i), ")")
    c.setFont("Times-Roman", 12)
    c.drawString(TEXT_START_X, get_line_y(11), "SAYEGH, FAHED vs SAYEGH, NUHA")
    c.drawString(GUTTER_X + 15, get_line_y(11), "Case No.: 25PDFL01441")
    c.setFont("Times-Bold", 12)
    c.drawString(GUTTER_X + 15, get_line_y(12), "EX PARTE APPLICATION FOR EMERGENCY")
    c.drawString(GUTTER_X + 15, get_line_y(13), "CUSTODY AND SAFETY ORDERS")
    c.setFont("Times-Roman", 12)
    c.drawString(GUTTER_X + 15, get_line_y(15), "Dept: L | Judge: Pasadena Courthouse")

    # 6. BODY: Strategic Intel Payload (M-001/M-023 Sanitized)
    payload = [
        "1. EXTRINSIC FRAUD: Respondent committed perjury regarding minor insurance termination (Covered CA Source 561 confirms primary contact).",
        "2. ECONOMIC ABUSE: Respondent produced $11,000 cash in 96 hours while pleading indigency (Artifact A: Zelle/Bank Transfer).",
        "3. STALKING: AirTag metadata confirms electronic stalking in violation of existing protective orders.",
        "4. PHYSICAL SAFETY: Primary witness Mia (13) and Jordan (6) report documented violence and substance abuse (Pills).",
        "// CONTEMPORANEOUS DETAILED NOTES // preserved per PC 632."
    ]
    y_ptr = 19
    for block in payload:
        for line in textwrap.wrap(block, width=75):
            if y_ptr > 28: break
            c.drawString(TEXT_START_X, get_line_y(y_ptr), line)
            y_ptr += 1.5

    # 7. FOOTER: Rule 3.4 / CRC 2.110 Compliance
    c.setLineWidth(1.0)
    c.line(LEFT_RAIL_X, 50, RIGHT_RAIL_X, 50) 
    c.setFont("Times-Roman", 10)
    footer = "Case No: 25PDFL01441 | EX PARTE SAFETY APPLICATION | Page 1 of 1"
    c.drawCentredString(306, 35, footer)

    c.save()
    print(f"✅ ORDNANCE FORGED: {filename}")

if __name__ == "__main__":
    generate_ordnance()
