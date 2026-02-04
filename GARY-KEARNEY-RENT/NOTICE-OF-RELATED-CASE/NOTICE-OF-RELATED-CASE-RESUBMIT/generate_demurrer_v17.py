from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
import os

# --- Configuration ---
OUTPUT_FILENAME = "DEMURRER_FINAL_SEAMLESS.pdf"
DEST_DIR = "/Users/ericjones/Projects/compass-outlaw/GARY-KEARNEY-RENT/NOTICE-OF-RELATED-CASE/NOTICE-OF-RELATED-CASE-RESUBMIT"
FULL_OUTPUT_PATH = os.path.join(DEST_DIR, OUTPUT_FILENAME)

# Geometry - "Golden Grid"
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_TOP = 0.9 * inch  # Locked
MARGIN_BOTTOM = 0.5 * inch # Standard Footer
MARGIN_LEFT = 1.5 * inch
MARGIN_RIGHT = 1 * inch
TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

# The Engine
LINE_HEIGHT = 24.0 # points
Y_START_BASELINE = PAGE_HEIGHT - MARGIN_TOP - 18 # Start baseline for Line 1

FONT_NAME = "Times-Roman"
FONT_SIZE = 12

def get_y(line_number):
    """Returns absolute Y position for the baseline of the given line number."""
    return Y_START_BASELINE - ((line_number - 1) * LINE_HEIGHT)

def draw_grid_background(c, page_idx):
    """Draws the 1-28 line numbers and vertical rails."""
    c.saveState()
    
    # 1. Line Numbers
    c.setFont("Times-Roman", 12)
    for i in range(1, 29):
        y = get_y(i)
        c.drawCentredString(0.8 * inch, y, str(i))
    
    # 2. Left Vertical Rules (Double Line)
    c.setLineWidth(0.5)
    rule_x = 1.3 * inch
    c.line(rule_x - 2, 0, rule_x - 2, PAGE_HEIGHT)
    c.line(rule_x + 2, 0, rule_x + 2, PAGE_HEIGHT)

    # 3. Right Vertical Rail (Single Line) - From v14
    right_rail_x = PAGE_WIDTH - 0.5 * inch
    c.line(right_rail_x, 0, right_rail_x, PAGE_HEIGHT)
    
    # 4. Footer (Standard 0.5 inch)
    c.setFont("Times-Roman", 10)
    footer_y = 0.5 * inch
    c.drawCentredString(PAGE_WIDTH / 2, footer_y, f"DEMURRER TO UNLAWFUL DETAINER | Page {page_idx} of 3")
    
    c.restoreState()

def draw_wrapped_text(c, text, start_line, font=FONT_NAME, size=FONT_SIZE, is_bold=False, is_italic=False, additional_indent=0):
    chosen_font = font
    if is_bold: chosen_font = "Times-Bold"
    if is_italic: chosen_font = "Times-Italic"
    
    c.setFont(chosen_font, size)
    avail_width = TEXT_WIDTH - additional_indent
    lines = simpleSplit(text, chosen_font, size, avail_width)
    
    current_line = start_line
    for l in lines:
        if current_line > 28:
            print(f"WARNING: Text overflow at line {current_line}: {l}")
            break
        y = get_y(current_line)
        c.drawString(MARGIN_LEFT + additional_indent, y, l)
        current_line += 1
        
    return current_line

def draw_manual_rich_line(c, x, line_num, parts):
    """
    Draws a single line composed of parts with different fonts.
    parts = [("Text", "FontName"), ...]
    """
    y = get_y(line_num)
    cur_x = x
    c.setFont("Times-Roman", 12) # Reset default
    for text, font_name in parts:
        if font_name is None: font_name = "Times-Roman"
        c.setFont(font_name, 12)
        c.drawString(cur_x, y, text)
        width = c.stringWidth(text, font_name, 12)
        cur_x += width

