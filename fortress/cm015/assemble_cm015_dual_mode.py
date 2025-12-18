#!/usr/bin/env python3
"""
CM-015 DUAL-MODE ASSEMBLY SCRIPT
================================
Tactical Resolution Protocol for Ghost Offset Calibration

Generates TWO files:
1. CM-015_ATTEMPT_16.pdf - High-probability fix with calibrated coordinates
2. CM-015_DIAGNOSTIC_GRID.pdf - Laser grid map for manual measurement
"""

import io
import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

# --- DEPENDENCY CHECK ---
try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    try:
        from PyPDF2 import PdfReader, PdfWriter
    except ImportError:
        print("CRITICAL: Install pypdf or PyPDF2")
        exit()

# ==============================================================================
#   TARGETING CONFIGURATION (CALIBRATED FROM FAILURE 15)
# ==============================================================================

# 1. HEADER (Plaintiff Info)
# Forensic Adj: Dropped to 675. (710 was too high/collided).
HEADER_X = 47
HEADER_Y_START = 675

# 2. COURT BLOCK
# Forensic Adj: Dropped to 580 to match header shift.
COURT_Y_START = 580

# 3. CASE CAPTION
PLAINTIFF_Y = 530
DEFENDANT_Y = 485

# 4. CHECKBOX TARGETS (THE KILL ZONES)

# Section 1.c "Same as above"
# Forensic Adj: Shifted LEFT to 85. (User said 125 missed, 95 missed).
# We are aiming for the "Gutter" next to the margin.
BOX_1C_X = 85
BOX_1C_Y = 422

# Section 1.d Department "L"
# Moved Right to 160 to clear text label.
DEPT_L_X = 160
DEPT_L_Y = 392

# Section 1.e Case Type "Family Law"
# Forensic Adj: Shifted LEFT to 280. (User said 340 hit 'Other').
# "Other" is the 5th box. "Family Law" is the 4th. Standard gap is ~60pts.
# 340 - 60 = 280.
BOX_1E_FAM_X = 280
BOX_1E_FAM_Y = 378

# Section 1.h Relationship (Box 2: "Arises from...")
# Forensic Adj: Shifted LEFT to 50. (User said 72 hit text).
# We need to be left of the text.
BOX_1H_2_X = 50
BOX_1H_2_Y = 305

# 5. SIGNATURES (Page 2)
# Raised to 120 for safety.
SIG_DATE_Y = 120
SIG_NAME_Y = 100

# FILES
INPUT_FILE = "CM-015_BLANK_DEEP_THINK.pdf"
OUTPUT_FILE = "CM-015_ATTEMPT_16.pdf"
GRID_FILE = "CM-015_DIAGNOSTIC_GRID.pdf"

def draw_grid(c):
    """Draws a red diagnostic ruler for manual measurement."""
    c.setStrokeColor(colors.red)
    c.setFillColor(colors.red)
    c.setFont("Helvetica", 6)
    c.setLineWidth(0.25)

    # Vertical Lines (X) every 25pts
    for x in range(0, 650, 25):
        c.line(x, 0, x, 800)
        if x % 50 == 0:
            c.drawString(x+2, 10, str(x))
            c.drawString(x+2, 780, str(x))

    # Horizontal Lines (Y) every 25pts
    for y in range(0, 850, 25):
        c.line(0, y, 650, y)
        if y % 50 == 0:
            c.drawString(10, y+2, str(y))
            c.drawString(600, y+2, str(y))

    # Plot Target Dots (Blue)
    targets = [
        (HEADER_X, HEADER_Y_START, "HEAD"),
        (BOX_1C_X, BOX_1C_Y, "1.c"),
        (BOX_1E_FAM_X, BOX_1E_FAM_Y, "1.e"),
        (BOX_1H_2_X, BOX_1H_2_Y, "1.h"),
    ]
    c.setFillColor(colors.blue)
    for tx, ty, label in targets:
        c.circle(tx, ty, 3, fill=1)
        c.drawString(tx+5, ty, label)

