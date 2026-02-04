from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Frame, PageTemplate, Table, TableStyle
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import os

# --- Configuration ---
OUTPUT_FILENAME = "DEMURRER_TO_COMPLAINT_FINAL.pdf"
DEST_DIR = "/Users/ericjones/Projects/compass-outlaw/GARY-KEARNEY-RENT/NOTICE-OF-RELATED-CASE/NOTICE-OF-RELATED-CASE-RESUBMIT"
FULL_OUTPUT_PATH = os.path.join(DEST_DIR, OUTPUT_FILENAME)

# Geometry - "Golden Grid"
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_TOP = 1 * inch
MARGIN_BOTTOM = 0.5 * inch # Relaxed bottom to allow for full 28 lines if needed, but grid stops earlier
MARGIN_LEFT = 1.5 * inch  # Text body starts here
MARGIN_RIGHT = 1 * inch

# Grid Settings
NUM_LINES = 28
LEADING = 24.0 # Exact double spacing required
GRID_START_Y = PAGE_HEIGHT - MARGIN_TOP # Line 1 top
# Note: Text baseline is usually below the "Line 1 top". 
# In ReportLab Paragraphs, the first baseline is roughly `fontSize` down from the top.
# We align the grid numbers so they sit next to the text.

VERTICAL_RULE_X = 1.3 * inch
LINE_NUMBERS_X = 0.8 * inch

def draw_pleading_background(canvas, doc):
    """Draws the line numbers and vertical rules on every page."""
    canvas.saveState()
    
    # 1. Vertical Rules
    canvas.setLineWidth(0.5)
    # Double line at 1.3 inch (VERTICAL_RULE_X)
    canvas.line(VERTICAL_RULE_X - 2, 0, VERTICAL_RULE_X - 2, PAGE_HEIGHT)
    canvas.line(VERTICAL_RULE_X + 2, 0, VERTICAL_RULE_X + 2, PAGE_HEIGHT)
    
    # 2. Line Numbers (1 to 28)
    canvas.setFont("Times-Roman", 12)
    
    # We need to match the flowable text flow.
    # The Frame starts at MARGIN_TOP. 
    # Logic: The first line of text (Line 1) baseline is approx `GRID_START_Y - 18` (descender offset for 24pt leading/12pt font).
    # We will iterate 28 lines down from GRID_START_Y by LEADING.
    
    # Adjust starting Y to visually align with text baseline.
    # Experimentally, centering the number in the 24pt slot works well, or aligning to baseline.
    # Let's align to an estimated baseline. 
    # If text is 12pt with 24pt leading, the baseline is roughly 16-18pts from the top of the line slot.
    
    start_y = GRID_START_Y - 18 # Approximate baseline drop
    
    for i in range(1, NUM_LINES + 1):
        y_pos = start_y - ((i-1) * LEADING)
        if y_pos < MARGIN_BOTTOM: break # Don't draw if off page
        canvas.drawCentredString(LINE_NUMBERS_X, y_pos, str(i))
    
    # 3. Footer
    canvas.setFont("Times-Roman", 10)
    page_num = canvas.getPageNumber()
    canvas.drawCentredString(PAGE_WIDTH / 2, 0.5 * inch, f"DEMURRER TO UNLAWFUL DETAINER | Page {page_num} of 3")
    
    canvas.restoreState()

def create_styles():
    styles = getSampleStyleSheet()
    
    # Standard Pleading Style
    # fontName='Times-Roman', fontSize=12, leading=24
    
    pleading_body = ParagraphStyle(
        name='PleadingBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=12,
        leading=LEADING,
        alignment=TA_LEFT, # Or TA_JUSTIFY
        spaceBefore=0,
        spaceAfter=0,
        leftIndent=0,
        allowWidows=0,
        allowOrphans=0
    )
    
    pleading_center = ParagraphStyle(
        name='PleadingCenter',
        parent=pleading_body,
        alignment=TA_CENTER
    )
    
    pleading_bold = ParagraphStyle(
        name='PleadingBold',
        parent=pleading_body,
        fontName='Times-Bold'
    )

    caption_text = ParagraphStyle(
        name='CaptionText',
        parent=pleading_body,
        leading=LEADING, 
        fontName='Times-Bold' # Case No etc often bold
    )
    
    return pleading_body, pleading_center, pleading_bold, caption_text

