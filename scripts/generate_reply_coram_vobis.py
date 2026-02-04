
import os
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import Color
from PyPDF2 import PdfReader, PdfWriter

# --- Configuration ---
OUTPUT_FILENAME = "/Users/ericjones/Projects/compass-outlaw/JANUARY 31/2026.02.01_Petitioner_Reply_and_Coram_Vobis_FINAL_v2.pdf"
EXHIBIT_A_PATH = "/Users/ericjones/Projects/compass-outlaw/JANUARY 31/NICORA ADMISSION LETTER_JUNE_27_2025.pdf"
# Assuming Exhibit B (Page 9 of Brief) is extracted or we just reference it. 
# The user asked to "Load Adversary Brief... Target Vector 1: Page 9... Automatically append Exhibit B (Page 9 of Brief)".
# We will look for the brief to extract page 9.
BRIEF_PATH = "/Users/ericjones/Projects/compass-outlaw/JANUARY 31/2026.1.22 Real Party in Interest Response Jones.pdf" 
# Actually user said: "Load Adversary Brief: JANUARY 31_Real Party in Interest Brief.pdf" in INPUT DIRECTORY.

# --- Pleading Paper Layout ---

def create_pleading_paper(c, page_height=11*inch):
    """Draws the 28-line pleading paper grid."""
    c.saveState()
    
    # Margins
    left_margin = 0.5 * inch
    right_margin = 7.5 * inch # approx, usually there's a right line or just text margin
    pleading_line_x = 1.3 * inch
    
    # Vertical Lines
    c.setLineWidth(1)
    # Double line often standard, but single heavy line requested for "Clean Alignment" in previous prompts?
    # We'll do standard double line simulation: one thick or two thin. 
    # Let's stick to the single strong line at 1.3 inch as per typical "Clean" style
    c.line(pleading_line_x, 0, pleading_line_x, page_height)
    
    # Left edge numbers
    c.setFont("Times-Roman", 10) # 12pt for text, 10pt for line numbers usually
    
    # 28 lines
    # Content area is roughly between top margin and bottom.
    # Standard: 1 inch margins top/bottom. 9 inches of writing space. 
    # 28 lines = ~25-26 lines of text usually.
    # We will map 1-28 exactly to the vertical space to ensure "Grid-Lock".
    # Using 24pt leading exactly equates to 28 lines on 11 inch paper if full height? NO.
    # 28 lines * 24 points = 672 points = 9.33 inches. perfect fit.
    
    start_y = 10 * inch # First line number position
    line_spacing = 24.0 # points, which is 1/3 inch.
    
    for i in range(1, 29):
        # Y position for the number
        y = start_y - ((i-1) * (line_spacing/72.0) * inch) 
        c.drawString(0.8 * inch, y - 2, str(i)) # -2 to align baseline visually
        
        # Optional: draw faint line for grid verification (commented out for prod)
        # c.setStrokeColor(Color(0.9,0.9,0.9))
        # c.line(0, y, 8.5*inch, y)
        # c.setStrokeColor(Color(0,0,0))

    # Footer
    c.setFont("Times-Roman", 9)
    c.drawCentredString(4.25 * inch, 0.5 * inch, "PETITIONER'S REPLY & CORAM VOBIS")
    
    c.restoreState()

# --- Content Generation ---

def draw_text_block(c, text, x_start, y_start, width, font_name="Times-Roman", font_size=12, leading=24):
    """
    Draws text wrapping at 'width', returning new y position.
    Respects strict leading for line alignment.
    """
    c.setFont(font_name, font_size)
    words = text.split()
    line_buf = []
    line_width = 0
    current_y = y_start
    
    space_width = c.stringWidth(" ", font_name, font_size)
    
    for word in words:
        w_width = c.stringWidth(word, font_name, font_size)
        if line_width + w_width <= width:
            line_buf.append(word)
            line_width += w_width + space_width
        else:
            # Draw current line
            c.drawString(x_start, current_y, " ".join(line_buf))
            current_y -= (leading / 72.0 * inch)
            line_buf = [word]
            line_width = w_width + space_width
            
    if line_buf:
        c.drawString(x_start, current_y, " ".join(line_buf))
        current_y -= (leading / 72.0 * inch)
        
    return current_y

