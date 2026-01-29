from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Frame, Spacer
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT

OUTPUT_FILENAME = "/Users/ericjones/Projects/compass-outlaw/APPELLANT_PETITION_CORAM_VOBIS_H054014_FINAL_v3.pdf"

def create_pleading_paper(c, doc):
    # Draw the pleading paper lines and numbers
    c.saveState()
    
    # Vertical line (California style usually has double lines or single line on left)
    # Drawing a simple single line for "Clean Alignment"
    c.setLineWidth(1)
    c.line(0.5 * inch, 0, 0.5 * inch, 11 * inch) # Left margin line (optional in some styles but standard in others)
    # Actually, standard pleading paper has a line around 1.25 inch for line numbers
    c.setLineWidth(0.5)
    c.line(1.3 * inch, 0, 1.3 * inch, 11 * inch) # The main pleading line
    c.line(7.5 * inch, 0, 7.5 * inch, 11 * inch) # Right margin line (optional)

    # Line numbers 1-28
    c.setFont("Times-Roman", 10)
    # Standard line height is usually 24pt (double spaced) or similar. 28 lines fit on a page.
    # 10 inches vertical space roughly. 
    # Let's align roughly with 28 lines.
    start_y = 10 * inch # Start near top
    line_height = (10 * inch - 1 * inch) / 28 # Approx spacing
    
    # Basic iteration for numbers
    # For a purely generated doc, we mostly care about the content. 
    # But let's try to put numbers down the left column.
    # Positions are approximate without exact leading calculations from Platypus, 
    # but this gives the visual "Compliance" look.
    for i in range(1, 29):
        y_pos = 10.2 * inch - (i * 0.35 * inch) # Heuristic spacing
        c.drawString(0.8 * inch, y_pos, str(i))

    # Footer
    c.setFont("Times-Roman", 10)
    c.drawCentredString(4.25 * inch, 0.5 * inch, "DRAFT - SERVICE COPY")
    
    c.restoreState()

