#!/usr/bin/env python3
import argparse, os, io, datetime, sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from PyPDF2 import PdfReader, PdfWriter

TITLE = "Compendium of Evidence: Complaint Regarding Kathleen A. Hart"
SEP_TITLES = [
    "Exhibit A: Nationwide Systemic Misconduct Research Report",
    "Exhibit B: Systemic Pattern Analysis of Service Calls",
    "Exhibit C: Chronology of Key Communications & Formal Demands",
    "Exhibit D: Declaration Regarding August 27, 2025 Call with Global Security",
    "Exhibit E: Declaration Regarding September 13, 2025 Meeting at El Monte Branch",
]

def make_cover(path, subject, date_str):
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter
    # Title
    c.setFont("Times-Roman", 18)
    c.drawCentredString(width/2, height*0.60, TITLE)
    # Subject and Date
    c.setFont("Times-Roman", 12)
    c.drawCentredString(width/2, height*0.52, f"Subject: {subject}")
    c.drawCentredString(width/2, height*0.48, f"Date: {date_str}")
    c.showPage()
    c.save()

def make_separator(path, text):
    c = canvas.Canvas(path, pagesize=letter)
    width, height = letter
    c.setFont("Times-Roman", 16)
    c.drawCentredString(width/2, height/2, text)
    c.showPage()
    c.save()

def md_to_pdf(md_path, out_pdf_path):
    styles = getSampleStyleSheet()
    normal = ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontName="Times-Roman", fontSize=12, leading=14, spaceAfter=12
    )
    story = []

    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Simple markdown processing - convert to HTML entities and add paragraphs
    import html
    for line in content.splitlines():
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 12))
        else:
            # Escape HTML and convert to paragraph
            escaped = html.escape(stripped)
            story.append(Paragraph(escaped, normal))

    doc = SimpleDocTemplate(out_pdf_path, pagesize=letter,
                          leftMargin=inch, rightMargin=inch, 
                          topMargin=inch, bottomMargin=inch)
    doc.build(story)

def ensure_pdf(file_path, temp_dir):
    if file_path.lower().endswith('.md'):
        pdf_path = os.path.join(temp_dir, os.path.splitext(os.path.basename(file_path))[0] + '.pdf')
        md_to_pdf(file_path, pdf_path)
        return pdf_path
    return file_path

def merge_pdfs(input_paths, output_path):
    writer = PdfWriter()
    for path in input_paths:
        reader = PdfReader(path)
        for page in reader.pages:
            writer.add_page(page)

    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

def add_page_numbers(input_pdf, output_pdf):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()
    total_pages = len(reader.pages)

    for i, page in enumerate(reader.pages, 1):
        # Create a new PDF with the page number
        packet = io.BytesIO()
        c = canvas.Canvas(packet, pagesize=letter)
        width, height = letter
        c.setFont("Times-Roman", 10)
        c.drawCentredString(width/2, 0.5*inch, f"Page {i} of {total_pages}")
        c.save()

        # Move to the beginning of the StringIO buffer
        packet.seek(0)
        overlay = PdfReader(packet)

        # Merge the page with the overlay
        page.merge_page(overlay.pages[0])
        writer.add_page(page)

    with open(output_pdf, 'wb') as output_file:
        writer.write(output_file)

def count_pages(pdf_path):
    return len(PdfReader(pdf_path).pages)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Compendium of Evidence")
    parser.add_argument("exhibits", nargs='+', help="List of exhibit files")
    parser.add_argument("output", help="Output PDF file")
    parser.add_argument("--subject", required=True, help="Subject line")
    parser.add_argument("--date", required=True, help="Date string")

    args = parser.parse_args()

    # Create temporary directory
    temp_dir = "_build_tmp"
    os.makedirs(temp_dir, exist_ok=True)

    # Create cover page
    cover_path = os.path.join(temp_dir, "cover.pdf")
    make_cover(cover_path, args.subject, args.date)

    # Prepare all components
    all_parts = [cover_path]
    exhibit_pdfs = []

    for i, exhibit_path in enumerate(args.exhibits):
        # Create separator page
        sep_path = os.path.join(temp_dir, f"separator_{i+1}.pdf")
        make_separator(sep_path, SEP_TITLES[i])

        # Convert exhibit to PDF if needed
        exhibit_pdf = ensure_pdf(exhibit_path, temp_dir)
        exhibit_pdfs.append(exhibit_pdf)

        # Add separator and exhibit to parts
        all_parts.extend([sep_path, exhibit_pdf])

    # Merge all parts
    merged_path = os.path.join(temp_dir, "merged.pdf")
    merge_pdfs(all_parts, merged_path)

    # Add page numbers
    add_page_numbers(merged_path, args.output)

    print(f"✅ Built: {args.output}")
    for i, exhibit_pdf in enumerate(exhibit_pdfs):
        print(f"   Exhibit {chr(65+i)} pages: {count_pages(exhibit_pdf)}")
    print(f"   Total pages: {count_pages(args.output)}")
