#!/usr/bin/env python3
"""
================================================================================
CALIFORNIA PLEADING PAPER GENERATOR — v1.0
Based on: generate_demurrer_v32.py "Nuclear Option Grid Alignment Kernel"
Adapted:  Ex Parte Petition (JBJ, Feb 2026)

PURPOSE:  Reusable template for any California Superior Court pleading.
STANDARD: CRC 2.100-2.119 compliant (line-numbered, 28-line grid)
ENGINE:   ReportLab deterministic geometry with 24pt line spacing

USAGE:
    1. Edit the CONFIG dict below with your case/party/document info
    2. Build pages using the PleadingEngine helper methods
    3. Call engine.save() to generate the PDF

    Or import as a module:
        from generate_ca_pleading_v1 import PleadingEngine, PleadingConfig
================================================================================
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import simpleSplit
from pypdf import PdfReader, PdfWriter
import io
import os
import hashlib
from datetime import datetime

# ==============================================================================
# SECTION 1: GEOMETRY CONSTANTS (CRC 2.100-2.119 — DO NOT MODIFY)
# ==============================================================================
# These are the "Golden Grid" constants from generate_demurrer_v32.py.
# Modifying any value will break CRC compliance.

PAGE_WIDTH, PAGE_HEIGHT = letter  # 8.5" x 11" (612 x 792 points)

# Margins (CRC 2.107)
MARGIN_TOP    = 0.9 * inch   # 64.8pt — positions Line 1 baseline
MARGIN_BOTTOM = 0.5 * inch   # 36pt   — footer zone
MARGIN_LEFT   = 1.5 * inch   # 108pt  — left text margin (past line numbers)
MARGIN_RIGHT  = 0.5 * inch   # 36pt   — CRC 2.107 minimum

# Derived
TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT  # 468pt = 6.5 inches

# Vertical Rails (the double-line + right margin rule)
LEFT_RAIL_X   = 1.3 * inch + 2   # 95.6pt — right edge of double rail
RIGHT_RAIL_X  = PAGE_WIDTH - 0.5 * inch  # 576pt — right margin rule

# Caption box center separator
CENTER_SEP_X  = 4.5 * inch  # 324pt — divides left/right caption halves

# Line Grid Engine
LINE_HEIGHT      = 24.0  # Exact 24pt per CRC 2.108 (≥3 lines per vertical inch)
Y_START_BASELINE = PAGE_HEIGHT - MARGIN_TOP - 18  # Line 1 baseline position
MAX_LINES        = 28    # CRC maximum lines per page

# Fonts (CRC 2.105)
FONT_ROMAN  = "Times-Roman"
FONT_BOLD   = "Times-Bold"
FONT_ITALIC = "Times-Italic"
FONT_SIZE   = 12


# ==============================================================================
# SECTION 2: CONFIGURATION — EDIT THIS FOR EACH NEW PLEADING
# ==============================================================================

class PleadingConfig:
    """
    Configuration for a California pleading document.
    Edit this class or pass values to PleadingEngine constructor.
    """

    def __init__(self):
        # --- FILER INFO (Lines 1-6) ---
        self.filer_name       = "ERIC BRAKEBILL JONES"
        self.filer_address    = "5634 Noel Drive"
        self.filer_city_state = "Temple City, CA 91780"
        self.filer_phone      = "(626) 348-3019"
        self.filer_email      = "eric@recovery-compass.org"
        self.filer_role       = "Petitioner and Successor Trustee In Pro Per"
        # Set to None to skip email line (shifts role up)

        # --- COURT INFO (Lines 8-9) ---
        self.court_line1 = "SUPERIOR COURT OF CALIFORNIA"
        self.court_line2 = "COUNTY OF MONTEREY \u2013 PROBATE DIVISION"
        # Common variants:
        #   "COUNTY OF LOS ANGELES \u2013 PASADENA COURTHOUSE"
        #   "COUNTY OF MONTEREY \u2013 PROBATE DIVISION"
        #   "COUNTY OF SAN FRANCISCO"

        # --- CAPTION: LEFT SIDE (Estate/Party info) ---
        # Each tuple: (text, font) where font is one of:
        #   FONT_ROMAN, FONT_BOLD, FONT_ITALIC
        # Line numbers are relative to caption start (line 11)
        self.caption_left = [
            (11, "Estate of:",                FONT_ROMAN),
            (13, "JUDY BRAKEBILL JONES,",     FONT_BOLD),
            (14, "aka JUDY LEE JONES,",       FONT_ROMAN),
            (16, "Decedent.",                 FONT_ROMAN),
        ]
        # For adversarial cases (e.g., unlawful detainer, civil):
        # self.caption_left = [
        #     (11, "GARY W. KEARNEY, an individual,",  FONT_ROMAN),
        #     (13, "Plaintiff,",                       FONT_ROMAN),
        #     (15, "vs.",                              FONT_ROMAN),
        #     (17, "ERIC BRAKEBILL JONES, et al.,",    FONT_ROMAN),
        #     (19, "Defendants.",                      FONT_ROMAN),
        # ]

        # --- CAPTION: RIGHT SIDE ---
        self.case_number = "Case No. 25PR000590"

        # Document title lines (right side of caption box)
        # Each tuple: (line_number, text, font, font_size)
        self.caption_right_title = [
            (13, "EX PARTE PETITION FOR:",             FONT_BOLD, 10),
            (14, "1. SUSPENSION OF POWERS OF",         FONT_BOLD, 10),
            (15, "   EXECUTOR (PROB. CODE \u00a7 9614)",    FONT_BOLD, 10),
            (16, "2. APPOINTMENT OF SPECIAL",           FONT_BOLD, 10),
            (17, "   ADMINISTRATOR WITH GENERAL",       FONT_BOLD, 10),
            (18, "   POWERS (PROB. CODE \u00a7\u00a7 8540,",    FONT_BOLD, 10),
            (19, "   8544)",                            FONT_BOLD, 10),
        ]

        # Subtitle (smaller font, below title — optional)
        self.caption_right_subtitle = [
            (20, "[IMMEDIATE RISK OF WASTE /",          FONT_BOLD, 9),
            (21, " CONSTRUCTIVE ABANDONMENT]",          FONT_BOLD, 9),
        ]

        # --- HEARING INFO (Lines 23-26, below caption box) ---
        # Set to None to skip (e.g., for motions without set hearing)
        self.hearing_info = {
            "Date":  "February 10, 2026",
            "Time":  "8:30 AM",
            "Dept":  "13",
            "Judge": "Hon. Elisabeth K. Mineta",
        }
        # For vector fields (blank lines for clerk to fill):
        # self.hearing_info_vector = True  # Draws underlines instead of values

        # --- FOOTER ---
        self.footer_text = "EX PARTE PETITION \u2013 SUSPENSION & SPECIAL ADMINISTRATION"
        # This appears centered at bottom of every page as:
        # "{footer_text} | Page X of Y"

        # --- SIGNATURE ---
        self.signature_image_path = None  # Path to signature PNG (transparent bg)
        self.signature_width  = 1.8 * inch
        self.signature_height = None  # Auto-calculated from aspect ratio if None
        self.signature_aspect_ratio = 3.10  # Width / Height

        # --- OUTPUT ---
        self.output_dir  = "/home/user/AI_DRIVE_OUTPUT"
        self.output_name = None  # Auto-generated if None
        self.total_pages = 8     # Update after building all pages


# ==============================================================================
# SECTION 3: THE PLEADING ENGINE
# ==============================================================================

class PleadingEngine:
    """
    Core engine for generating CRC-compliant California pleading papers.

    Preserves the exact geometry from generate_demurrer_v32.py:
    - 28-line grid with 24pt line spacing
    - Double vertical rail at 1.3"
    - Right margin rail at PAGE_WIDTH - 0.5"
    - Footer divider line + centered pagination
    - Caption box with center separator

    Usage:
        config = PleadingConfig()
        config.filer_name = "JOHN DOE"
        # ... set other config ...

        engine = PleadingEngine(config)
        engine.begin_page()         # Start page 1
        engine.draw_caption()       # Draw standard caption
        engine.text(23, "Body text starts here")
        engine.begin_page()         # Start page 2
        # ... build remaining pages ...
        engine.save()               # Write PDF
    """

    def __init__(self, config=None, buffer_mode=False):
        """
        Args:
            config: PleadingConfig instance (uses defaults if None)
            buffer_mode: If True, writes to BytesIO instead of file
                         (for merging with exhibits later)
        """
        self.config = config or PleadingConfig()
        self.current_page = 0
        self.buffer_mode = buffer_mode

        if buffer_mode:
            self._buffer = io.BytesIO()
            self.canvas = canvas.Canvas(self._buffer, pagesize=letter)
        else:
            path = self._get_output_path()
            self.canvas = canvas.Canvas(path, pagesize=letter)
            self.output_path = path

        # Compute signature height
        if self.config.signature_height is None and self.config.signature_aspect_ratio:
            self.config.signature_height = (
                self.config.signature_width / self.config.signature_aspect_ratio
            )

    def _get_output_path(self):
        """Generate output path from config or auto-generate."""
        if self.config.output_name:
            return os.path.join(self.config.output_dir, self.config.output_name)
        # Auto-generate: YYYY-MM-DD_DOCUMENT_TITLE.pdf
        date_str = datetime.now().strftime("%Y-%m-%d")
        safe_title = self.config.footer_text.replace(" ", "_")[:50]
        return os.path.join(self.config.output_dir, f"{date_str}_{safe_title}.pdf")

    # ------------------------------------------------------------------
    # GEOMETRY HELPERS (from v32 — deterministic, do not modify)
    # ------------------------------------------------------------------

    @staticmethod
    def get_y(line_number):
        """Convert line number (1-28) to Y coordinate on page."""
        return Y_START_BASELINE - ((line_number - 1) * LINE_HEIGHT)

    # Alias for brevity in page-building code
    def gy(self, ln):
        return self.get_y(ln)

    # ------------------------------------------------------------------
    # GRID BACKGROUND (line numbers, rails, footer)
    # ------------------------------------------------------------------

    def draw_grid(self):
        """Draw the standard 28-line grid background for the current page."""
        c = self.canvas
        c.saveState()

        # Line Numbers (1-28, centered at 0.8")
        c.setFont(FONT_ROMAN, 12)
        for i in range(1, 29):
            c.drawCentredString(0.8 * inch, self.gy(i), str(i))

        # Double Vertical Rail (left margin)
        c.setLineWidth(0.5)
        rule_x = 1.3 * inch
        c.line(rule_x - 2, 0, rule_x - 2, PAGE_HEIGHT)  # Left rail
        c.line(rule_x + 2, 0, rule_x + 2, PAGE_HEIGHT)  # Right rail

        # Right Margin Rail
        c.line(RIGHT_RAIL_X, 0, RIGHT_RAIL_X, PAGE_HEIGHT)

        # Footer Divider Line (CRC 2.110)
        footer_line_y = MARGIN_BOTTOM + 15
        c.line(MARGIN_LEFT, footer_line_y, PAGE_WIDTH - MARGIN_RIGHT, footer_line_y)

        # Footer Text (centered)
        c.setFont(FONT_ROMAN, 10)
        footer = (
            f"{self.config.footer_text} | "
            f"Page {self.current_page} of {self.config.total_pages}"
        )
        c.drawCentredString(PAGE_WIDTH / 2, 0.5 * inch, footer)

        c.restoreState()

    # ------------------------------------------------------------------
    # PAGE MANAGEMENT
    # ------------------------------------------------------------------

    def begin_page(self):
        """Start a new page with grid background. Call before adding content."""
        if self.current_page > 0:
            self.canvas.showPage()
        self.current_page += 1
        self.draw_grid()
        return self.current_page

    def finish(self):
        """Finalize the last page (call showPage if needed)."""
        pass  # showPage is called by begin_page or save

    # ------------------------------------------------------------------
    # TEXT PRIMITIVES
    # ------------------------------------------------------------------

    def text(self, line, content, font=FONT_ROMAN, size=FONT_SIZE, indent=0):
        """Draw a single line of text at the given line number."""
        self.canvas.setFont(font, size)
        self.canvas.drawString(MARGIN_LEFT + indent, self.gy(line), content)

    def text_bold(self, line, content, size=FONT_SIZE, indent=0):
        """Draw bold text at line number."""
        self.text(line, content, font=FONT_BOLD, size=size, indent=indent)

    def text_italic(self, line, content, size=FONT_SIZE, indent=0):
        """Draw italic text at line number."""
        self.text(line, content, font=FONT_ITALIC, size=size, indent=indent)

    def text_centered(self, line, content, font=FONT_BOLD, size=FONT_SIZE):
        """Draw centered text (for titles, headers)."""
        self.canvas.setFont(font, size)
        self.canvas.drawCentredString(PAGE_WIDTH / 2, self.gy(line), content)

    def text_wrapped(self, text, start_line, bold=False, italic=False, indent=0):
        """
        Draw word-wrapped text starting at start_line.
        Returns the next available line number after the wrapped text.

        Args:
            text: The text to wrap
            start_line: Starting line number (1-28)
            bold: Use bold font
            italic: Use italic font
            indent: Additional left indent in points

        Returns:
            int: Next available line number
        """
        font = FONT_BOLD if bold else (FONT_ITALIC if italic else FONT_ROMAN)
        self.canvas.setFont(font, FONT_SIZE)
        avail = TEXT_WIDTH - indent
        lines = simpleSplit(text, font, FONT_SIZE, avail)
        cl = start_line
        for l in lines:
            if cl > MAX_LINES:
                print(f"WARNING: Text overflow at line {cl}: {l[:40]}...")
                break
            self.canvas.drawString(MARGIN_LEFT + indent, self.gy(cl), l)
            cl += 1
        return cl

    def rich_line(self, line, parts, indent=0):
        """
        Draw a line with mixed fonts (roman, bold, italic).

        Args:
            line: Line number
            parts: List of (text, font) tuples.
                   font = FONT_ROMAN | FONT_BOLD | FONT_ITALIC | None (=Roman)
            indent: Additional left indent

        Example:
            engine.rich_line(4, [
                ("Under ", FONT_ROMAN),
                ("Estate of Feeney", FONT_ITALIC),
                (" (1983), the Court held...", FONT_ROMAN),
            ])
        """
        c = self.canvas
        cx = MARGIN_LEFT + indent
        for txt, font in parts:
            if not font:
                font = FONT_ROMAN
            c.setFont(font, FONT_SIZE)
            c.drawString(cx, self.gy(line), txt)
            cx += c.stringWidth(txt, font, FONT_SIZE)

    # ------------------------------------------------------------------
    # CAPTION BLOCK (Lines 1-26, standard layout)
    # ------------------------------------------------------------------

    def draw_caption(self):
        """
        Draw the complete caption block:
        - Filer info (lines 1-6)
        - Court info (lines 8-9)
        - Caption box with parties and case info (lines 11-22)
        - Hearing info (lines 23-26)
        """
        c = self.canvas
        cfg = self.config

        # --- Filer Info (Lines 1-6) ---
        c.setFont(FONT_ROMAN, FONT_SIZE)
        filer_lines = [
            cfg.filer_name,
            cfg.filer_address,
            cfg.filer_city_state,
            cfg.filer_phone,
        ]
        if cfg.filer_email:
            filer_lines.append(cfg.filer_email)

        for i, line_text in enumerate(filer_lines, 1):
            c.drawString(MARGIN_LEFT, self.gy(i), line_text)

        # Role line (italic) — goes on the line after the last info line
        role_line = len(filer_lines) + 1
        c.setFont(FONT_ITALIC, FONT_SIZE)
        c.drawString(MARGIN_LEFT, self.gy(role_line), cfg.filer_role)

        # --- Court Info (Lines 8-9) ---
        c.setFont(FONT_BOLD, FONT_SIZE)
        c.drawCentredString(PAGE_WIDTH / 2, self.gy(8), cfg.court_line1)
        c.drawCentredString(PAGE_WIDTH / 2, self.gy(9), cfg.court_line2)

        # --- Caption Box (Lines 11-22) ---
        c.saveState()
        c.setLineWidth(0.5)
        cap_top = self.gy(11) + 10
        cap_bot = self.gy(22.5)
        c.line(LEFT_RAIL_X, cap_top, RIGHT_RAIL_X, cap_top)    # Top rule
        c.line(LEFT_RAIL_X, cap_bot, RIGHT_RAIL_X, cap_bot)    # Bottom rule
        c.line(CENTER_SEP_X, cap_top, CENTER_SEP_X, cap_bot)   # Center divider
        c.restoreState()

        # Left side (parties)
        for ln, txt, font in cfg.caption_left:
            c.setFont(font, FONT_SIZE)
            c.drawString(MARGIN_LEFT, self.gy(ln), txt)

        # Right side: Case number
        info_x = CENTER_SEP_X + 10
        c.setFont(FONT_BOLD, FONT_SIZE)
        c.drawString(info_x, self.gy(11), cfg.case_number)

        # Right side: Document title
        for ln, txt, font, size in cfg.caption_right_title:
            c.setFont(font, size)
            c.drawString(info_x, self.gy(ln), txt)

        # Right side: Subtitle (optional)
        if cfg.caption_right_subtitle:
            for ln, txt, font, size in cfg.caption_right_subtitle:
                c.setFont(font, size)
                c.drawString(info_x, self.gy(ln), txt)

        # --- Hearing Info (Lines 23-26) ---
        if cfg.hearing_info:
            c.setFont(FONT_ROMAN, FONT_SIZE)
            hearing_line = 23
            for label, value in cfg.hearing_info.items():
                c.drawString(MARGIN_LEFT, self.gy(hearing_line),
                             f"{label}:  {value}")
                hearing_line += 1

    # ------------------------------------------------------------------
    # VECTOR FIELDS (blank lines for clerk-assigned values)
    # ------------------------------------------------------------------

    def draw_vector_field(self, label, line, x_offset=0):
        """Draw a label with an underline for clerk to fill in."""
        c = self.canvas
        x = MARGIN_LEFT + x_offset
        field_x = x + 0.6 * inch
        c.setFont(FONT_ROMAN, FONT_SIZE)
        c.drawString(x, self.gy(line), label)
        c.saveState()
        c.setLineWidth(0.5)
        c.line(field_x, self.gy(line) - 4, field_x + 1.5 * inch, self.gy(line) - 4)
        c.restoreState()

    # ------------------------------------------------------------------
    # SIGNATURE BLOCKS
    # ------------------------------------------------------------------

    def draw_signature(self, line, name="Eric Brakebill Jones", title="Petitioner"):
        """
        Draw a signature block at the given line number.
        If config.signature_image_path is set, embeds the signature image.

        Args:
            line: Line number where the horizontal rule goes
            name: Typed name below the signature
            title: Role/title below the name (None to skip)

        Returns:
            int: Next available line number
        """
        c = self.canvas
        cfg = self.config
        rule_y = self.gy(line)

        # Embed signature image (if configured)
        if cfg.signature_image_path and os.path.exists(cfg.signature_image_path):
            sig_h = cfg.signature_height or (cfg.signature_width / 3.10)
            c.drawImage(
                cfg.signature_image_path,
                MARGIN_LEFT + 4, rule_y + 2,
                width=cfg.signature_width, height=sig_h,
                mask='auto'
            )

        # Horizontal signature rule
        c.saveState()
        c.setLineWidth(0.5)
        c.line(MARGIN_LEFT, rule_y, MARGIN_LEFT + 2.5 * inch, rule_y)
        c.restoreState()

        # Typed name
        c.setFont(FONT_BOLD, FONT_SIZE)
        c.drawString(MARGIN_LEFT, self.gy(line + 1), name)

        # Title/role
        if title:
            c.setFont(FONT_ROMAN, FONT_SIZE)
            c.drawString(MARGIN_LEFT, self.gy(line + 2), title)
            return line + 3

        return line + 2

    def draw_judge_signature(self, line, judge_name, right_align=True):
        """
        Draw a judicial signature block (for proposed orders).

        Args:
            line: Line number for the signature rule
            judge_name: Judge's name
            right_align: If True, right-aligns the block

        Returns:
            int: Next available line number
        """
        c = self.canvas
        sig_len = 3.0 * inch

        if right_align:
            sx = PAGE_WIDTH - MARGIN_RIGHT - sig_len
        else:
            sx = MARGIN_LEFT

        c.saveState()
        c.setLineWidth(0.5)
        c.line(sx, self.gy(line), sx + sig_len, self.gy(line))
        c.restoreState()

        c.setFont(FONT_BOLD, FONT_SIZE)
        c.drawString(sx, self.gy(line + 1), judge_name)
        c.setFont(FONT_ROMAN, FONT_SIZE)
        c.drawString(sx, self.gy(line + 2), "Judge of the Superior Court")

        return line + 3

    # ------------------------------------------------------------------
    # PERJURY DECLARATION (reusable block)
    # ------------------------------------------------------------------

    def draw_perjury_clause(self, start_line):
        """
        Draw the standard perjury declaration.
        Returns next available line.
        """
        return self.text_wrapped(
            "I declare under penalty of perjury under the laws of the State "
            "of California that the foregoing is true and correct.",
            start_line
        )

    def draw_execution_line(self, line, date_str, city="Temple City", state="California"):
        """Draw 'Executed on [date], at [city], [state].'"""
        self.text(line, f"Executed on {date_str}, at {city}, {state}.")

    # ------------------------------------------------------------------
    # OUTPUT / SAVE
    # ------------------------------------------------------------------

    def save(self):
        """Save the PDF. Returns the output path or BytesIO buffer."""
        self.canvas.save()
        if self.buffer_mode:
            self._buffer.seek(0)
            return self._buffer
        else:
            print(f"PDF generated: {self.output_path}")
            return self.output_path

    def get_reader(self):
        """Get a PdfReader from the buffer (buffer_mode only)."""
        if not self.buffer_mode:
            raise ValueError("get_reader() only works in buffer_mode")
        buf = self.save()
        return PdfReader(buf)


# ==============================================================================
# SECTION 4: EXHIBIT UTILITIES
# ==============================================================================

def create_exhibit_tab(exhibit_letter, description, case_caption, case_number,
                       document_title):
    """
    Create a single exhibit separator/tab page.

    Args:
        exhibit_letter: "A", "B", "E", etc.
        description: Short description of the exhibit
        case_caption: e.g., "Estate of Judy Brakebill Jones"
        case_number: e.g., "Case No. 25PR000590"
        document_title: e.g., "Ex Parte Petition..."

    Returns:
        PdfReader with 1 page
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)

    # Border
    c.setLineWidth(1.5)
    c.rect(1 * inch, 1 * inch, PAGE_WIDTH - 2 * inch, PAGE_HEIGHT - 2 * inch)

    # Exhibit letter (large)
    c.setFont(FONT_BOLD, 48)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT / 2 + 60,
                        f"EXHIBIT {exhibit_letter}")

    # Horizontal rule
    c.setLineWidth(1)
    c.line(2.5 * inch, PAGE_HEIGHT / 2 + 40,
           PAGE_WIDTH - 2.5 * inch, PAGE_HEIGHT / 2 + 40)

    # Description
    c.setFont(FONT_ROMAN, 14)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT / 2 + 10, description)

    # Case info
    c.setFont(FONT_ROMAN, 11)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT / 2 - 30, case_caption)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT / 2 - 48, case_number)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT / 2 - 66, document_title)

    c.save()
    buf.seek(0)
    return PdfReader(buf)