def create_overlay(diagnostic_mode=False):
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)

    if diagnostic_mode:
        draw_grid(can)

    # --- CONTENT RENDER ---
    can.setFont("Helvetica", 10)
    can.setFillColor(colors.black)

    # 1. HEADER
    can.drawString(HEADER_X, HEADER_Y_START, "ERIC BRAKEBILL JONES")
    can.drawString(HEADER_X, HEADER_Y_START - 12, "5634 Noel Drive")
    can.drawString(HEADER_X, HEADER_Y_START - 24, "Temple City, CA 91780")
    can.drawString(HEADER_X, HEADER_Y_START - 36, "Tel: (626) 348-3019")
    can.drawString(HEADER_X, HEADER_Y_START - 48, "Email: eric@recovery-compass.org")

    # 2. COURT INFO
    can.drawString(HEADER_X, COURT_Y_START, "Superior Court of California, County of Los Angeles")
    can.drawString(HEADER_X, COURT_Y_START - 12, "300 East Walnut St.")
    can.drawString(HEADER_X, COURT_Y_START - 24, "Pasadena, CA 91101")
    can.drawString(HEADER_X, COURT_Y_START - 36, "Pasadena Courthouse")

    # 3. CASE CAPTION
    can.drawString(HEADER_X, PLAINTIFF_Y, "ERIC BRAKEBILL JONES")
    can.drawString(HEADER_X, DEFENDANT_Y, "MARGIE SAYEGH")
    can.drawString(350, PLAINTIFF_Y, "PENDING")

    # 4. SECTION 1
    can.drawString(70, 460, "Sayegh v. Sayegh")
    can.drawString(140, 442, "25PDFL01441")

    # Checkboxes
    can.drawString(BOX_1C_X, BOX_1C_Y, "X")         # 1.c Same as above
    can.drawString(DEPT_L_X, DEPT_L_Y, "L")         # 1.d Dept
    can.drawString(BOX_1E_FAM_X, BOX_1E_FAM_Y, "X") # 1.e Family Law
    can.drawString(BOX_1H_2_X, BOX_1H_2_Y, "X")     # 1.h Box 2

    can.showPage() # End Page 1

    # --- PAGE 2 ---
    if diagnostic_mode:
        draw_grid(can) # Draw grid on page 2 as well

    can.setFont("Helvetica", 10)
    can.drawString(HEADER_X, 750, "ERIC BRAKEBILL JONES")
    can.drawString(HEADER_X, 725, "MARGIE SAYEGH")
    can.drawString(350, 750, "PENDING")

    today_str = datetime.datetime.now().strftime("%m/%d/%Y")
    can.drawString(80, SIG_DATE_Y, today_str)
    can.drawString(80, SIG_NAME_Y, "ERIC BRAKEBILL JONES")
    can.drawString(350, SIG_NAME_Y, "/s/ Eric Brakebill Jones")

    can.showPage() # End Page 2

    # --- PAGE 3 ---
    can.setFont("Helvetica", 10)
    can.drawString(HEADER_X, 750, "ERIC BRAKEBILL JONES")
    can.save()

    packet.seek(0)
    return packet

def assemble(output_filename, diagnostic_mode=False):
    try:
        existing_pdf = PdfReader(open(INPUT_FILE, "rb"))
    except FileNotFoundError:
        print(f"ERROR: {INPUT_FILE} not found. Ensure it is in the directory.")
        return

    output = PdfWriter()
    overlay_pdf = PdfReader(create_overlay(diagnostic_mode))

    for i in range(len(existing_pdf.pages)):
        page = existing_pdf.pages[i]
        if i < len(overlay_pdf.pages):
            page.merge_page(overlay_pdf.pages[i])
        output.add_page(page)

    with open(output_filename, "wb") as f:
        output.write(f)
    print(f"GENERATED: {output_filename}")

if __name__ == "__main__":
    print("--- STARTING DUAL-MODE GENERATION ---")
    # 1. Generate the Best-Guess Fix
    assemble(OUTPUT_FILE, diagnostic_mode=False)
    # 2. Generate the Diagnostic Map
    assemble(GRID_FILE, diagnostic_mode=True)
    print("--- MISSION COMPLETE ---")
    print(f"1. Check {OUTPUT_FILE} first.")
    print(f"2. If still misaligned, open {GRID_FILE}, read the red grid lines, and update the variables.")
