#!/usr/bin/env python3
"""
CM-015 ASSEMBLY SCRIPT v5.0 - THE ISOMORPHIC WARHEAD
=====================================================
Final Ballistic Optimization with:
- Date Lock (prevents UTC timezone trap)
- Dynamic Sizing (detects actual PDF dimensions)
- Global Shift (single-point adjustment for drift)
"""
import io
import datetime
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# --- 1. DEPENDENCY SAFEGUARD ---
try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    try:
        from PyPDF2 import PdfReader, PdfWriter
    except ImportError:
        print("CRITICAL ERROR: Install pypdf -> 'pip install pypdf'")
        exit()

# ==============================================================================
#   MISSION CONFIGURATION
# ==============================================================================

# 1. DATE LOCK: Prevents UTC server time (12/18) from ruining your 12/17 filing.
FILING_DATE = "12/17/2025"

# 2. GLOBAL OFFSET (The "Nudge" Factor)
# If the entire page is shifted, change these instead of editing 15 variables.
GLOBAL_X = 0
GLOBAL_Y = 0

# 3. TARGETING COORDINATES (Valid based on Forensic Audit)
HEADER_X = 47
HEADER_Y_START = 675   # Dropped to clear labels
COURT_Y_START = 580
PLAINTIFF_Y = 530
DEFENDANT_Y = 485

# CHECKBOXES
BOX_1C_X = 85          # 1.c "Same as above"
BOX_1C_Y = 422
DEPT_L_X = 160         # 1.d "Dept L"
DEPT_L_Y = 392
BOX_1E_FAM_X = 280     # 1.e "Family Law"
BOX_1E_FAM_Y = 378
BOX_1H_2_X = 50        # 1.h Box 2 "Arises from..."
BOX_1H_2_Y = 305

# SIGNATURES
SIG_DATE_Y = 120
SIG_NAME_Y = 100

# FILES
INPUT_FILE = "CM-015_BLANK_DEEP_THINK.pdf"
OUTPUT_FILE = "CM-015_ATTEMPT_16_FINAL.pdf"
GRID_FILE = "CM-015_DIAGNOSTIC_GRID.pdf"

# ==============================================================================
#   TACTICAL BUILDER
# ==============================================================================

def draw_grid(c, width, height):
    """Draws a laser grid with crosshairs for coordinate extraction."""
    c.setStrokeColor(colors.red)
    c.setFillColor(colors.red)
    c.setFont("Helvetica", 6)
    c.setLineWidth(0.25)

    # Grid Lines
    for x in range(0, int(width), 25):
        c.line(x, 0, x, height)
        if x % 50 == 0:
            c.drawString(x+2, 10, str(x)); c.drawString(x+2, height-20, str(x))
    for y in range(0, int(height), 25):
        c.line(0, y, width, y)
        if y % 50 == 0:
            c.drawString(10, y+2, str(y)); c.drawString(width-30, y+2, str(y))

    # Targets (Blue Crosshairs)
    c.setStrokeColor(colors.blue)
    c.setFillColor(colors.blue)
    targets = [
        (HEADER_X, HEADER_Y_START, "HEAD"), (BOX_1C_X, BOX_1C_Y, "1.c"),
        (BOX_1E_FAM_X, BOX_1E_FAM_Y, "1.e"), (BOX_1H_2_X, BOX_1H_2_Y, "1.h")
    ]
    for tx, ty, label in targets:
        fx, fy = tx + GLOBAL_X, ty + GLOBAL_Y
        c.circle(fx, fy, 2, fill=0) # Circle
        c.line(fx-5, fy, fx+5, fy)  # Horizontal Cross
        c.line(fx, fy-5, fx, fy+5)  # Vertical Cross
        c.drawString(fx+5, fy+5, label)

