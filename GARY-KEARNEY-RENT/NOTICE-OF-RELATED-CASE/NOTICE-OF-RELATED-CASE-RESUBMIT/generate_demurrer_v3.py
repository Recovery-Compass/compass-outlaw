from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
import os

# --- Configuration ---
OUTPUT_FILENAME = "DEMURRER_FINAL_GRIDLOCKED.pdf"
DEST_DIR = "/Users/ericjones/Projects/compass-outlaw/GARY-KEARNEY-RENT/NOTICE-OF-RELATED-CASE/NOTICE-OF-RELATED-CASE-RESUBMIT"
FULL_OUTPUT_PATH = os.path.join(DEST_DIR, OUTPUT_FILENAME)

# Geometry - "Golden Grid"
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_TOP = 1 * inch
MARGIN_BOTTOM = 0.5 * inch
MARGIN_LEFT = 1.5 * inch
MARGIN_RIGHT = 1 * inch
TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

# The Engine
LINE_HEIGHT = 24.0 # points
# Baseline starts slightly below the "Line top". 
# If Line 1 is the first slot, let's say Top Margin is Y=720 (10").
# Line 1 number centers at Y=708 approx. Text baseline should be around Y=700-702 for 12pt font.
# Let's calibrate: 28 lines = 9 inches = 648 pts. 648/28 ~ 23.14. 
# BUT USER DEMAND: "Exact 24 pt (double) spacing".
# If we do exact 24pt, 28 lines takes 672 points (9.33 inches).
# 11" - 1" top - 1" bottom = 9". 
# STRICT 24pt spacing means 28 lines is TIGHT or overflows 9". 
# 28 * 24 = 672 pts. 9 inches = 648 pts.
# So 28 lines at 24pt spacing requires 9.33 inches of vertical space. 
# 11 - 9.33 = 1.66 inch of margins total. Shared top/bottom -> 0.83 inch margins.
# User setup: Top 1", Bottom 1"? 
# We will use 24pt spacing because "Clerk’s Ruler" demands it. We just run closer to margins.
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
    # Align numbers with the calculated baselines
    for i in range(1, 29):
        y = get_y(i)
        c.drawCentredString(0.8 * inch, y, str(i))
    
    # 2. Vertical Rules (Double Line)
    c.setLineWidth(0.5)
    rule_x = 1.3 * inch
    c.line(rule_x - 2, 0, rule_x - 2, PAGE_HEIGHT)
    c.line(rule_x + 2, 0, rule_x + 2, PAGE_HEIGHT)
    
    # 3. Footer
    c.setFont("Times-Roman", 10)
    c.drawCentredString(PAGE_WIDTH / 2, 0.5 * inch, f"DEMURRER TO UNLAWFUL DETAINER | Page {page_idx} of 3")
    
    c.restoreState()

def draw_wrapped_text(c, text, start_line, font=FONT_NAME, size=FONT_SIZE, is_bold=False, is_italic=False, additional_indent=0):
    """
    Wraps text into lines and draws them on the grid.
    Returns the NEXT line number to use.
    Handles basic bold/italic flags for the whole block (limited rich text support in this manual mode).
    For mixed styles (italics in middle of sentence), we might need manual handling or limited splitting. 
    User prompt emphasizes "Text Wrapper" function.
    Given strict formatting, "draw_wrapped_text" might need to handle basic markup or we process chunks.
    For simplicity and robustness:
    - We will assume 'text' is a plain string unless we specifically handle styling.
    - We can use ReportLab's styling if we wanted, but `canvas` is manual.
    - Let's support a simple "draw this paragraph" and if we need mixed styles (e.g. Italic citation), 
      we might construct it manually or use a helper. 
      For v3, I will implement a rudimentary rich-text drawer if needed, but the prompt implies simple wrapping.
      HOWEVER, "Espinoza v. Calva" needs italics.
      I'll implement a crude XML-like parser or just manual chunks for those specific lines?
      Better: Use `simpleSplit` to get lines, then draw. 
      If mixed style is needed, we might have to be clever. 
      Given the specific content mapping, manual placement line-by-line is safest for "Golden File" matching if wrapping is predictable.
      But `draw_wrapped_text` is requested.
      I will use `simpleSplit` on the plain text. If italics are needed, I will apply them to specific lines manually if possible or try to handle simple HTML-like tags if I build a small parser.
      Let's stick to PLAIN text wrapping mostly, and manual line writing for the complex citations to ensure strict control, 
      OR split the paragraph and manual formatting.
    """
    
    # Actual implementation:
    # Use simpleSplit to wrap.
    # Draw each line.
    
    chosen_font = font
    if is_bold: chosen_font = "Times-Bold"
    if is_italic: chosen_font = "Times-Italic"
    
    c.setFont(chosen_font, size)
    
    # rigid width
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
        cur_x += c.stringWidth(text, font_name, 12) 