def create_demurrer_v17():
    c = canvas.Canvas(FULL_OUTPUT_PATH, pagesize=letter)
    
    # ================= PAGE 1 =================
    draw_grid_background(c, 1)
    
    # Header
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(1), "NUHA SAYEGH")
    c.drawString(MARGIN_LEFT, get_y(2), "5634 Noel Drive")
    c.drawString(MARGIN_LEFT, get_y(3), "Temple City, CA 91780")
    c.drawString(MARGIN_LEFT, get_y(4), "(626) 348-3039")
    c.drawString(MARGIN_LEFT, get_y(5), "Defendant In Pro Per")
    
    # Court
    c.setFont("Times-Bold", 12)
    c.drawCentredString(PAGE_WIDTH/2, get_y(8), "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(PAGE_WIDTH/2, get_y(9), "FOR THE COUNTY OF LOS ANGELES – PASADENA COURTHOUSE")
    
    # --- CAPTION BOX STRUCTURE (v17 SEAMLESS GAP FIX) ---
    c.saveState()
    c.setLineWidth(0.5)
    
    # Coordinates
    top_seal_y = get_y(11) + 10 # Ceiling
    seal_y = get_y(22) + 12     # Floor
    sep_x = 4.5 * inch
    
    # v17 GAP FIX: Snap exactly to vertical rail edge
    # Left rail center is 1.3 * inch. Width is "SetLineWidth=0.5" but line is drawn at specific X.
    # Actually in draw_grid_background, left rails are at 1.3 +/- 2 POINTS.
    # 2 points = 2/72 inch = 0.0277 inch.
    # So rightmost left rail is at 1.3 inch + 2 points.
    left_rail_outer_edge_x = 1.3 * inch + 2 
    right_rail_x = PAGE_WIDTH - 0.5 * inch
    
    # 1. Top Horizontal Line (The Roof)
    c.line(left_rail_outer_edge_x, top_seal_y, right_rail_x, top_seal_y)
    
    # 2. Bottom Horizontal Line (The Floor)
    c.line(left_rail_outer_edge_x, seal_y, right_rail_x, seal_y)
    
    # 3. Vertical Separator
    c.line(sep_x, top_seal_y, sep_x, seal_y)
    
    c.restoreState()
    
    # Left Side Parties
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(11), "GARY W. KEARNEY, an individual,")
    c.drawString(MARGIN_LEFT, get_y(13), "Plaintiff,")
    c.drawString(MARGIN_LEFT, get_y(15), "vs.")
    c.drawString(MARGIN_LEFT, get_y(17), "ERIC BRAKEBILL JONES, et al.,")
    c.drawString(MARGIN_LEFT, get_y(19), "Defendants.")
    
    # Right Side Case Info
    info_x = sep_x + 10
    c.setFont("Times-Bold", 12)
    c.drawString(info_x, get_y(11), "Case No.: 26PDUD00325")
    c.drawString(info_x, get_y(13), "DEMURRER TO COMPLAINT FOR")
    c.drawString(info_x, get_y(14), "UNLAWFUL DETAINER")
    c.drawString(info_x, get_y(15), "[CCP §§ 1170, 430.10(e), 430.10(c)]")
    
    # v17 ALIGN CAPTION FIELDS
    c.setFont("Times-Roman", 12)
    field_value_x = info_x + 0.6 * inch
    
    # Date
    c.drawString(info_x, get_y(17), "Date:")
    c.drawString(field_value_x, get_y(17), "_________________")
    
    # Time
    c.drawString(info_x, get_y(18), "Time:")
    c.drawString(field_value_x, get_y(18), "_________________")
    
    field_value_x_dept = info_x + 0.6 * inch # Same align? "Dept:" is roughly same width as "Date:"
    # Width Check: "Date:" vs "Dept:"
    # Times Roman 12. "Date:" is approx 30 pts. "Dept:" approx 30 pts.
    # 0.6 inch = 43 pts. Plenty of space.
    
    # Dept
    c.drawString(info_x, get_y(19), "Dept:")
    c.drawString(field_value_x, get_y(19), "_________________")
    
    c.drawString(info_x, get_y(20), "Action Filed: January 28, 2026")
    
    # Intro
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(22), "TO PLAINTIFF GARY W. KEARNEY AND TO HIS ATTORNEY OF RECORD:")
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(24), "PLEASE TAKE NOTICE that on the date and time assigned by the Court Clerk in")
    c.drawString(MARGIN_LEFT, get_y(25), "the Department to be assigned, Defendant NUHA SAYEGH (“Defendant”) will, and")
    c.drawString(MARGIN_LEFT, get_y(26), "hereby does, demur to the Complaint for Unlawful Detainer filed by Plaintiff GARY")
    c.drawString(MARGIN_LEFT, get_y(27), "W. KEARNEY (“Plaintiff”).")
    c.drawString(MARGIN_LEFT, get_y(28), "This Demurrer is based on the following grounds pursuant to CCP § 430.10:")
    
    c.showPage()
    
    # ================= PAGE 2 =================
    draw_grid_background(c, 2)
    
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(1), "1. FAILURE TO STATE FACTS SUFFICIENT TO CONSTITUTE A CAUSE OF ACTION")
    c.drawString(MARGIN_LEFT, get_y(2), "(CCP § 430.10(e))")
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(3), "The Complaint fails to state a cause of action for Unlawful Detainer because the")
    
    # Line 4
    draw_manual_rich_line(c, MARGIN_LEFT, 4, [
        ("underlying lease agreement is void ", "Times-Roman"),
        ("ab initio", "Times-Italic"),
        (" as a matter of law. The subject", "Times-Roman")
    ])
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(5), "premises (5634 Noel Drive) is an unpermitted dwelling unit maintained in violation")
    c.drawString(MARGIN_LEFT, get_y(6), "of Temple City Municipal Code (TCMC) density and zoning ordinances. Under")
    
    # Line 7
    draw_manual_rich_line(c, MARGIN_LEFT, 7, [
        ("Espinoza v. Calva", "Times-Italic"),
        (" (2008) 169 Cal.App.4th 1393, a landlord cannot recover", "Times-Roman")
    ])
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(8), "possession or rent based on a lease for an illegal unit. Because the lease is void,")
    c.drawString(MARGIN_LEFT, get_y(9), "the 3-Day Notice to Pay Rent or Quit is fatally defective.")
    
    # Section 2
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(11), "2. ANOTHER ACTION PENDING (CCP § 430.10(c))")
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(12), "There is another action pending between the same parties on the same cause of")
    c.drawString(MARGIN_LEFT, get_y(13), "action. Defendant filed a Verified Complaint for Damages and Rescission against")
    
    # Line 14
    draw_manual_rich_line(c, MARGIN_LEFT, 14, [
        ("Plaintiff on ", "Times-Roman"),
        ("January 21, 2026", "Times-Bold"),
        (" (Case No. ", "Times-Roman"),
        ("26NNCV00412", "Times-Bold"),
        ("), seven days ", "Times-Roman"),
        ("prior", "Times-Italic"),
        (" to the", "Times-Roman"),
    ])
    
    c.drawString(MARGIN_LEFT, get_y(15), "filing of this Unlawful Detainer action. The prior pending action (“The First")
    c.drawString(MARGIN_LEFT, get_y(16), "Action”) challenges the validity of the lease and seeks rescission. The determination")
    c.drawString(MARGIN_LEFT, get_y(17), "of the lease’s validity in the First Action is a prerequisite to any adjudication of")
    c.drawString(MARGIN_LEFT, get_y(18), "possession in this summary proceeding. A \"Notice of Related Case\" linking these")
    c.drawString(MARGIN_LEFT, get_y(19), "matters was filed on February 3, 2026.")
    
    # Prayer
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(21), "PRAYER")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(22), "WHEREFORE, Defendant prays for judgment as follows:")
    
    indent = 0.5 * inch
    c.drawString(MARGIN_LEFT + indent, get_y(23), "1. That this Demurrer be sustained without leave to amend;")
    c.drawString(MARGIN_LEFT + indent, get_y(24), "2. That the Unlawful Detainer Complaint be dismissed with prejudice;")
    c.drawString(MARGIN_LEFT + indent, get_y(25), "3. For costs of suit; and")
    c.drawString(MARGIN_LEFT + indent, get_y(26), "4. For such other and further relief as the Court deems just and proper.")
    
    c.showPage()
    
    # ================= PAGE 3 - SEAMLESS EDITION =================
    draw_grid_background(c, 3)
    
    # --- Top Execution Block (Lines 1-4) ---
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(1), "DATED: February 3, 2026")
    c.drawString(MARGIN_LEFT, get_y(2), "_" * 35)
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(3), "NUHA SAYEGH")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(4), "Defendant in Pro Per")
    
    # Line 5: Header
    c.setFont("Times-Bold", 12)
    c.drawCentredString(PAGE_WIDTH/2, get_y(5), "MEMORANDUM OF POINTS AND AUTHORITIES")
    
    # Line 6: Blank
    
    # Line 7: Intro Header
    c.drawString(MARGIN_LEFT, get_y(7), "I. INTRODUCTION")
    
    # Lines 8-11: Auto-Wrapped Intro
    intro_text = "This retaliatory Unlawful Detainer attempts to enforce a void lease on an illegal dwelling. Defendant previously filed Sayegh v. Kearney (Case No. 26NNCV00412) on January 21, 2026, alleging Fraud and seeking Rescission. Because the First Action challenges the lease's validity and was filed first, this Court must sustain the demurrer."
    
    cursor_line = draw_wrapped_text(c, intro_text, 8, font="Times-Roman")
    # Cursor line is now pointing to the line AFTER text. 
    
    # Ensure next spacer is blank.
    header_ii_line = cursor_line + 1
    
    # Line 13 (approx): Header II
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(header_ii_line), "II. THE LEASE IS VOID AB INITIO (CCP § 430.10(e))")
    
    body_ii_start = header_ii_line + 1
    
    # Lines 14-18 (approx): Body II
    if header_ii_line != 13:
        print(f"NOTE: Intro wrapping shifted layout. Header II at {header_ii_line}")
        
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(body_ii_start), "A contract for an illegal purpose is void (Civil Code § 1598). A lease for a unit that")
    
    # Line 15 (relative)
    draw_manual_rich_line(c, MARGIN_LEFT, body_ii_start + 1, [
        ("violates local zoning or building codes is void and unenforceable (", "Times-Roman"),
        ("Espinoza v.", "Times-Italic")
    ])
    
    # Line 16 (relative)
    draw_manual_rich_line(c, MARGIN_LEFT, body_ii_start + 2, [
        ("Calva", "Times-Italic"),
        ("). Here, the premises violate Temple City Municipal Code regarding density", "Times-Roman")
    ])
    
    c.drawString(MARGIN_LEFT, get_y(body_ii_start + 3), "and mandatory access width. A 3-Day Notice that demands rent for an illegal unit")
    c.drawString(MARGIN_LEFT, get_y(body_ii_start + 4), "is invalid on its face.")
    
    # Spacer
    header_iii_line = body_ii_start + 6 
    
    # Line 20 (approx): Header III
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(header_iii_line), "III. FIRST-IN-TIME PRIORITY (CCP § 430.10(c))")
    
    body_iii_start = header_iii_line + 1
    
    # Lines 21-23 (approx): Body III (3 lines)
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(body_iii_start), "Under CCP § 430.10(c), a party may demur when \"there is another action pending")
    c.drawString(MARGIN_LEFT, get_y(body_iii_start + 1), "between the same parties on the same cause of action.\" The validity of the Lease")
    
    # Line 23 (relative)
    draw_manual_rich_line(c, MARGIN_LEFT, body_iii_start + 2, [
        ("is the subject of the prior pending unlimited civil action (", "Times-Roman"),
        ("Case No. 26NNCV00412", "Times-Italic"),
        (").", "Times-Roman")
    ])
    
    # Line 24: Blank (Implicit)
    
    # --- Bottom Execution Block (25-28) ---
    # FIXED POSITIONS FOR GRID SNAP: 25, 26, 27, 28
    # v17 RELAXED SPACING
    
    # Line 25: Date
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(25), "DATED: February 3, 2026")
    
    # Line 26: Signature Line
    sig_y = get_y(26)
    c.drawString(MARGIN_LEFT, sig_y, "_" * 35)
    
    # Line 27: Name (GRID SNAP - RELAXED -14)
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, sig_y - 14, "NUHA SAYEGH") 
    
    # Line 28: Title (GRID SNAP - RELAXED -26)
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, sig_y - 26, "Defendant in Pro Per") 
    
    c.save()
    print(f"Final Seamless PDF generated at: {FULL_OUTPUT_PATH}")

if __name__ == "__main__":
    create_demurrer_v17()