def create_overlay(width, height, diagnostic_mode=False):
    packet = io.BytesIO()
    # DYNAMIC SIZING: Matches input PDF dimensions exactly
    can = canvas.Canvas(packet, pagesize=(width, height))

    # Apply Global Shift
    can.translate(GLOBAL_X, GLOBAL_Y)

    if diagnostic_mode:
        draw_grid(can, width, height)

    can.setFont("Helvetica", 10)
    can.setFillColor(colors.black)

    # --- PAGE 1 ---
    # Header
    can.drawString(HEADER_X, HEADER_Y_START, "ERIC BRAKEBILL JONES")
    can.drawString(HEADER_X, HEADER_Y_START - 12, "5634 Noel Drive")
    can.drawString(HEADER_X, HEADER_Y_START - 24, "Temple City, CA 91780")
    can.drawString(HEADER_X, HEADER_Y_START - 36, "Tel: (626) 348-3019")
    can.drawString(HEADER_X, HEADER_Y_START - 48, "Email: eric@recovery-compass.org")

    # Court
    can.drawString(HEADER_X, COURT_Y_START, "Superior Court of California, County of Los Angeles")
    can.drawString(HEADER_X, COURT_Y_START - 12, "300 East Walnut St.")
    can.drawString(HEADER_X, COURT_Y_START - 24, "Pasadena, CA 91101")
    can.drawString(HEADER_X, COURT_Y_START - 36, "Pasadena Courthouse")

    # Caption
    can.drawString(HEADER_X, PLAINTIFF_Y, "ERIC BRAKEBILL JONES")
    can.drawString(HEADER_X, DEFENDANT_Y, "MARGIE SAYEGH")
    can.drawString(350, PLAINTIFF_Y, "PENDING")

    # Section 1
    can.drawString(70, 460, "Sayegh v. Sayegh")
    can.drawString(140, 442, "25PDFL01441")
    can.drawString(BOX_1C_X, BOX_1C_Y, "X")
    can.drawString(DEPT_L_X, DEPT_L_Y, "L")
    can.drawString(BOX_1E_FAM_X, BOX_1E_FAM_Y, "X")
    can.drawString(BOX_1H_2_X, BOX_1H_2_Y, "X")

    can.showPage()

    # --- PAGE 2 ---
    if diagnostic_mode:
        # Reset translate for grid on new page if needed, or keep it.
        # Canvas state usually resets on showPage, so we re-apply translate.
        can.translate(GLOBAL_X, GLOBAL_Y)
        draw_grid(can, width, height)
    else:
        can.translate(GLOBAL_X, GLOBAL_Y)

    can.setFont("Helvetica", 10)
    can.drawString(HEADER_X, 750, "ERIC BRAKEBILL JONES")
    can.drawString(HEADER_X, 725, "MARGIE SAYEGH")
    can.drawString(350, 750, "PENDING")

    # Signatures
    can.drawString(80, SIG_DATE_Y, FILING_DATE) # Uses Locked Date
    can.drawString(80, SIG_NAME_Y, "ERIC BRAKEBILL JONES")
    can.drawString(350, SIG_NAME_Y, "/s/ Eric Brakebill Jones")

    can.showPage()

    # --- PAGE 3 ---
    can.translate(GLOBAL_X, GLOBAL_Y)
    can.setFont("Helvetica", 10)
    can.drawString(HEADER_X, 750, "ERIC BRAKEBILL JONES")
    can.save()
    packet.seek(0)
    return packet

def assemble(output_filename, diagnostic_mode=False):
    try:
        existing_pdf = PdfReader(open(INPUT_FILE, "rb"))
    except FileNotFoundError:
        print(f"CRITICAL ERROR: {INPUT_FILE} not found. Upload it first.")
        return

    # DETECT GEOMETRY (Robust Method)
    first_page = existing_pdf.pages[0]
    # Handle pypdf vs PyPDF2 attribute naming chaos
    mbox = getattr(first_page, 'mediabox', getattr(first_page, 'mediaBox', None))

    if mbox:
        page_width = float(mbox.width)
        page_height = float(mbox.height)
    else:
        page_width, page_height = 612.0, 792.0 # Fallback

    print(f"Detected PDF Geometry: {page_width}x{page_height}")

    output = PdfWriter()
    overlay_packet = create_overlay(page_width, page_height, diagnostic_mode)
    overlay_pdf = PdfReader(overlay_packet)

    for i in range(len(existing_pdf.pages)):
        page = existing_pdf.pages[i]
        if i < len(overlay_pdf.pages):
            page.merge_page(overlay_pdf.pages[i])
        output.add_page(page)

    with open(output_filename, "wb") as f:
        output.write(f)
    print(f"SUCCESS: Generated {output_filename}")

if __name__ == "__main__":
    print("--- INITIATING DUAL-MODE PROTOCOL v5.0 ---")
    assemble(OUTPUT_FILE, diagnostic_mode=False)
    assemble(GRID_FILE, diagnostic_mode=True)
    print("--- OPERATIONS COMPLETE ---")