def create_demurrer_v3():
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
    
    # Caption Box (Lines 11-20)
    # Vertical Line Separator
    # Center of text area? 
    # Left margin 1.5, Right 1. Text width 6. Center is 1.5 + 3 = 4.5 inch.
    sep_x = 4.5 * inch
    c.setLineWidth(1)
    # Line from top of Line 11 to bottom of Line 20?
    # Top of Line 11 is roughly get_y(10.5). Bottom of Line 20 is get_y(20.5).
    # Slightly tighter: y11_top = get_y(11) + 12. y20_bot = get_y(20) - 5.
    c.line(sep_x, get_y(11) + 10, sep_x, get_y(20) - 5)
    
    # Left Side Parties
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(11), "GARY W. KEARNEY, an individual,")
    c.drawString(MARGIN_LEFT, get_y(13), "Plaintiff,")
    c.drawString(MARGIN_LEFT, get_y(15), "vs.")
    c.drawString(MARGIN_LEFT, get_y(17), "ERIC BRAKEBILL JONES, et al.,")
    c.drawString(MARGIN_LEFT, get_y(19), "Defendants.")
    
    # Right Side Case Info
    # x start = sep_x + padding
    info_x = sep_x + 10
    c.setFont("Times-Bold", 12)
    c.drawString(info_x, get_y(11), "Case No.: 26PDUD00325")
    c.drawString(info_x, get_y(13), "DEMURRER TO COMPLAINT FOR")
    c.drawString(info_x, get_y(14), "UNLAWFUL DETAINER")
    c.drawString(info_x, get_y(15), "[CCP §§ 1170, 430.10(e), 430.10(c)]")
    
    c.setFont("Times-Roman", 12)
    c.drawString(info_x, get_y(17), "Date: [Leave Blank]")
    c.drawString(info_x, get_y(18), "Time: [Leave Blank]")
    c.drawString(info_x, get_y(19), "Dept: [Leave Blank]")
    c.drawString(info_x, get_y(20), "Action Filed: January 28, 2026")
    
    # Intro
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(22), "TO PLAINTIFF GARY W. KEARNEY AND TO HIS ATTORNEY OF RECORD:")
    
    text_24 = "PLEASE TAKE NOTICE that on the date and time assigned by the Court Clerk in the Department to be assigned, Defendant NUHA SAYEGH (“Defendant”) will, and hereby does, demur to the Complaint for Unlawful Detainer filed by Plaintiff GARY W. KEARNEY (“Plaintiff”). This Demurrer is based on the following grounds pursuant to CCP § 430.10:"
    
    # Manually mapping perfectly to the prompt's layout if possible, or wrapping?
    # Prompt says: "The introductory sentence always breaks exactly at Line 22" (actually 24 in mapping).
    # Mapping:
    # Line 24: "PLEASE TAKE NOTICE that on the date and time assigned by the Court Clerk in"
    # Line 25: "the Department to be assigned, Defendant NUHA SAYEGH (“Defendant”) will, and"
    # Line 26: "hereby does, demur to the Complaint for Unlawful Detainer filed by Plaintiff GARY"
    # Line 27: "W. KEARNEY (“Plaintiff”)."
    # Line 28: "This Demurrer is based on the following grounds pursuant to CCP § 430.10:"
    
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
    
    # Line 4: underlying lease agreement is void *ab initio* as a matter of law. The subject
    draw_manual_rich_line(c, MARGIN_LEFT, 4, [
        ("underlying lease agreement is void ", "Times-Roman"),
        ("ab initio", "Times-Italic"),
        (" as a matter of law. The subject", "Times-Roman")
    ])
    
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(5), "premises (5634 Noel Drive) is an unpermitted dwelling unit maintained in violation")
    c.drawString(MARGIN_LEFT, get_y(6), "of Temple City Municipal Code (TCMC) density and zoning ordinances. Under")
    
    # Line 7: *Espinoza v. Calva* (2008) 169 Cal.App.4th 1393, a landlord cannot recover
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
    
    # Line 14: Plaintiff on **January 21, 2026** (Case No. **26NNCV00412**), seven days *prior* to the
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
    
    c.drawString(MARGIN_LEFT, get_y(28), "DATED: February 3, 2026")
    
    c.showPage()
    
    # ================= PAGE 3 =================
    draw_grid_background(c, 3)
    
    c.drawString(MARGIN_LEFT, get_y(1), "_" * 35)
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(2), "NUHA SAYEGH")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(3), "Defendant in Pro Per")
    
    c.setFont("Times-Bold", 12)
    c.drawCentredString(PAGE_WIDTH/2, get_y(5), "MEMORANDUM OF POINTS AND AUTHORITIES")
    
    c.drawString(MARGIN_LEFT, get_y(7), "I. INTRODUCTION")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(8), "This Unlawful Detainer action is a retaliatory attempt to enforce a void lease on an")
    c.drawString(MARGIN_LEFT, get_y(9), "illegal dwelling. Plaintiff filed this action on January 28, 2026. However, Defendant")
    c.drawString(MARGIN_LEFT, get_y(10), "had already filed a unlimited civil action against Plaintiff on January 21, 2026")
    
    # 11: (*Sayegh v. Kearney*, Case No. 26NNCV00412), alleging Fraud and seeking
    draw_manual_rich_line(c, MARGIN_LEFT, 11, [
        ("(", "Times-Roman"),
        ("Sayegh v. Kearney", "Times-Italic"),
        (", Case No. 26NNCV00412), alleging Fraud and seeking", "Times-Roman")
    ])
    
    c.drawString(MARGIN_LEFT, get_y(12), "Rescission. Because the First Action challenges the existence of the landlord-tenant")
    c.drawString(MARGIN_LEFT, get_y(13), "relationship and was filed first, this Court should sustain the demurrer.")
    
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(15), "II. THE LEASE IS VOID AB INITIO (CCP § 430.10(e))")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(16), "A contract for an illegal purpose is void (Civil Code § 1598). A lease for a unit that")
    
    # 17: violates local zoning or building codes is void and unenforceable (*Espinoza v.*
    draw_manual_rich_line(c, MARGIN_LEFT, 17, [
        ("violates local zoning or building codes is void and unenforceable (", "Times-Roman"),
        ("Espinoza v.", "Times-Italic")
    ])
    
    # 18: *Calva*) Here, the premises violate Temple City Municipal Code regarding density
    draw_manual_rich_line(c, MARGIN_LEFT, 18, [
        ("Calva", "Times-Italic"),
        ("). Here, the premises violate Temple City Municipal Code regarding density", "Times-Roman")
    ])
    
    c.drawString(MARGIN_LEFT, get_y(19), "and mandatory access width. A 3-Day Notice that demands rent for an illegal unit")
    c.drawString(MARGIN_LEFT, get_y(20), "is invalid on its face.")
    
    c.setFont("Times-Bold", 12)
    c.drawString(MARGIN_LEFT, get_y(22), "III. FIRST-IN-TIME PRIORITY (CCP § 430.10(c))")
    c.setFont("Times-Roman", 12)
    c.drawString(MARGIN_LEFT, get_y(23), "Under CCP § 430.10(c), a party may demur when \"there is another action pending")
    c.drawString(MARGIN_LEFT, get_y(24), "between the same parties on the same cause of action.\" The validity of the Lease")
    
    # 25: is the subject of the prior pending unlimited civil action (*Case No. 26NNCV00412*).
    draw_manual_rich_line(c, MARGIN_LEFT, 25, [
        ("is the subject of the prior pending unlimited civil action (", "Times-Roman"),
        ("Case No. 26NNCV00412", "Times-Italic"),
        (").", "Times-Roman")
    ])
    
    c.drawString(MARGIN_LEFT, get_y(27), "DATED: February 3, 2026")
    
    # Only Signature on Line 28
    c.drawString(MARGIN_LEFT, get_y(28), "_" * 35)
    
    c.save()
    print(f"Grid-Locked PDF generated at: {FULL_OUTPUT_PATH}")

if __name__ == "__main__":
    create_demurrer_v3()
