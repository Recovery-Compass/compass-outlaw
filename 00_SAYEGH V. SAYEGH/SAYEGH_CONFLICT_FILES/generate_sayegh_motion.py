from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors

def create_sayegh_motion_replica(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter

    # 1. Dimensions (Standard CA Pleading)
    left_margin = 1.5 * inch # Left margin for text start (approx)
    right_margin = 0.5 * inch
    top_margin = 1.0 * inch
    
    # Rails
    rail_left_x = 1.32 * inch # Standard position
    rail_right_x = 7.5 * inch
    
    # Font
    font_name = "Times-Roman" # Matching the "PROVEN" template
    font_size = 12
    c.setFont(font_name, font_size)
    
    line_height = 24 # Double spacing

    # Calculate First Line Y (Baseline)
    # Visual check of template: Line 1 aligns with text "NUHA SAYEGH".
    # Typically ~1 inch down.
    first_line_y = height - top_margin - 12
    
    def get_y(line_num):
        return first_line_y - ((line_num - 1) * line_height)

    # --- Draw Background ---
    def draw_background():
        c.saveState()
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        
        # Double Left Rail
        c.line(rail_left_x, 0, rail_left_x, height)
        c.line(rail_left_x - 4, 0, rail_left_x - 4, height) # Double line
        
        # Single Right Rail (template shows it clearly)
        c.line(rail_right_x, 0, rail_right_x, height)
        
        # Line Numbers
        c.setFont("Times-Roman", 12)
        for i in range(1, 29):
            y_pos = get_y(i)
            # Numbers left of rail
            c.drawRightString(rail_left_x - 10, y_pos, str(i))
        
        # Footer Line
        footer_y = 0.7 * inch
        c.line(rail_left_x - 4, footer_y, rail_right_x, footer_y)
        
        # Page Number and Footer Title
        c.drawCentredString((rail_left_x + rail_right_x)/2, footer_y - 12, "- 1 -")
        c.setFont("Times-Roman", 10)
        c.drawCentredString((rail_left_x + rail_right_x)/2, footer_y - 24, "NOTICE OF MOTION AND MOTION TO VACATE JUDGMENT")
        
        c.restoreState()

    draw_background()

    # --- Content ---
    
    text_x = 1.5 * inch + 5 # Padding right of double rail
    
    # 1. Header (Lines 1-4)
    c.setFont("Times-Roman", 12)
    header_info = [
        "NUHA SAYEGH",
        "5132 Rosemead Blvd.", 
        "San Gabriel, CA 91776",
        "(626) 348-3039 | nuhasayegh.ca@gmail.com",
        "Petitioner In Pro Per" 
    ]
    # In template, contact info is lines 1-5.
    for i, line in enumerate(header_info):
        c.drawString(text_x, get_y(i+1), line)

    # 2. Court Title (Centered, Lines 8-9)
    center_x = (rail_left_x + rail_right_x) / 2
    
    c.setFont("Times-Bold", 12)
    c.drawCentredString(center_x, get_y(8), "SUPERIOR COURT OF THE STATE OF CALIFORNIA")
    c.drawCentredString(center_x, get_y(9), "FOR THE COUNTY OF LOS ANGELES")
    c.drawCentredString(center_x, get_y(10), "CHATSWORTH COURTHOUSE")

    # 3. Caption Box (Lines 12-20 approx)
    
    c.setFont("Times-Roman", 12)
    
    # Parties (Left)
    c.drawString(text_x, get_y(12), "NUHA SAYEGH,")
    c.drawString(text_x + 100, get_y(13), "Petitioner,") 
    c.drawString(text_x + 20, get_y(14), "vs.")
    c.drawString(text_x, get_y(15), "FAHED SAYEGH,")
    c.drawString(text_x + 100, get_y(16), "Respondent.")

    # Divider (Parentheses)
    # Start Line 12 down to Line 20
    divider_x = 4.25 * inch
    for i in range(12, 21):
        c.drawString(divider_x, get_y(i), ")")

    # Case Info (Right)
    right_col_x = divider_x + 20
    
    c.drawString(right_col_x, get_y(12), "Case No.: 25PDFL01441")
    
    c.setFont("Times-Bold", 12)
    c.drawString(right_col_x, get_y(14), "NOTICE OF MOTION AND")
    c.drawString(right_col_x, get_y(15), "MOTION TO VACATE")
    c.drawString(right_col_x, get_y(16), "JUDGMENT (VOID FOR")
    c.drawString(right_col_x, get_y(17), "EXTRINSIC FRAUD)")
    c.drawString(right_col_x, get_y(18), "[CCP § 473(d)]")
    
    c.setFont("Times-Roman", 12)
    c.drawString(right_col_x, get_y(20), "Date: __________________")
    c.drawString(right_col_x, get_y(21), "Time: 8:30 AM")
    c.drawString(right_col_x, get_y(22), "Dept: L")
    c.drawString(right_col_x, get_y(23), "Judge: Hon. Joel L. Lofton")

    # Horizontal Line below caption
    line_y = get_y(23) - 6
    c.line(text_x, line_y, rail_right_x, line_y)

    # 4. Body Argument (Starts Line 24)
    body_start = 24
    
    body_text_lines = [
        "1. MOTION: Petitioner moves to VACATE the Order for Attorney Fees",
        "($13,000) dated November 19, 2025, on the grounds that the Order is VOID",
        "on its face due to Extrinsic Fraud.",
        "",
        "2. THE FRAUD: Evidence has emerged that Petitioner's former counsel,",
        "Kirk Kolodji, accepted a direct financial payment of $11,000.00 from the",
        "Respondent, Fahed Sayegh, via Zelle immediately following the hearing.",
        "",
        "3. THE LAW: An attorney cannot accept compensation from an adverse party",
        "without written consent (Rule 1.8.6). This secret payment constitutes",
        "collusion, depriving Petitioner of conflict-free representation and rendering",
        "the proceeding fundamentally unfair. The Judgment must be set aside."
    ]
    
    c.setFont("Times-Roman", 12)
    current_line = body_start
    
    for line in body_text_lines:
        if line.strip():
            c.drawString(text_x, get_y(current_line), line)
        current_line += 1
        
    # Signature Block
    sig_line_y = get_y(current_line + 2)
    c.line(text_x, sig_line_y, text_x + 3 * inch, sig_line_y)
    c.drawString(text_x, sig_line_y - 12, "NUHA SAYEGH")
    c.drawString(text_x, sig_line_y - 24, "Petitioner In Pro Per")
    
    c.setFont("Times-Roman", 12)
    current_line = body_start
    
    for line in body_text_lines:
        if line.strip():
            c.drawString(text_x, get_y(current_line), line)
        current_line += 1

    c.save()

if __name__ == "__main__":
    create_sayegh_motion_replica("MOTION_TO_VACATE_SAYEGH_DRAFT.pdf")
    print("PDF Generated successfully.")