def merge_filing_packet(petition_reader, exhibits, output_path):
    """
    Merge a petition PDF with tabbed exhibits into a single filing packet.

    Args:
        petition_reader: PdfReader of the petition
        exhibits: List of dicts, each with:
            {
                "letter": "A",
                "description": "Chase Bank Receipt",
                "file_path": "/path/to/exhibit_a.pdf",
                "case_caption": "Estate of Judy Brakebill Jones",
                "case_number": "Case No. 25PR000590",
                "document_title": "Ex Parte Petition...",
            }
        output_path: Where to write the merged PDF

    Returns:
        tuple: (output_path, total_pages, page_map)
    """
    writer = PdfWriter()
    page_map = []

    # Add petition pages
    pet_count = len(petition_reader.pages)
    for p in petition_reader.pages:
        writer.add_page(p)
    page_map.append(("Petition", 1, pet_count))

    current_page = pet_count + 1

    # Add each exhibit with tab separator
    for ex in exhibits:
        # Tab page
        tab = create_exhibit_tab(
            ex["letter"], ex["description"],
            ex["case_caption"], ex["case_number"], ex["document_title"]
        )
        for p in tab.pages:
            writer.add_page(p)
        tab_page = current_page
        current_page += 1

        # Exhibit content
        ex_reader = PdfReader(ex["file_path"])
        ex_start = current_page
        for p in ex_reader.pages:
            writer.add_page(p)
        ex_end = current_page + len(ex_reader.pages) - 1
        current_page = ex_end + 1

        page_map.append((f"Tab {ex['letter']}", tab_page, tab_page))
        page_map.append((f"Exhibit {ex['letter']}", ex_start, ex_end))

    # Write
    with open(output_path, "wb") as f:
        writer.write(f)

    total = len(writer.pages)
    print(f"Filing packet: {output_path} ({total} pages)")
    for label, start, end in page_map:
        if start == end:
            print(f"  {label}: p {start}")
        else:
            print(f"  {label}: pp {start}-{end}")

    return output_path, total, page_map


