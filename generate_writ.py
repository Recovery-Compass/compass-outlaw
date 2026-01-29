import sys
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def generate_writ_pdf(output_filename, content_file):
    c = canvas.Canvas(output_filename, pagesize=LETTER)
    width, height = LETTER
    
    # --- CONFIGURATION FOR 'NICORA STYLE' CLONE ---
    # User Request:
    # Font: Century Schoolbook (Preferred) or Times New Roman, Size 13.
    # Visuals: Clone the reference layout.
    
    # Python doesn't usually have Century Schoolbook built-in for ReportLab without a TTF file.
    # We will stick to Times New Roman (standard 'Times-Roman') to ensure portability and "Nicora" authority 
    # unless user provided the specific font file. Times New Roman is the legal standard substitute.
    
    FONT_NAME = "Times-Roman" 
    FONT_SIZE = 13
    LEADING = 20 # 1.5 spacingish (13 * 1.5 = 19.5). 20 is cleaner.
    
    # Pleading Paper Grid
    # User asked for "Standard 1-28 line numbers".
    # 28 lines usually requires 24pt leading (double space). 
    # IF we use 20pt leading, we will have more lines.
    # To mimic the Nicora document VISUALLY while keeping the 1-28 grid:
    # We will enforce the 24pt leading grid for the numbers, but allow text to flow at 20pt? 
    # NO. Pleading paper rules usually demand text aligns with line numbers.
    # We will use 24pt Leading to align with 28 line numbers. It looks more official/court-ready.
    
    GRID_LEADING = 24 
    
    # Margins
    LEFT_MARGIN = 1.0 * inch
    RIGHT_MARGIN = 0.5 * inch
    TOP_MARGIN = 1.0 * inch
    BOTTOM_MARGIN = 0.5 * inch
    
    TEXT_X = 90 # Slightly indented to clear the rail comfortably
    LINE_NUM_X = 30
    RAIL_X = 75
    
    def draw_pleading_paper(c):
        # Line Numbers 1-28
        c.setFont("Courier", 12)
        start_y = height - TOP_MARGIN
        for i in range(1, 29):
            y_pos = start_y - (i * GRID_LEADING) + 6
            c.drawString(LINE_NUM_X, y_pos, str(i))
        
        # Vertical Rail (Single or Double? User reference implied standard)
        c.setLineWidth(1)
        c.line(RAIL_X, TOP_MARGIN, RAIL_X, BOTTOM_MARGIN) 
        # Double rail is standard for "Pleading Paper" templates
        c.line(RAIL_X + 3, TOP_MARGIN, RAIL_X + 3, BOTTOM_MARGIN)
        
        # Footer
        c.setFont("Times-Roman", 10)
        c.drawString(TEXT_X, BOTTOM_MARGIN - 20, "APPELLANT'S PETITION FOR WRIT OF ERROR CORAM VOBIS")
        c.drawRightString(width - RIGHT_MARGIN, BOTTOM_MARGIN - 20, str(c.getPageNumber()))
        
        # Bottom Center Stamp
        c.setFont("Times-Italic", 9)
        c.drawCentredString(width/2, BOTTOM_MARGIN - 35, "Document received by the CA 6th District Court of Appeal.")

    def parse_content(content_file):
        with open(content_file, 'r') as f:
            raw = f.read()
            
        data = {}
        current_section = None
        buffer = []
        
        for line in raw.split('\n'):
            line = line.strip()
            if line.startswith('[') and line.endswith(']'):
                if current_section:
                    data[current_section] = buffer
                current_section = line[1:-1]
                buffer = []
            else:
                if line:
                    buffer.append(line)
        if current_section:
            data[current_section] = buffer
        
        # Special parsing for Caption Parts if they are in lines
        # (Our previous write put key: value in lines. We'll parse that manually below)
        return data

    data = parse_content(content_file)
    draw_pleading_paper(c)
    
    # --- PAGE 1: CAPTION HEADER ---
    y = height - TOP_MARGIN - GRID_LEADING 
    c.setFont(FONT_NAME, FONT_SIZE)
    
    # 1. COURT HEADER (Top Center)
    c.drawCentredString(width/2 + 20, y, "IN THE COURT OF APPEAL OF CALIFORNIA")
    y -= GRID_LEADING
    c.drawCentredString(width/2 + 20, y, "SIXTH APPELLATE DISTRICT")
    y -= GRID_LEADING * 2
    
    # 2. CAPTION BLOCK
    # Parse the raw caption text lines
    caption_lines = data.get('CAPTION_INFO', [])
    # We expect specific keys in the text file, but let's just use the logic from the script 
    # to extract "Parties_Left" and "Case_Right" if we stored them that way.
    # Actually, the write_to_file used: Parties_Left: ... \n ... 
    
    # Let's extract them:
    parties_left = ""
    case_right = ""
    title_text = "PETITION" # Default
    
    full_caption_text = "\n".join(caption_lines)
    
    # Extract Title
    if "Title: " in full_caption_text:
        title_text = full_caption_text.split("Title: ")[1].strip()
        
    # Manual Layout for Parties (Left Column)
    # "In re JUDY..."
    left_x = TEXT_X
    mid_x = width * 0.55
    
    # We will manually draw this based on the PROMPT specs, using the text from the file if available, 
    # or hardcoded structure if the text file is just keys.
    # The text file has specific content. Let's use it.
    
    # Petitioner Block
    c.drawString(left_x, y, "In re")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "JUDY BRAKEBILL JONES, a.k.a.")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "JUDY LEE JONES and JUDY LEE")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "BRAKEBILL JONES LASHER")
    y -= GRID_LEADING
    y -= GRID_LEADING # Space
    
    c.drawString(left_x, y, "ERIC BRAKEBILL JONES,")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "Petitioner,")
    y -= GRID_LEADING
    c.drawString(left_x, y, "v.")
    y -= GRID_LEADING
    c.drawString(left_x, y, "SUPERIOR COURT OF CALIFORNIA,")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "COUNTY OF MONTEREY,")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "Respondent.")
    y -= GRID_LEADING
    y -= GRID_LEADING
    c.drawString(left_x, y, "HEIDI JONES BLANCHARD,")
    y -= GRID_LEADING
    c.drawString(left_x + 20, y, "Real Party in Interest.")
    
    final_y_left = y
    
    # Right Column (Case Info) - Reset Y to top of block
    y_right = height - TOP_MARGIN - (GRID_LEADING * 4) # Approx where we started "In re"
    c.drawRightString(width - RIGHT_MARGIN, y_right, "Appeal No. H054014")
    y_right -= GRID_LEADING
    c.drawRightString(width - RIGHT_MARGIN, y_right, "Monterey County Case No.")
    y_right -= GRID_LEADING
    c.drawRightString(width - RIGHT_MARGIN, y_right, "25PR000590")
    
    # Draw bracket " ) "
    # Just draw a vertical line or closing parens string vertically?
    # Simple vertical line is standard "Box" style substitute
    c.line(mid_x, height - TOP_MARGIN - (GRID_LEADING * 4), mid_x, final_y_left - 10)
    
    y = final_y_left - GRID_LEADING
    
    # 3. TITLE
    c.setFont("Times-Bold", 12)
    # Word wrap the title
    title_words = title_text.split()
    line_buf = ""
    for word in title_words:
        test = line_buf + " " + word if line_buf else word
        if c.stringWidth(test, "Times-Bold", 12) < (width - TEXT_X - RIGHT_MARGIN):
            line_buf = test
        else:
            c.drawCentredString(width/2 + 20, y, line_buf)
            y -= GRID_LEADING
            line_buf = word
    if line_buf:
        c.drawCentredString(width/2 + 20, y, line_buf)
    y -= GRID_LEADING * 2
    
    # --- BODY ---
    c.setFont(FONT_NAME, FONT_SIZE)
    sections = ['INTRODUCTION', 'STATEMENT_OF_FACTS', 'LEGAL_ARGUMENT']
    
    for sec in sections:
        if sec in data:
            # Header
            c.setFont("Times-Bold", 13)
            c.drawString(TEXT_X, y, sec.replace('_', ' '))
            y -= GRID_LEADING
            c.setFont(FONT_NAME, FONT_SIZE)
            
            for line in data[sec]:
                words = line.split()
                line_buf = ""
                for word in words:
                    test = line_buf + " " + word if line_buf else word
                    if c.stringWidth(test, FONT_NAME, FONT_SIZE) < (width - TEXT_X - RIGHT_MARGIN):
                        line_buf = test
                    else:
                        c.drawString(TEXT_X, y, line_buf)
                        y -= GRID_LEADING
                        if y < BOTTOM_MARGIN + GRID_LEADING:
                             c.showPage()
                             draw_pleading_paper(c)
                             y = height - TOP_MARGIN - GRID_LEADING
                             c.setFont(FONT_NAME, FONT_SIZE)
                        line_buf = word
                if line_buf:
                    c.drawString(TEXT_X, y, line_buf)
                    y -= GRID_LEADING
                    if y < BOTTOM_MARGIN + GRID_LEADING:
                             c.showPage()
                             draw_pleading_paper(c)
                             y = height - TOP_MARGIN - GRID_LEADING
                             c.setFont(FONT_NAME, FONT_SIZE)
            y -= GRID_LEADING
            
    # --- VERIFICATION ---
    if 'VERIFICATION' in data:
        y -= GRID_LEADING
        c.setFont("Times-Bold", 13)
        c.drawCentredString(width/2 + 20, y, "VERIFICATION")
        y -= GRID_LEADING * 2
        c.setFont(FONT_NAME, FONT_SIZE)
        for line in data['VERIFICATION']:
            c.drawString(TEXT_X, y, line)
            y -= GRID_LEADING
            
    c.save()

if __name__ == "__main__":
    generate_writ_pdf(sys.argv[1], sys.argv[2])
