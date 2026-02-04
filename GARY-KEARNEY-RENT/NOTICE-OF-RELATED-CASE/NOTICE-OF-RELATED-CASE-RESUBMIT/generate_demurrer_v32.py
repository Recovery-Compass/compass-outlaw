from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
import os

# --- Configuration ---
OUTPUT_FILENAME = "DEMURRER_FINAL_CRC_COMPLIANT.pdf"
# Use current directory for portable execution, or update to specific path if needed
DEST_DIR = "/Users/ericjones/Projects/compass-outlaw/GARY-KEARNEY-RENT/NOTICE-OF-RELATED-CASE/NOTICE-OF-RELATED-CASE-RESUBMIT"
FULL_OUTPUT_PATH = os.path.join(DEST_DIR, OUTPUT_FILENAME)

# --- Geometry - "Golden Grid" (CRC Compliant) ---
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_TOP = 0.9 * inch
MARGIN_BOTTOM = 0.5 * inch
MARGIN_LEFT = 1.5 * inch
# FIX 1: Right Margin updated to 0.5 inch to match the visual rail
MARGIN_RIGHT = 0.5 * inch 
TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

# DETERMINISTIC GEOMETRY CONSTANTS
LEFT_RAIL_X = 1.3 * inch + 2
RIGHT_RAIL_X = PAGE_WIDTH - 0.5 * inch
CENTER_SEP_X = 4.5 * inch

# The Engine
LINE_HEIGHT = 24.0
Y_START_BASELINE = PAGE_HEIGHT - MARGIN_TOP - 18

FONT_NAME = "Times-Roman"
FONT_SIZE = 12

def get_y(line_number):
    return Y_START_BASELINE - ((line_number - 1) * LINE_HEIGHT)

def draw_grid_background(c, page_idx):
    c.saveState()
    # Draw Line Numbers
    c.setFont("Times-Roman", 12)
    for i in range(1, 29):
        y = get_y(i)
        c.drawCentredString(0.8 * inch, y, str(i))
    
    # Draw Vertical Rails
    c.setLineWidth(0.5)
    rule_x = 1.3 * inch
    c.line(rule_x - 2, 0, rule_x - 2, PAGE_HEIGHT)
    c.line(rule_x + 2, 0, rule_x + 2, PAGE_HEIGHT)
    c.line(RIGHT_RAIL_X, 0, RIGHT_RAIL_X, PAGE_HEIGHT)
    
    # FIX 2: Draw Footer Divider Line (CRC 2.110 Compliance)
    footer_line_y = MARGIN_BOTTOM + 15
    c.line(MARGIN_LEFT, footer_line_y, PAGE_WIDTH - MARGIN_RIGHT, footer_line_y)
    
    # Draw Footer Text
    c.setFont("Times-Roman", 10)
    footer_y = 0.5 * inch
    c.drawCentredString(PAGE_WIDTH / 2, footer_y, f"DEMURRER TO UNLAWFUL DETAINER | Page {page_idx} of 3")
    c.restoreState()

def draw_manual_rich_line(c, x, line_num, parts):
    """
    Draws a single line of text composed of multiple parts with different fonts.
    parts: list of tuples (text, font_name)
    """
    y = get_y(line_num)
    cur_x = x
    # Baseline font setup
    c.setFont("Times-Roman", 12)
    
    for text, font_name in parts:
        if font_name is None: font_name = "Times-Roman"
        c.setFont(font_name, 12)
        c.drawString(cur_x, y, text)
        width = c.stringWidth(text, font_name, 12)
        cur_x += width