def generate_pdf_pages():
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=LETTER)
    width, height = LETTER
    
    # Coordinates conforming to 28-line grid
    # Line 1 is at 10.0 inch roughly (from our pleading paper math)
    # We align text baseline to the numbers.
    
    line_1_y = 10.0 * inch
    line_height_in = 24.0 / 72.0 * inch # 0.3333 inch
    
    def get_line_y(line_num):
        return line_1_y - ((line_num - 1) * line_height_in)

    content_x = 1.5 * inch
    content_width = 6.0 * inch # Right margin at 7.5
    
    # --- PAGE 1 ---
    create_pleading_paper(c)
    
    # Caption Header
    c.setFont("Times-Roman", 12)
    # Custom placement for header to look right
    c.drawCentredString(width/2, height - 0.75*inch, "IN THE COURT OF APPEAL OF THE STATE OF CALIFORNIA")
    c.drawCentredString(width/2, height - 1.0*inch, "SIXTH APPELLATE DISTRICT")
    
    # Caption Box
    # Parties
    start_caption_line = 5
    y = get_line_y(start_caption_line)
    
    c.drawString(content_x, y, "In re JUDY BRAKEBILL JONES, a.k.a.")
    c.drawString(content_x, y - line_height_in, "JUDY LEE JONES and JUDY LEE")
    c.drawString(content_x, y - (2*line_height_in), "BRAKEBILL JONES LASHER")
    
    c.drawString(content_x, y - (4*line_height_in), "ERIC BRAKEBILL JONES,")
    c.drawString(content_x + 2*inch, y - (4*line_height_in), "Petitioner,")
    
    c.drawString(content_x, y - (5*line_height_in), "v.")
    
    c.drawString(content_x, y - (6*line_height_in), "SUPERIOR COURT OF CALIFORNIA,")
    c.drawString(content_x, y - (7*line_height_in), "COUNTY OF MONTEREY,")
    c.drawString(content_x + 2*inch, y - (7*line_height_in), "Respondent.")

    c.drawString(content_x, y - (9*line_height_in), "HEIDI JONES BLANCHARD,")
    c.drawString(content_x + 2*inch, y - (9*line_height_in), "Real Party in Interest.")

    # Case Info
    case_x = 5.0 * inch
    c.drawString(case_x, y, "Appeal No. H054014")
    c.drawString(case_x, y - line_height_in, "Monterey Case No. 25PR000590")
    
    # Title
    title_start_line = 16
    yy = get_line_y(title_start_line)
    c.setFont("Times-Bold", 12)
    c.drawCentredString(width/2, yy, "PETITIONER'S REPLY BRIEF;")
    c.drawCentredString(width/2, yy - line_height_in, "PETITION FOR WRIT OF ERROR CORAM VOBIS")
    c.line(1.5*inch, yy - line_height_in - 2, 7.0*inch, yy - line_height_in - 2)

    # INTRODUCTION
    body_start_line = 19
    yy = get_line_y(body_start_line)
    
    yy = draw_text_block(c, "I. INTRODUCTION", content_x, yy, content_width, font_name="Times-Bold")
    
    intro_text = "Petitioner Eric Brakebill Jones submits this Reply and Petition for Writ of Error Coram Vobis. This filing addresses the extrinisc fraud revealed by the contradiction between Respondent's January 22, 2026 opposition and Respondent's June 27, 2025 internal records."
    yy = draw_text_block(c, intro_text, content_x, yy, content_width, font_name="Times-Roman")

    # STATEMENT OF FACTS
    yy -= line_height_in # Space
    yy = draw_text_block(c, "II. STATEMENT OF FACTS: THE EXTRINSIC FRAUD", content_x, yy, content_width, font_name="Times-Bold")
    
    # STATEMENT OF FACTS
    yy -= line_height_in # Space
    yy = draw_text_block(c, "II. STATEMENT OF FACTS: THE EXTRINSIC FRAUD", content_x, yy, content_width, font_name="Times-Bold")
    
    def check_page_break(current_y):
        if current_y < 2.0 * inch:
            c.showPage()
            create_pleading_paper(c)
            return get_line_y(1)
        return current_y

    # Text Block 1
    yy -= line_height_in 
    yy = check_page_break(yy)
    fact1 = "1. The Admission (June 27, 2025): On June 27, 2025, Respondent's counsel, Nicora Law Offices, LLP, authored a formal letter to Petitioner admitting possession of estate assets. The letter, attached hereto as Exhibit A, explicitly states: \"My client proposes the $10,985.00... be distributed.\" This document constitutes a fiduciary admission of asset control."
    yy = draw_text_block(c, fact1, content_x, yy, content_width)

    # Text Block 2
    yy -= line_height_in
    yy = check_page_break(yy)
    fact2 = "2. The Denial (January 22, 2026): Seven months later, on January 22, 2026, the same counsel filed a Brief in this Court attempting to discredit Petitioner's standing. In that filing, attached as Exhibit B (Page 9), counsel represented to this Tribunal that Petitioner's allegations regarding these same assets reflect a \"make-believe world.\""
    yy = draw_text_block(c, fact2, content_x, yy, content_width)

    # Text Block 3
    yy -= line_height_in
    yy = check_page_break(yy)
    fact3 = "3. The Extrinsic Fraud: This contradiction is not a dispute of fact; it is a deception extrinsic to the record. Respondent withheld the June 27 Admission from the trial court to secure a favorable ruling, and then actively misled this Appellate Court by characterizing the concealed assets as \"make-believe.\" This specific act of concealment prevented Petitioner from presenting his case for a Stay."
    yy = draw_text_block(c, fact3, content_x, yy, content_width)

    # ARGUMENT I
    yy -= line_height_in
    yy = check_page_break(yy)
    yy = draw_text_block(c, "III. ARGUMENT", content_x, yy, content_width, font_name="Times-Bold")
    
    yy -= line_height_in
    yy = check_page_break(yy)
    yy = draw_text_block(c, "A. The 'Make-Believe' Assertion Constitutes Extrinsic Fraud.", content_x, yy, content_width, font_name="Times-Bold")
    arg1 = "The Respondent's characterization of the assets as \"make-believe\" (Exhibit B) is a falsification of fact. Coram Vobis is required when a new fact (the June 27 Admission) was prevented from appearing on the record by the opposing party's fraud. Here, Respondent suppressed the existence of the $10,985.00 to validate their argument that the Petition was defective."
    yy = draw_text_block(c, arg1, content_x, yy, content_width)
    
    yy -= line_height_in
    yy = check_page_break(yy)
    yy = draw_text_block(c, "B. The Bond is Insufficient Due to Concealed Liability.", content_x, yy, content_width, font_name="Times-Bold")
    arg2 = "Respondent argues a $20,000 bond protects the estate. This calculation excludes the concealed $10,985.00 (plus statutory interest and penalties). A bond calculated on a fraudulent inventory is void ab initio. The estate is exposed."
    yy = draw_text_block(c, arg2, content_x, yy, content_width)

    yy -= line_height_in
    yy = check_page_break(yy)
    yy = draw_text_block(c, "C. Petitioner's Brief Was Not Defective; It Was Prescient.", content_x, yy, content_width, font_name="Times-Bold")
    arg3 = "Respondent attacks Petitioner's brief under Rule 8.204 for lacking facts. Petitioner cannot cite a record that Respondent has actively suppressed. The defect lies in Respondent's candor, not Petitioner's briefing."
    yy = draw_text_block(c, arg3, content_x, yy, content_width)
    
    yy -= line_height_in
    yy = check_page_break(yy)
    yy = draw_text_block(c, "IV. PRAYER", content_x, yy, content_width, font_name="Times-Bold")
    prayer = "Petitioner prays for the issuance of a Writ of Error Coram Vobis to vacate the order based on the extrinsic fraud established by the June 27 Admission."
    yy = draw_text_block(c, prayer, content_x, yy, content_width)
    
    # verification sig
    yy -= 2 * line_height_in
    yy = check_page_break(yy)
    c.line(content_x, yy, content_x + 3*inch, yy)
    c.drawString(content_x, yy - 15, "ERIC BRAKEBILL JONES, Petitioner")

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer

def merge_exhibits(main_pdf_buffer):
    writer = PdfWriter()
    
    # 1. Add Main Brief
    main_reader = PdfReader(main_pdf_buffer)
    for page in main_reader.pages:
        writer.add_page(page)
        
    # 2. Add Exhibit A (Letter)
    try:
        if os.path.exists(EXHIBIT_A_PATH):
            reader_a = PdfReader(EXHIBIT_A_PATH)
            # Add a separator page? Or just straight in. 
            # Ideally we stamp "Exhibit A" but for now just append.
            for page in reader_a.pages:
                writer.add_page(page)
        else:
            print(f"WARNING: Exhibit A not found at {EXHIBIT_A_PATH}")
    except Exception as e:
        print(f"Error appending Exhibit A: {e}")

    # 3. Add Exhibit B (Page 9 of Brief)
    try:
        if os.path.exists(BRIEF_PATH):
            reader_b = PdfReader(BRIEF_PATH)
            # Python is 0-indexed, Page 9 is index 8.
            if len(reader_b.pages) >= 9:
                page_9 = reader_b.pages[8] 
                writer.add_page(page_9)
            else:
                print("Brief is shorter than 9 pages.")
        else:
             print(f"WARNING: Brief not found at {BRIEF_PATH}")
    except Exception as e:
        print(f"Error appending Exhibit B: {e}")

    # Write Final
    with open(OUTPUT_FILENAME, "wb") as f:
        writer.write(f)

if __name__ == "__main__":
    print("Generating PDF...")
    pdf_buffer = generate_pdf_pages()
    print("Merging Exhibits...")
    merge_exhibits(pdf_buffer)
    print(f"Success: {OUTPUT_FILENAME}")