def create_demurrer():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        
    doc = SimpleDocTemplate(
        FULL_OUTPUT_PATH,
        pagesize=letter,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        leftMargin=MARGIN_LEFT,
        rightMargin=MARGIN_RIGHT
    )
    
    # Styles
    st_body, st_center, st_bold, st_caption = create_styles()
    
    story = []
    
    # === PAGE 1 ===
    
    # Lines 1-5: Filer Info
    # Using Paragraphs with fixed leading ensures they take up exactly 1 line slot each.
    story.append(Paragraph("NUHA SAYEGH", st_body))
    story.append(Paragraph("5634 Noel Drive", st_body))
    story.append(Paragraph("Temple City, CA 91780", st_body))
    story.append(Paragraph("(626) 348-3039", st_body))
    story.append(Paragraph("Defendant In Pro Per", st_body))
    
    # Spacers to reach Line 8. 
    # Current is end of Line 5. We need to skip lines 6 and 7.
    # 2 lines * 24 points = 48 points.
    story.append(Spacer(1, 2 * LEADING)) 
    
    # Line 8-9: Court Title
    story.append(Paragraph("SUPERIOR COURT OF THE STATE OF CALIFORNIA", ParagraphStyle('CourtTitle', parent=st_center, fontName='Times-Bold', leading=LEADING)))
    story.append(Paragraph("FOR THE COUNTY OF LOS ANGELES – PASADENA COURTHOUSE", ParagraphStyle('CourtSub', parent=st_center, fontName='Times-Bold', leading=LEADING)))
    
    # Spacer to reach Line 11. End of Line 9. Skip Line 10.
    story.append(Spacer(1, 1 * LEADING))
    
    # Line 11: Caption Table
    # 3 Columns: Parties | Squiggle | Case Info
    # Total width available: PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
    avail_width = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
    
    # Column widths
    col1_w = avail_width * 0.45
    col2_w = avail_width * 0.05
    col3_w = avail_width * 0.50
    
    # Content
    # Col 1: Parties
    # "GARY W. KEARNEY, an individual,\nPlaintiff,\nvs.\nERIC BRAKEBILL JONES, et al.,\nDefendants."
    # We put strict line breaks to match grid slots 11, 12, 13...
    part1_text = """GARY W. KEARNEY, an individual,<br/>
    <br/>
    Plaintiff,<br/>
    <br/>
    vs.<br/>
    <br/>
    ERIC BRAKEBILL JONES, et al.,<br/>
    <br/>
    Defendants."""
    # Note: Double <br/> or spacer to skip lines? 
    # If using leading=24, single <br/> moves to next line.
    
    # Col 2: Squiggle
    # repeat )
    squiggle = ")<br/>"*9 + ")" # Lines 11-20 approx
    
    # Col 3: Case Info
    # Line 11: Case No
    # Line 12: Empty
    # Line 13: Demurrer Title
    # ...
    case_text = """<b>Case No.: 26PDUD00325</b><br/>
    <br/>
    <b>DEMURRER TO COMPLAINT FOR<br/>
    UNLAWFUL DETAINER<br/>
    [CCP §§ 1170, 430.10(e), 430.10(c)]</b><br/>
    <br/>
    Date: [Leave Blank]<br/>
    Time: [Leave Blank]<br/>
    Dept: [Leave Blank]<br/>
    Action Filed: January 28, 2026"""
    
    # Create Paragraphs for cells to respect style
    # We need a style that fits.
    p_parties = Paragraph(part1_text, st_body)
    p_squiggle = Paragraph(squiggle, ParagraphStyle('Squiggle', parent=st_body, alignment=TA_RIGHT))
    p_case = Paragraph(case_text, st_body)
    
    data = [[p_parties, p_squiggle, p_case]]
    
    t = Table(data, colWidths=[col1_w, col2_w, col3_w])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0), # Critical for grid alignment
    ]))
    
    story.append(t)
    
    # After Table, we need to ensure we are at Line 22.
    # The table covers Lines 11-20 (roughly 10 lines).
    # If the text content is exactly 10 lines, we end at Line 20.
    # We need to skip Line 21.
    
    # Let's count lines in `part1_text`. It has 9 breaks -> 10 lines.
    # So we are at end of line 20.
    # Spacer for Line 21.
    story.append(Spacer(1, 1 * LEADING))
    
    # Line 22: TO PLAINTIFF...
    story.append(Paragraph("<b>TO PLAINTIFF GARY W. KEARNEY AND TO HIS ATTORNEY OF RECORD:</b>", st_body))
    
    # Line 23 is empty in prompt map? 
    # Prompt says: Line 22 "Begin Introduction"
    # Prompt Map Page 1: 
    # Line 22: "TO PLAINTIFF..."
    # Line 23: [Blank in original prompt mapping? Or part of the text?]
    # Original map: Line 23 seems blank. Line 24 starts "PLEASE TAKE NOTICE..."
    story.append(Spacer(1, 1 * LEADING))
    
    # Lines 24-28
    intro_text = """PLEASE TAKE NOTICE that on the date and time assigned by the Court Clerk in
    the Department to be assigned, Defendant NUHA SAYEGH (“Defendant”) will, and
    hereby does, demur to the Complaint for Unlawful Detainer filed by Plaintiff GARY
    W. KEARNEY (“Plaintiff”).
    This Demurrer is based on the following grounds pursuant to CCP § 430.10:"""
    
    story.append(Paragraph(intro_text, st_body))
    
    # Template managed by build() arguments
    
    story.append(items_PageBreak())
    
    # === PAGE 2 ===
    # Line 1-2 header
    story.append(Paragraph("<b>1. FAILURE TO STATE FACTS SUFFICIENT TO CONSTITUTE A CAUSE OF ACTION<br/>(CCP § 430.10(e))</b>", st_body))
    
    # Line 3 body
    body_p2 = """The Complaint fails to state a cause of action for Unlawful Detainer because the
    underlying lease agreement is void <i>ab initio</i> as a matter of law. The subject
    premises (5634 Noel Drive) is an unpermitted dwelling unit maintained in violation
    of Temple City Municipal Code (TCMC) density and zoning ordinances. Under
    <i>Espinoza v. Calva</i> (2008) 169 Cal.App.4th 1393, a landlord cannot recover
    possession or rent based on a lease for an illegal unit. Because the lease is void,
    the 3-Day Notice to Pay Rent or Quit is fatally defective."""
    
    story.append(Paragraph(body_p2, st_body))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 10 blank
    
    # Line 11 header
    story.append(Paragraph("<b>2. ANOTHER ACTION PENDING (CCP § 430.10(c))</b>", st_body))
    
    # Line 12 body
    body_p2_2 = """There is another action pending between the same parties on the same cause of
    action. Defendant filed a Verified Complaint for Damages and Rescission against
    Plaintiff on <b>January 21, 2026</b> (Case No. <b>26NNCV00412</b>), seven days <i>prior</i> to the
    filing of this Unlawful Detainer action. The prior pending action (“The First
    Action”) challenges the validity of the lease and seeks rescission. The determination
    of the lease’s validity in the First Action is a prerequisite to any adjudication of
    possession in this summary proceeding. A "Notice of Related Case" linking these
    matters was filed on February 3, 2026."""
    
    story.append(Paragraph(body_p2_2, st_body))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 20 blank
    
    # Prayer
    story.append(Paragraph("<b>PRAYER</b>", st_body))
    story.append(Paragraph("WHEREFORE, Defendant prays for judgment as follows:", st_body))
    
    # List items with indentation? 
    # Just use paragraphs with non-breaking spaces or indentation style.
    px = "&nbsp;&nbsp;&nbsp;&nbsp;"
    prayer_text = f"""1. That this Demurrer be sustained without leave to amend;<br/>
    2. That the Unlawful Detainer Complaint be dismissed with prejudice;<br/>
    3. For costs of suit; and<br/>
    4. For such other and further relief as the Court deems just and proper."""
    
    # Need indents. PleadingBody is left align. 
    # I'll construct a single paragraph with manual breaks or separate paragraphs with indent style.
    # Single paragraph ensures spacing consistency.
    story.append(Paragraph(prayer_text, ParagraphStyle('Prayer', parent=st_body, leftIndent=0.5*inch)))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 27
    
    story.append(Paragraph("DATED: February 3, 2026", st_body))
    
    story.append(items_PageBreak())
    
    # === PAGE 3 ===
    story.append(Paragraph("_" * 35, st_body))
    story.append(Paragraph("<b>NUHA SAYEGH</b>", st_body))
    story.append(Paragraph("Defendant in Pro Per", st_body))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 4
    
    story.append(Paragraph("<b>MEMORANDUM OF POINTS AND AUTHORITIES</b>", st_center))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 6
    
    story.append(Paragraph("<b>I. INTRODUCTION</b>", st_body))
    
    intro_p3 = """This Unlawful Detainer action is a retaliatory attempt to enforce a void lease on an
    illegal dwelling. Plaintiff filed this action on January 28, 2026. However, Defendant
    had already filed a unlimited civil action against Plaintiff on January 21, 2026
    (<i>Sayegh v. Kearney</i>, Case No. 26NNCV00412), alleging Fraud and seeking
    Rescission. Because the First Action challenges the existence of the landlord-tenant
    relationship and was filed first, this Court should sustain the demurrer."""
    story.append(Paragraph(intro_p3, st_body))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 14
    
    story.append(Paragraph("<b>II. THE LEASE IS VOID AB INITIO (CCP § 430.10(e))</b>", st_body))
    
    void_p3 = """A contract for an illegal purpose is void (Civil Code § 1598). A lease for a unit that
    violates local zoning or building codes is void and unenforceable (<i>Espinoza v.
    Calva</i>). Here, the premises violate Temple City Municipal Code regarding density
    and mandatory access width. A 3-Day Notice that demands rent for an illegal unit
    is invalid on its face."""
    story.append(Paragraph(void_p3, st_body))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 21
    
    story.append(Paragraph("<b>III. FIRST-IN-TIME PRIORITY (CCP § 430.10(c))</b>", st_body))
    
    priority_p3 = """Under CCP § 430.10(c), a party may demur when "there is another action pending
    between the same parties on the same cause of action." The validity of the Lease
    is the subject of the prior pending unlimited civil action (<i>Case No. 26NNCV00412</i>)."""
    story.append(Paragraph(priority_p3, st_body))
    
    story.append(Spacer(1, 1 * LEADING)) # Line 26
    
    story.append(Paragraph("DATED: February 3, 2026", st_body))
    story.append(Paragraph("_" * 35, st_body))

    # Build
    doc.build(story, onFirstPage=draw_pleading_background, onLaterPages=draw_pleading_background)
    print(f"Refactored PDF generated at: {FULL_OUTPUT_PATH}")

class items_PageBreak(Spacer):
     def __init__(self):
         Spacer.__init__(self, 0, 0)
     def wrap(self, availWidth, availHeight):
         return (0, 0) # consumes 0 size, interacts with FrameBreak maybe?
         # No, use PageBreak() class from platypus
from reportlab.platypus import PageBreak as RealPageBreak
def items_PageBreak(): return RealPageBreak()

if __name__ == "__main__":
    create_demurrer()
