from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# --- Configuration ---
OUTPUT_FILENAME = "DEMURRER_TO_COMPLAINT_SAYEGH.pdf"
DEST_DIR = "/Users/ericjones/Projects/compass-outlaw/GARY-KEARNEY-RENT/NOTICE-OF-RELATED-CASE/NOTICE-OF-RELATED-CASE-RESUBMIT"
FULL_OUTPUT_PATH = os.path.join(DEST_DIR, OUTPUT_FILENAME)

# Geometry - "Golden Grid"
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_TOP = 1 * inch
MARGIN_BOTTOM = 1 * inch
MARGIN_LEFT = 1.5 * inch  # Text starts here
MARGIN_RIGHT = 1 * inch

VERTICAL_RULE_X = 1.3 * inch # Double line position
LINE_NUMBERS_X = 0.8 * inch # Center of numbers

NUM_LINES = 28
# Calculate leading to fit exactly 28 lines between top and bottom margins (11" - 2" = 9")
# 9 inches = 648 points. 648 / 28 lines = 23.1428... points
LEADING = (PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM) / NUM_LINES
FONT_SIZE = 12
FONT_NAME = "Times-Roman" # Built-in, close enough to Times New Roman for standard verification if font file not present.
# Ideally would load a TTF if exact match needed, but Times-Roman is standard PDF font.

def draw_pleading_background(c):
    """Draws the line numbers and vertical rules."""
    c.saveState()
    
    # 1. Line Numbers (1 to 28)
    c.setFont("Times-Roman", 12)
    current_y = PAGE_HEIGHT - MARGIN_TOP - LEADING # First line is effectively below the margin top? 
    # Usually Line 1 text baseline sits at (PageTop - MarginTop - some_offset).
    # California Rules imply text matches line numbers.
    # Let's align Line 1 baseline to be `PAGE_HEIGHT - MARGIN_TOP - (LEADING * 0.7)` or similar so it sits in the "slot".
    # Wait, simple pleading paper: Line 1 number is at a specific Y. Text on Line 1 is at that same Y.
    # We will define Line 1 Y as `PAGE_HEIGHT - MARGIN_TOP - LEADING + (Adjustment for baseline)`.
    # Actually, simpler: Use exact spacing.
    
    # Let's define the Y position for the BASELINE of line 1.
    # If the printable area starts at MARGIN_TOP, Line 1 usually occupies the first slot.
    # Let's assume the baseline of Line 1 is at `PAGE_HEIGHT - MARGIN_TOP - (LEADING * 0.8)`. 
    # Just need ensuring 28 lines fit.
    
    start_y = PAGE_HEIGHT - MARGIN_TOP
    
    for i in range(1, NUM_LINES + 1):
        # Y position for this line (baseline approx)
        # We step down by LEADING.
        # But we need to center the number vertically within the "slot" or align with text baseline.
        # Standard: Align with text baseline.
        # Let's say baseline is 2/3 down the slot.
        y_pos = start_y - (i * LEADING) + (LEADING * 0.25) # Nudge to align
        
        c.drawCentredString(LINE_NUMBERS_X, y_pos, str(i))
    
    # 2. Vertical Rules
    c.setLineWidth(0.5)
    # Double line at 1.3 inch
    c.line(VERTICAL_RULE_X - 2, MARGIN_BOTTOM, VERTICAL_RULE_X - 2, PAGE_HEIGHT - MARGIN_TOP)
    c.line(VERTICAL_RULE_X + 2, MARGIN_BOTTOM, VERTICAL_RULE_X + 2, PAGE_HEIGHT - MARGIN_TOP)
    
    # Single right line (optional but common, usually at right margin)
    # User didn't ask for right line, only "Double line (or single thick) at 1.5 inches from left" (Section I)
    # Section III said "Vertical Rule... at exactly 1.3". We follow Section III.
    
    # 3. Footer
    c.setFont("Times-Roman", 10) # Smaller for footer? User didn't specify size, usually 9-10.
    c.drawCentredString(PAGE_WIDTH / 2, MARGIN_BOTTOM / 2, f"DEMURRER TO UNLAWFUL DETAINER | Page {c.getPageNumber()} of 3")
    
    c.restoreState()