def create_demurrer_v32():
    c = canvas.Canvas(FULL_OUTPUT_PATH, pagesize=letter)
    
    # ================= PAGE 1 =================
    draw_grid_background(c, 1)
    
    # Party Info
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(1), "NUHA SAYEGH")
    c.drawString(MARGIN_LEFT, get_y(2), "5634 Noel Drive")
    c.drawString(MARGIN_LEFT, get_y(3), "Temple City, CA 91780")
    c.drawString(MARGIN_LEFT, get_y(4), "(626) 348-3039")
    c.drawString(MARGIN_LEFT, get_y(5), "Defendant In Pro Per")
    
    # Court Info
    c.setFont("Times-Bold", 12)
    c.drawCentredString(PAGE_WIDTH/2, get_y(8), "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(PAGE_WIDTH/2, get_y(9), "FOR THE COUNTY OF LOS ANGELES – PASADENA COURTHOUSE")
    
    # Caption Box - FIX 3: Extended Geometry
    c.saveState()
    c.setLineWidth(0.5)
    
    CAPTION_TOP_Y = get_y(11) + 10
    CAPTION_BOTTOM_Y = get_y(22.5) # Extended to Line 22.5 to allow body to start on 23
    
    c.line(LEFT_RAIL_X, CAPTION_TOP_Y, RIGHT_RAIL_X, CAPTION_TOP_Y)
    c.line(LEFT_RAIL_X, CAPTION_BOTTOM_Y, RIGHT_RAIL_X, CAPTION_BOTTOM_Y)
    c.line(CENTER_SEP_X, CAPTION_TOP_Y, CENTER_SEP_X, CAPTION_BOTTOM_Y)
    c.restoreState()
    
    # Parties
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(11), "GARY W. KEARNEY, an individual,")
    c.drawString(MARGIN_LEFT, get_y(13), "Plaintiff,")
    c.drawString(MARGIN_LEFT, get_y(15), "vs.")
    c.drawString(MARGIN_LEFT, get_y(17), "ERIC BRAKEBILL JONES, et al.,")
    c.drawString(MARGIN_LEFT, get_y(19), "Defendants.")
    
    # Case Details
    info_x = CENTER_SEP_X + 10
    c.setFont("Times-Bold", 12)
    c.drawString(info_x, get_y(11), "Case No.: 26PDUD00325")
    c.drawString(info_x, get_y(13), "DEMURRER TO COMPLAINT FOR")
    c.drawString(info_x, get_y(14), "UNLAWFUL DETAINER")
    c.drawString(info_x, get_y(15), "[CCP §§ 1170, 430.10(e), 430.10(c)]")
    
    # Vector Fields
    c.setFont("Times-Roman", 12)
    field_value_x = info_x + 0.6 * inch
    field_line_length = 1.5 * inch
    
    def draw_vector_field(label, line_idx):
        y = get_y(line_idx)
        c.drawString(info_x, y, label)
        c.saveState()
        c.setLineWidth(0.5)
        c.line(field_value_x, y - 4, field_value_x + field_line_length, y - 4)
        c.restoreState()

    draw_vector_field("Date:", 17)
    draw_vector_field("Time:", 18)
    draw_vector_field("Dept:", 19)
    c.drawString(info_x, get_y(20), "Action Filed: January 28, 2026")
    
    # FIX 3: Header shifted to Line 23
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(23), "TO PLAINTIFF GARY W. KEARNEY AND TO HIS ATTORNEY OF RECORD:")
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(24), "PLEASE TAKE NOTICE that on the date and time assigned by the Court Clerk in")
    c.drawString(MARGIN_LEFT, get_y(25), 'the Department to be assigned, Defendant NUHA SAYEGH ("Defendant") will, and')
    c.drawString(MARGIN_LEFT, get_y(26), "hereby does, demur to the Complaint for Unlawful Detainer filed by Plaintiff GARY")
    c.drawString(MARGIN_LEFT, get_y(27), 'W. KEARNEY ("Plaintiff").')
    c.drawString(MARGIN_LEFT, get_y(28), "This Demurrer is based on the following grounds pursuant to CCP § 430.10:")
    c.showPage()
    
    # ================= PAGE 2 =================
    draw_grid_background(c, 2)
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(1), "1. FAILURE TO STATE FACTS SUFFICIENT TO CONSTITUTE A CAUSE OF ACTION")
    c.drawString(MARGIN_LEFT, get_y(2), "(CCP § 430.10(e))")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(3), "The Complaint fails to state a cause of action for Unlawful Detainer because the")
    draw_manual_rich_line(c, MARGIN_LEFT, 4, [
        ("underlying lease agreement is void ", "Times-Roman"),
        ("ab initio", "Times-Italic"),
        (" as a matter of law. The subject", "Times-Roman")
    ])
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(5), "premises (5634 Noel Drive) is an unpermitted dwelling unit maintained in violation")
    c.drawString(MARGIN_LEFT, get_y(6), "of Temple City Municipal Code (TCMC) density and zoning ordinances. Under")
    draw_manual_rich_line(c, MARGIN_LEFT, 7, [
        ("Espinoza v. Calva", "Times-Italic"),
        (" (2008) 169 Cal.App.4th 1393, a landlord cannot recover", "Times-Roman")
    ])
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(8), "possession or rent based on a lease for an illegal unit. Because the lease is void,")
    c.drawString(MARGIN_LEFT, get_y(9), "the 3-Day Notice to Pay Rent or Quit is fatally defective.")
    
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(11), "2. ANOTHER ACTION PENDING (CCP § 430.10(c))")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(12), "There is another action pending between the same parties on the same cause of")
    c.drawString(MARGIN_LEFT, get_y(13), "action. Defendant filed a Verified Complaint for Damages and Rescission against")
    
    # Reflow for wider margins (Lines 14-20)
    draw_manual_rich_line(c, MARGIN_LEFT, 14, [
        ("Plaintiff on ", "Times-Roman"),
        ("January 21, 2026", "Times-Bold"),
        (" (Case No. ", "Times-Roman"),
        ("26NNCV00412", "Times-Bold"),
        ("), seven days", "Times-Roman")
    ])
    draw_manual_rich_line(c, MARGIN_LEFT, 15, [
        ("prior", "Times-Italic"),
        (" to the filing of this Unlawful Detainer action. The prior pending action", "Times-Roman")
    ])
    c.drawString(MARGIN_LEFT, get_y(16), '("The First Action") challenges the validity of the lease and seeks')
    c.drawString(MARGIN_LEFT, get_y(17), "rescission. The determination of the lease's validity in the First Action")
    c.drawString(MARGIN_LEFT, get_y(18), "is a prerequisite to any adjudication of possession in this summary")
    c.drawString(MARGIN_LEFT, get_y(19), 'proceeding. A "Notice of Related Case" linking these matters was filed')
    c.drawString(MARGIN_LEFT, get_y(20), "on February 3, 2026.")
    
    # Prayer
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(22), "PRAYER")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(23), "WHEREFORE, Defendant prays for judgment as follows:")
    indent = 0.5 * inch
    c.drawString(MARGIN_LEFT + indent, get_y(24), "1. That this Demurrer be sustained without leave to amend;")
    c.drawString(MARGIN_LEFT + indent, get_y(25), "2. That the Unlawful Detainer Complaint be dismissed with prejudice;")
    c.drawString(MARGIN_LEFT + indent, get_y(26), "3. For costs of suit; and")
    c.drawString(MARGIN_LEFT + indent, get_y(27), "4. For such other and further relief as the Court deems just and proper.")
    c.showPage()
    
    # ================= PAGE 3 - REFLOWED FOR 0.5" MARGIN =================
    draw_grid_background(c, 3)
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(1), "DATED: February 3, 2026")
    
    # Signatures
    sig_line_len = 2.5 * inch
    sig_y_top = get_y(2)
    c.saveState()
    c.setLineWidth(0.5)
    c.line(MARGIN_LEFT, sig_y_top, MARGIN_LEFT + sig_line_len, sig_y_top)
    c.restoreState()
    
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(3), "NUHA SAYEGH")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(4), "Defendant in Pro Per")
    c.setFont("Times-Bold", 12)
    c.drawCentredString(PAGE_WIDTH/2, get_y(5), "MEMORANDUM OF POINTS AND AUTHORITIES")
    
    # Line 6: Blank
    
    c.drawString(MARGIN_LEFT, get_y(7), "I. INTRODUCTION")
    
    # FIX 4: Reflowed Text for Section I (Lines 8-11)
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(8), "This retaliatory Unlawful Detainer attempts to enforce a void lease on an illegal dwelling.")
    draw_manual_rich_line(c, MARGIN_LEFT, 9, [
        ("Defendant previously filed ", "Times-Roman"),
        ("Sayegh v. Kearney", "Times-Italic"),
        (" (Case No. 26NNCV00412) on January", "Times-Roman")
    ])
    c.drawString(MARGIN_LEFT, get_y(10), "21, 2026, alleging Fraud and seeking Rescission. Because the First Action challenges the")
    c.drawString(MARGIN_LEFT, get_y(11), "lease's validity and was filed first, this Court must sustain the demurrer.")
    
    # Line 12: Now Blank (Gained Space!)
    
    # SECTION II: Moved UP to Line 13
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(13), "II. THE LEASE IS VOID AB INITIO (CCP § 430.10(e))")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(14), "A contract for an illegal purpose is void (Civil Code § 1598). A lease for a unit")
    draw_manual_rich_line(c, MARGIN_LEFT, 15, [
        ("that violates local zoning or building codes is void and unenforceable (", "Times-Roman"),
        ("Espinoza", "Times-Italic")
    ])
    draw_manual_rich_line(c, MARGIN_LEFT, 16, [
        ("v. Calva", "Times-Italic"),
        ("). Here, the premises violate Temple City Municipal Code regarding", "Times-Roman")
    ])
    c.drawString(MARGIN_LEFT, get_y(17), "density and mandatory access width. A 3-Day Notice that demands rent for an")
    c.drawString(MARGIN_LEFT, get_y(18), "illegal unit is invalid on its face.")
    
    # Line 19: Blank (Spacer)
    
    # SECTION III: Lines 20-22
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(20), "III. FIRST-IN-TIME PRIORITY (CCP § 430.10(c))")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(21), "Under CCP § 430.10(c), grounds for demurrer exist when another action is pending.")
    c.drawString(MARGIN_LEFT, get_y(22), "The Lease's validity is decided in the prior civil action (Case No. 26NNCV00412).")
    
    # Line 23: Blank (Spacer)
    
    # BOTTOM EXECUTION BLOCK: Moved Up
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(25), "DATED: February 3, 2026")
    sig_y = get_y(26)
    c.saveState()
    c.setLineWidth(0.5)
    c.line(MARGIN_LEFT, sig_y, MARGIN_LEFT + sig_line_len, sig_y)
    c.restoreState()
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(27), "NUHA SAYEGH")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(28), "Defendant in Pro Per")
    
    c.save()
    print(f"Final CRC Compliant PDF generated at: {FULL_OUTPUT_PATH}")

if __name__ == "__main__":
    create_demurrer_v32()