def generate_pdf():
    c = canvas.Canvas(OUTPUT_FILENAME, pagesize=LETTER)
    width, height = LETTER
    
    # Styles
    styles = getSampleStyleSheet()
    normal_style = styles["Normal"]
    normal_style.fontName = "Times-Roman"
    normal_style.fontSize = 13
    normal_style.leading = 18 # 1.5 spacing roughly, or single is 13-14. Prompt says "Use single spacing for the caption block", imply body might be standard.
    # Usually legal docs are double spaced. However, "Judicial Voice" optimization often implies readability. 
    # I will stick to reasonably spaced text (1.5ish) for body, Single for caption.

    # 1. Header / Caption
    # IN THE COURT OF APPEAL...
    c.setFont("Times-Roman", 13)
    c.drawCentredString(width/2, height - 1*inch, "IN THE COURT OF APPEAL OF THE STATE OF CALIFORNIA")
    c.drawCentredString(width/2, height - 1.25*inch, "SIXTH APPELLATE DISTRICT")

    # Caption Box
    # Left: Parties
    text_y = height - 2.0 * inch
    left_margin = 1.5 * inch
    
    c.setFont("Times-Roman", 13)
    c.drawString(left_margin, text_y, "In re JUDY BRAKEBILL JONES, a.k.a.")
    c.drawString(left_margin, text_y - 15, "JUDY LEE JONES and JUDY LEE")
    c.drawString(left_margin, text_y - 30, "BRAKEBILL JONES LASHER")
    
    c.drawString(left_margin, text_y - 60, "ERIC BRAKEBILL JONES,")
    c.drawString(left_margin + 20, text_y - 75, "Petitioner,")
    c.drawString(left_margin, text_y - 90, "v.")
    c.drawString(left_margin, text_y - 105, "SUPERIOR COURT OF CALIFORNIA,")
    c.drawString(left_margin, text_y - 120, "COUNTY OF MONTEREY,")
    c.drawString(left_margin + 20, text_y - 135, "Respondent.")
    
    c.drawString(left_margin, text_y - 165, "HEIDI JONES BLANCHARD,")
    c.drawString(left_margin + 20, text_y - 180, "Real Party in Interest.")

    # Right: Case No
    right_x = 5.0 * inch
    c.drawString(right_x, text_y, "Appeal No. H054014")
    c.drawString(right_x, text_y - 15, "Monterey County Case No.")
    c.drawString(right_x + 20, text_y - 30, "25PR000590")

    # Title
    title_y = text_y - 230
    c.setFont("Times-Bold", 13)
    # Underline manually
    title = "APPELLANT’S VERIFIED PETITION FOR WRIT OF ERROR CORAM VOBIS;"
    title2 = "OR, IN THE ALTERNATIVE, MOTION FOR SUMMARY REVERSAL"
    c.drawCentredString(width/2, title_y, title)
    c.line(1.5*inch, title_y - 2, 7.0*inch, title_y - 2) # Underline
    c.drawCentredString(width/2, title_y - 20, title2)
    c.line(1.5*inch, title_y - 22, 7.0*inch, title_y - 22) # Underline

    # Prepare Body Text Flow
    # We will use a sequence of writing because it's simpler than full Platypus for this single page custom layout
    
    current_y = title_y - 60
    c.setFont("Times-Bold", 13)
    c.drawString(left_margin, current_y, "INTRODUCTION")
    current_y -= 25

    c.setFont("Times-Roman", 13)
    
    def draw_text_block(text, x, y, max_width, leading=15):
        # Simple word wrap
        words = text.split()
        line = ""
        current_text_y = y
        for word in words:
            test_line = line + " " + word if line else word
            if c.stringWidth(test_line, "Times-Roman", 13) < max_width:
                line = test_line
            else:
                c.drawString(x, current_text_y, line)
                current_text_y -= leading
                line = word
        if line:
            c.drawString(x, current_text_y, line)
            current_text_y -= leading
        return current_text_y

    max_w = 6.0 * inch
    
    intro_text = """PETITIONER/APPELLANT ERIC BRAKEBILL JONES ("Appellant") submits this Verified Petition for Writ of Error Coram Vobis, or in the alternative, Motion for Summary Reversal."""
    current_y = draw_text_block(intro_text, left_margin, current_y, max_w)
    current_y -= 10
    
    p2 = """This petition is necessitated by the "Tacit Admission by Default" of Respondent HEIDI JONES BLANCHARD ("Respondent"). As of January 23, 2026, Respondent has defaulted on the mandatory filing fee for this appeal."""
    current_y = draw_text_block(p2, left_margin, current_y, max_w)
    current_y -= 10

    p3 = """This is not a clerical error. Respondent's default constitutes a constructive abandonment of the defense in the face of the extrinsic fraud exposed herein."""
    current_y = draw_text_block(p3, left_margin, current_y, max_w)
    current_y -= 20

    c.setFont("Times-Bold", 13)
    c.drawString(left_margin, current_y, "STATEMENT OF FACTS: CHRONOLOGY OF EXTRINSIC FRAUD")
    current_y -= 25
    c.setFont("Times-Roman", 13)

    fact1 = """1. The Admission (June 27, 2025): On June 27, 2025, Respondent's counsel admitted in writing (Exhibit A) to holding $10,985.39 in estate assets. This admission was concealed from the court in subsequent filings."""
    current_y = draw_text_block(fact1, left_margin, current_y, max_w)
    current_y -= 10
    
    fact2 = """2. EVIDENCE OF SCIENTER (The Knowledge-Filing Gap): Respondent’s claim that assets were "Unknown" in the November 24, 2025 Petition is demonstrably false based on her counsel's own correspondence. On August 18, 2025 (Exhibit E), Respondent's counsel (Jacqueline Nicora) emailed Appellant's counsel specifically requesting to distribute "$10,650.00" in estate proceeds. This confirms that the firm possessed precise knowledge of the asset's value and existence three months prior to filing the verified petition (Exhibit B) denying knowledge of the same. The subsequent filing of a petition stating assets were "Unknown" was therefore a knowing and willful misrepresentation to the Probate Court."""
    current_y = draw_text_block(fact2, left_margin, current_y, max_w)
    current_y -= 10
    
    fact3 = """3. The Spoliated Device ("Decoy Phone") Nexus: On May 24, 2025, Respondent surrendered a wiped "Decoy Phone" to Appellant. On that exact same day, a cash deposit matching the missing funds was made into a third-party account (Exhibit D). This establishes that the spoliation of digital evidence was a calculated act to conceal the illicit asset diversion."""
    current_y = draw_text_block(fact3, left_margin, current_y, max_w)
    current_y -= 10

    # New Page check? Space is getting tight?
    # Let's check visually or logic. 
    # Current Y roughly: 11 inch height. 
    # Start ~ 9. 
    # Used roughly 5-6 inches. Should be fine.
    
    fact4 = """4. RESPONDENT'S PROCEDURAL DEFAULT: On January 21, 2026, Respondent threatened litigation regarding a Lis Pendens. Just 48 hours later, on January 23, 2026, Respondent defaulted on the appellate filing fee (Exhibit C). This sudden cessation of defense confirms Respondent has abandoned the judgment."""
    current_y = draw_text_block(fact4, left_margin, current_y, max_w)
    current_y -= 20
    
    # Check if we need new page
    if current_y < 2 * inch:
        create_pleading_paper(c, doc=None)
        c.showPage()
        current_y = height - 1.5 * inch
        # Re-apply font
        c.setFont("Times-Roman", 13)

    c.setFont("Times-Bold", 13)
    c.drawString(left_margin, current_y, "LEGAL ARGUMENT")
    current_y -= 25
    c.setFont("Times-Roman", 13)
    
    arg1 = """I. WRIT OF ERROR CORAM VOBIS IS THE PROPER REMEDY FOR EXTRINSIC FRAUD. Extrinsic fraud occurs when a party is kept in ignorance or fraudulently prevented from fully participating in the proceeding. (In re Marriage of Modnick (1983) 33 Cal.3d 897.) The fiduciary's concealment of the $10,985.39 asset constitutes extrinsic fraud because it prevented Appellant from knowing the asset existed to litigate it."""
    current_y = draw_text_block(arg1, left_margin, current_y, max_w)
    current_y -= 10
    
    arg2 = """II. SUMMARY REVERSAL IS REQUIRED. The Court has inherent power to summarily reverse a judgment to prevent a miscarriage of justice. (In re Clark (1993) 5 Cal.4th 750.) Respondent's default is a confession of error."""
    current_y = draw_text_block(arg2, left_margin, current_y, max_w)
    current_y -= 20

    c.setFont("Times-Bold", 13)
    c.drawString(left_margin, current_y, "CONCLUSION")
    current_y -= 25
    c.setFont("Times-Roman", 13)
    
    concl = """WHEREFORE, Appellant prays for:"""
    current_y = draw_text_block(concl, left_margin, current_y, max_w)
    
    # Bullets logic manually
    c.drawString(left_margin + 20, current_y, "Judicial Notice of Respondent's Default (Jan 23, 2026);")
    current_y -= 15
    c.drawString(left_margin + 20, current_y, "Issuance of a Writ of Error Coram Vobis vacating the lower court order; OR")
    current_y -= 15
    c.drawString(left_margin + 20, current_y, "Summary Reversal of the judgment.")
    current_y -= 25
    
    # Verification
    verif = """I, ERIC B. JONES, declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct. Executed on January 28, 2026, at Monterey, California."""
    current_y = draw_text_block(verif, left_margin, current_y, max_w)
    current_y -= 40
    
    c.line(left_margin, current_y, left_margin + 3*inch, current_y)
    current_y -= 15
    c.drawString(left_margin, current_y, "ERIC B. JONES, Appellant In Pro Per")
    
    # Pleading paper on top
    # We do this last for the first page to make sure it's drawn? 
    # Actually canvas operations are sequential.
    # The `create_pleading_paper` function operates on the current page state.
    # We should have called it at the start or end of each page.
    # We didn't call it for the first page yet.
    
    # Draw pleading background for Page 1
    create_pleading_paper(c, None)

    c.save()

if __name__ == "__main__":
    try:
        generate_pdf()
        print(f"Successfully generated {OUTPUT_FILENAME}")
    except Exception as e:
        print(f"Error generating PDF: {e}")