def get_y_for_line(line_num):
    """Returns the y-coordinate for the baseline of the specified line number."""
    start_y = PAGE_HEIGHT - MARGIN_TOP
    # Matches the logic in draw_pleading_background
    return start_y - (line_num * LEADING) + (LEADING * 0.25)

def draw_text(c, x, line_num, text, alignment='left', font=FONT_NAME, size=FONT_SIZE):
    c.setFont(font, size)
    y = get_y_for_line(line_num)
    if alignment == 'left':
        c.drawString(x, y, text)
    elif alignment == 'center':
        c.drawCentredString(x, y, text)
    elif alignment == 'right':
        c.drawRightString(x, y, text)

def create_pdf():
    # Ensure directory exists
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    c = canvas.Canvas(FULL_OUTPUT_PATH, pagesize=letter)
    
    # ================= PAGE 1 =================
    draw_pleading_background(c)
    
    # Header Info
    x_text = MARGIN_LEFT
    draw_text(c, x_text, 1, "NUHA SAYEGH")
    draw_text(c, x_text, 2, "5634 Noel Drive")
    draw_text(c, x_text, 3, "Temple City, CA 91780")
    draw_text(c, x_text, 4, "(626) 348-3039")
    draw_text(c, x_text, 5, "Defendant In Pro Per")
    
    # Court Title
    draw_text(c, PAGE_WIDTH / 2, 8, "SUPERIOR COURT OF THE STATE OF CALIFORNIA", alignment='center', font="Times-Bold")
    draw_text(c, PAGE_WIDTH / 2, 9, "FOR THE COUNTY OF LOS ANGELES – PASADENA COURTHOUSE", alignment='center', font="Times-Bold")
    
    # Caption Box
    # Left Side
    cap_center_x = (MARGIN_LEFT + PAGE_WIDTH - MARGIN_RIGHT) / 2
    # Usually there's a box or just split text. User description suggests split layout.
    # We will approximate a center split column around `cap_center_x`.
    
    left_col_x = MARGIN_LEFT
    right_col_x = cap_center_x + 10 # Padding
    
    # Vertical divider for caption (implied by "Box")? User didn't explicitly ask for lines drawn, but standard is ")"
    # or a line. User says "Caption Box... Split layout".
    # I will stick to text placement primarily. I'll draw the standard closing parenthesis structure if space permits, 
    # but the prompt focuses on text mapping.
    
    draw_text(c, left_col_x, 11, "GARY W. KEARNEY, an individual,")
    draw_text(c, left_col_x, 13, "Plaintiff,")
    draw_text(c, left_col_x, 15, "vs.")
    draw_text(c, left_col_x, 17, "NUHA SAYEGH, et al.,")
    draw_text(c, left_col_x, 19, "Defendants.")
    
    # Right Side
    # Line 11: Case No
    draw_text(c, right_col_x, 11, "Case No.: 26PDUD00325", font="Times-Bold")
    draw_text(c, right_col_x, 13, "DEMURRER TO COMPLAINT FOR", font="Times-Bold")
    draw_text(c, right_col_x, 14, "UNLAWFUL DETAINER", font="Times-Bold")
    draw_text(c, right_col_x, 15, "[CCP §§ 1170, 430.10(e), 430.10(c)]", font="Times-Bold")
    
    draw_text(c, right_col_x, 17, "Date: [Leave Blank]")
    draw_text(c, right_col_x, 18, "Time: [Leave Blank]")
    draw_text(c, right_col_x, 19, "Dept: [Leave Blank]")
    draw_text(c, right_col_x, 20, "Action Filed: January 28, 2026")
    
    # Body
    # Line 22
    draw_text(c, MARGIN_LEFT, 22, "TO PLAINTIFF GARY W. KEARNEY AND TO HIS ATTORNEY OF RECORD:", font="Times-Bold")
    
    # Lines 24-28 (Paragraphs)
    # We need to wrap text or place line by line.
    # The user provided line-by-line breakdown in Section II, I will follow that EXACTLY.
    
    draw_text(c, MARGIN_LEFT, 24, "PLEASE TAKE NOTICE that on the date and time assigned by the Court Clerk in")
    draw_text(c, MARGIN_LEFT, 25, "the Department to be assigned, Defendant NUHA SAYEGH (“Defendant”) will, and")
    draw_text(c, MARGIN_LEFT, 26, "hereby does, demur to the Complaint for Unlawful Detainer filed by Plaintiff GARY")
    draw_text(c, MARGIN_LEFT, 27, "W. KEARNEY (“Plaintiff”).")
    draw_text(c, MARGIN_LEFT, 28, "This Demurrer is based on the following grounds pursuant to CCP § 430.10:")
    
    c.showPage()
    
    # ================= PAGE 2 =================
    draw_pleading_background(c)
    
    # Section 1
    draw_text(c, MARGIN_LEFT, 1, "1. FAILURE TO STATE FACTS SUFFICIENT TO CONSTITUTE A CAUSE OF ACTION", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 2, "(CCP § 430.10(e))", font="Times-Bold") # Indent? User map shows left align.
    
    draw_text(c, MARGIN_LEFT, 3, "The Complaint fails to state a cause of action for Unlawful Detainer because the")
    
    # Line 4: "underlying lease agreement is void ab initio as a matter of law. The subject"
    # "ab initio" italicized
    y_4 = get_y_for_line(4)
    text_obj = c.beginText(MARGIN_LEFT, y_4)
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("underlying lease agreement is void ")
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("ab initio")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut(" as a matter of law. The subject")
    c.drawText(text_obj)
    
    draw_text(c, MARGIN_LEFT, 5, "premises (5634 Noel Drive) is an unpermitted dwelling unit maintained in violation")
    draw_text(c, MARGIN_LEFT, 6, "of Temple City Municipal Code (TCMC) density and zoning ordinances. Under")
    
    # Line 7: Espinoza v. Calva italics
    y_7 = get_y_for_line(7)
    text_obj = c.beginText(MARGIN_LEFT, y_7)
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("Espinoza v. Calva")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut(" (2008) 169 Cal.App.4th 1393, a landlord cannot recover")
    c.drawText(text_obj)
    
    draw_text(c, MARGIN_LEFT, 8, "possession or rent based on a lease for an illegal unit. Because the lease is void,")
    draw_text(c, MARGIN_LEFT, 9, "the 3-Day Notice to Pay Rent or Quit is fatally defective.")
    
    # Section 2
    draw_text(c, MARGIN_LEFT, 11, "2. ANOTHER ACTION PENDING (CCP § 430.10(c))", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 12, "There is another action pending between the same parties on the same cause of")
    draw_text(c, MARGIN_LEFT, 13, "action. Defendant filed a Verified Complaint for Damages and Rescission against")
    draw_text(c, MARGIN_LEFT, 14, "Plaintiff on January 21, 2026 (Case No. 26NNCV00412), seven days prior to the") # Bolded parts handled by simple text for now, user prompt simplified "copy/paste generated text" usually implies formatting but simple string for basic.
    # Wait, user prompt in Section II has bolding: "January 21, 2026", "26NNCV00412". "prior" is italic.
    # I should be thorough.
    
    y_14 = get_y_for_line(14)
    text_obj = c.beginText(MARGIN_LEFT, y_14)
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("Plaintiff on ")
    text_obj.setFont("Times-Bold", 12)
    text_obj.textOut("January 21, 2026")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut(" (Case No. ")
    text_obj.setFont("Times-Bold", 12)
    text_obj.textOut("26NNCV00412")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("), seven days ")
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("prior")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut(" to the")
    c.drawText(text_obj)

    draw_text(c, MARGIN_LEFT, 15, "filing of this Unlawful Detainer action. The prior pending action (“The First")
    draw_text(c, MARGIN_LEFT, 16, "Action”) challenges the validity of the lease and seeks rescission. The determination")
    draw_text(c, MARGIN_LEFT, 17, "of the lease’s validity in the First Action is a prerequisite to any adjudication of")
    draw_text(c, MARGIN_LEFT, 18, "possession in this summary proceeding. A \"Notice of Related Case\" linking these")
    draw_text(c, MARGIN_LEFT, 19, "matters was filed on February 3, 2026.")
    
    # Prayer
    draw_text(c, MARGIN_LEFT, 21, "PRAYER", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 22, "WHEREFORE, Defendant prays for judgment as follows:")
    draw_text(c, MARGIN_LEFT + 0.25*inch, 23, "1. That this Demurrer be sustained without leave to amend;")
    draw_text(c, MARGIN_LEFT + 0.25*inch, 24, "2. That the Unlawful Detainer Complaint be dismissed with prejudice;")
    draw_text(c, MARGIN_LEFT + 0.25*inch, 25, "3. For costs of suit; and")
    draw_text(c, MARGIN_LEFT + 0.25*inch, 26, "4. For such other and further relief as the Court deems just and proper.")
    
    draw_text(c, MARGIN_LEFT, 28, "DATED: February 3, 2026")
    
    c.showPage()
    
    # ================= PAGE 3 =================
    draw_pleading_background(c)
    
    draw_text(c, MARGIN_LEFT, 1, "_" * 35)
    draw_text(c, MARGIN_LEFT, 2, "NUHA SAYEGH", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 3, "Defendant in Pro Per")
    
    draw_text(c, PAGE_WIDTH / 2, 5, "MEMORANDUM OF POINTS AND AUTHORITIES", alignment='center', font="Times-Bold")
    
    draw_text(c, MARGIN_LEFT, 7, "I. INTRODUCTION", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 8, "This Unlawful Detainer action is a retaliatory attempt to enforce a void lease on an")
    draw_text(c, MARGIN_LEFT, 9, "illegal dwelling. Plaintiff filed this action on January 28, 2026. However, Defendant")
    draw_text(c, MARGIN_LEFT, 10, "had already filed a unlimited civil action against Plaintiff on January 21, 2026")
    
    # Line 11: italics Sayegh v. Kearney
    y_11 = get_y_for_line(11)
    text_obj = c.beginText(MARGIN_LEFT, y_11)
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("(")
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("Sayegh v. Kearney")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut(", Case No. 26NNCV00412), alleging Fraud and seeking")
    c.drawText(text_obj)
    
    draw_text(c, MARGIN_LEFT, 12, "Rescission. Because the First Action challenges the existence of the landlord-tenant")
    draw_text(c, MARGIN_LEFT, 13, "relationship and was filed first, this Court should sustain the demurrer.")
    
    draw_text(c, MARGIN_LEFT, 15, "II. THE LEASE IS VOID AB INITIO (CCP § 430.10(e))", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 16, "A contract for an illegal purpose is void (Civil Code § 1598). A lease for a unit that")
    # Line 17: Espinoza v. NO, Espinoza v. (italics)
    y_17 = get_y_for_line(17)
    text_obj = c.beginText(MARGIN_LEFT, y_17)
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("violates local zoning or building codes is void and unenforceable (")
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("Espinoza v.")
    c.drawText(text_obj)
    
    # Line 18: Calva italics
    y_18 = get_y_for_line(18)
    text_obj = c.beginText(MARGIN_LEFT, y_18)
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("Calva")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("). Here, the premises violate Temple City Municipal Code regarding density")
    c.drawText(text_obj)
    
    draw_text(c, MARGIN_LEFT, 19, "and mandatory access width. A 3-Day Notice that demands rent for an illegal unit")
    draw_text(c, MARGIN_LEFT, 20, "is invalid on its face.")
    
    draw_text(c, MARGIN_LEFT, 22, "III. FIRST-IN-TIME PRIORITY (CCP § 430.10(c))", font="Times-Bold")
    draw_text(c, MARGIN_LEFT, 23, "Under CCP § 430.10(c), a party may demur when \"there is another action pending")
    draw_text(c, MARGIN_LEFT, 24, "between the same parties on the same cause of action.\" The validity of the Lease")
    
    # Line 25: Case No italics
    y_25 = get_y_for_line(25)
    text_obj = c.beginText(MARGIN_LEFT, y_25)
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut("is the subject of the prior pending unlimited civil action (")
    text_obj.setFont("Times-Italic", 12)
    text_obj.textOut("Case No. 26NNCV00412")
    text_obj.setFont("Times-Roman", 12)
    text_obj.textOut(").")
    c.drawText(text_obj)
    
    draw_text(c, MARGIN_LEFT, 27, "DATED: February 3, 2026")
    
    # Signature block repeat
    draw_text(c, MARGIN_LEFT, 28, "_" * 35)
    
    c.save()
    print(f"PDF generated successfully at: {FULL_OUTPUT_PATH}")

if __name__ == "__main__":
    create_pdf()