def compute_sha256(file_path, first_n=8):
    """Compute SHA-256 hash of a file. Returns first N hex chars."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()[:first_n]


# ==============================================================================
# SECTION 5: EXAMPLE — HOW TO BUILD A DOCUMENT
# ==============================================================================

def example_ex_parte():
    """
    Example: Build an Ex Parte Petition using the template engine.
    This demonstrates all the helper methods.
    """
    # --- Configure ---
    cfg = PleadingConfig()
    cfg.footer_text = "EX PARTE PETITION \u2013 SUSPENSION & SPECIAL ADMINISTRATION"
    cfg.total_pages = 8
    cfg.output_name = "EXAMPLE_ExParte.pdf"

    # --- Build ---
    e = PleadingEngine(cfg)
    ind = 0.3 * inch  # Standard paragraph indent

    # Page 1: Caption
    e.begin_page()
    e.draw_caption()

    # Page 2: Body text
    e.begin_page()
    e.text_bold(1, "TO THE HONORABLE JUDGE OF THE SUPERIOR COURT:")
    ln = e.text_wrapped(
        'Petitioner Eric Brakebill Jones ("Petitioner") hereby applies...',
        3
    )
    # ... continue building pages ...

    # Page N: Signature
    # e.draw_perjury_clause(ln)
    # ln += 1
    # e.draw_execution_line(ln, "February 9, 2026")
    # ln += 2
    # e.draw_signature(ln, "Eric Brakebill Jones", "Petitioner")

    path = e.save()
    print(f"Example generated: {path}")


# ==============================================================================
# SECTION 6: QUICK-START DOCUMENT TEMPLATES
# ==============================================================================

def config_for_demurrer(case_no, plaintiff, defendant, court_county):
    """Pre-configured PleadingConfig for a Demurrer."""
    cfg = PleadingConfig()
    cfg.court_line2 = f"COUNTY OF {court_county.upper()}"
    cfg.case_number = f"Case No.: {case_no}"
    cfg.caption_left = [
        (11, f"{plaintiff},",        FONT_ROMAN),
        (13, "Plaintiff,",           FONT_ROMAN),
        (15, "vs.",                   FONT_ROMAN),
        (17, f"{defendant},",        FONT_ROMAN),
        (19, "Defendants.",          FONT_ROMAN),
    ]
    cfg.caption_right_title = [
        (13, "DEMURRER TO COMPLAINT",          FONT_BOLD, 12),
        (14, "[CCP \u00a7\u00a7 430.10(e), 430.10(c)]",  FONT_BOLD, 10),
    ]
    cfg.caption_right_subtitle = []
    cfg.footer_text = "DEMURRER TO COMPLAINT"
    return cfg


def config_for_motion(case_no, motion_title, moving_party, responding_party,
                      court_county):
    """Pre-configured PleadingConfig for a Motion."""
    cfg = PleadingConfig()
    cfg.court_line2 = f"COUNTY OF {court_county.upper()}"
    cfg.case_number = f"Case No.: {case_no}"
    cfg.caption_left = [
        (11, f"{moving_party},",     FONT_ROMAN),
        (13, "Plaintiff/Petitioner,", FONT_ROMAN),
        (15, "vs.",                   FONT_ROMAN),
        (17, f"{responding_party},", FONT_ROMAN),
        (19, "Defendant/Respondent.", FONT_ROMAN),
    ]
    cfg.caption_right_title = [
        (13, motion_title,            FONT_BOLD, 10),
    ]
    cfg.caption_right_subtitle = []
    cfg.footer_text = motion_title
    return cfg


def config_for_declaration(case_no, declarant, court_county, caption_left=None):
    """Pre-configured PleadingConfig for a standalone Declaration."""
    cfg = PleadingConfig()
    cfg.court_line2 = f"COUNTY OF {court_county.upper()}"
    cfg.case_number = f"Case No.: {case_no}"
    if caption_left:
        cfg.caption_left = caption_left
    cfg.caption_right_title = [
        (13, f"DECLARATION OF",       FONT_BOLD, 12),
        (14, declarant.upper(),       FONT_BOLD, 12),
    ]
    cfg.caption_right_subtitle = []
    cfg.footer_text = f"DECLARATION OF {declarant.upper()}"
    return cfg


def config_for_ex_parte(case_no, relief_description, court_county,
                        caption_left=None):
    """Pre-configured PleadingConfig for an Ex Parte Application."""
    cfg = PleadingConfig()
    cfg.court_line2 = f"COUNTY OF {court_county.upper()}"
    cfg.case_number = f"Case No.: {case_no}"
    if caption_left:
        cfg.caption_left = caption_left
    cfg.caption_right_title = [
        (13, "EX PARTE APPLICATION FOR:", FONT_BOLD, 10),
    ]
    # Split relief_description into lines if needed
    lines = simpleSplit(relief_description, FONT_BOLD, 10,
                        PAGE_WIDTH - CENTER_SEP_X - 10 - MARGIN_RIGHT)
    for i, line in enumerate(lines):
        cfg.caption_right_title.append((14 + i, line, FONT_BOLD, 10))
    cfg.caption_right_subtitle = []
    cfg.footer_text = "EX PARTE APPLICATION"
    return cfg


# ==============================================================================
# MAIN
# ==============================================================================

if __name__ == "__main__":
    print("California Pleading Paper Generator v1.0")
    print("========================================")
    print()
    print("This is a template library. Import and use in your scripts:")
    print()
    print("  from generate_ca_pleading_v1 import PleadingEngine, PleadingConfig")
    print("  from generate_ca_pleading_v1 import merge_filing_packet")
    print("  from generate_ca_pleading_v1 import config_for_demurrer")
    print("  from generate_ca_pleading_v1 import config_for_motion")
    print("  from generate_ca_pleading_v1 import config_for_declaration")
    print("  from generate_ca_pleading_v1 import config_for_ex_parte")
    print()
    print("Quick-start configs available:")
    print("  - config_for_demurrer()")
    print("  - config_for_motion()")
    print("  - config_for_declaration()")
    print("  - config_for_ex_parte()")
    print()
    print("Exhibit utilities:")
    print("  - create_exhibit_tab()")
    print("  - merge_filing_packet()")
    print("  - compute_sha256()")
    print()
    print("See docstrings and example_ex_parte() for usage.")
