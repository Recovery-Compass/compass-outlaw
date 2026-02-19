#!/usr/bin/env python3
"""
================================================================================
EX PARTE APPLICATION TO SET ASIDE FEBRUARY 17, 2026 RULING
AND RESET HEARING ON DEMURRER

Case:     Gary Kearney vs Eric Brakebill Jones, et al. (26PDUD00325)
Court:    Superior Court of California — County of Los Angeles, Pasadena
Dept:     R
Engine:   generate_ca_pleading_v1.PleadingEngine

GEOMETRIC ALIGNMENT: Inherits zero-drift grid from PleadingEngine.
All text is snapped to 28-line pleading paper with left rail at x=85.
================================================================================
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "PYTHON", "LETHAL"))

from generate_ca_pleading_v1 import (
    PleadingEngine,
    PleadingConfig,
    FONT_BOLD,
    FONT_ROMAN,
    FONT_ITALIC,
    FONT_SIZE,
    MARGIN_LEFT,
    PAGE_WIDTH,
    MARGIN_RIGHT,
    LEFT_RAIL_X,
    RIGHT_RAIL_X,
    CENTER_SEP_X,
    create_exhibit_tab,
    merge_filing_packet,
)
from reportlab.lib.units import inch
from pypdf import PdfReader, PdfWriter
import io


# ==============================================================================
# CONFIGURATION
# ==============================================================================

def build_config() -> PleadingConfig:
    """Populate PleadingConfig for Kearney v. Jones Ex Parte (Set Aside)."""
    cfg = PleadingConfig()

    # --- FILER ---
    cfg.filer_name       = "ERIC BRAKEBILL JONES"
    cfg.filer_address    = "5634 Noel Drive"
    cfg.filer_city_state = "Temple City, CA 91780"
    cfg.filer_phone      = "(626) 348-3019"
    cfg.filer_email      = "eric@recovery-compass.org"
    cfg.filer_role       = "Defendant In Pro Per"

    # --- COURT ---
    cfg.court_line1 = "SUPERIOR COURT OF CALIFORNIA"
    cfg.court_line2 = "COUNTY OF LOS ANGELES \u2013 PASADENA COURTHOUSE"

    # --- CAPTION LEFT (UD Style) ---
    # Shifted down 1 line from line 11 to give clearance from top rule
    cfg.caption_left = [
        (12, "GARY KEARNEY,",                        FONT_BOLD),
        (14, "     Plaintiff,",                      FONT_ROMAN),
        (15, "vs.",                                  FONT_ROMAN),
        (16, "ERIC BRAKEBILL JONES; NUHA",           FONT_BOLD),
        (17, "SAYEGH; and DOES 1 TO 100,",           FONT_BOLD),
        (19, "     Defendants.",                     FONT_ROMAN),
    ]

    # --- CAPTION RIGHT ---
    cfg.case_number = "Case No. 26PDUD00325"

    cfg.caption_right_title = [
        (13, "EX PARTE APPLICATION TO SET",          FONT_BOLD, 10),
        (14, "ASIDE FEBRUARY 17, 2026 RULING",       FONT_BOLD, 10),
        (15, "AND RESET HEARING ON DEMURRER;",       FONT_BOLD, 10),
        (16, "MEMORANDUM OF POINTS AND",              FONT_BOLD, 10),
        (17, "AUTHORITIES; DECLARATION OF",           FONT_BOLD, 10),
        (18, "ERIC JONES AND NUHA SAYEGH",            FONT_BOLD, 10),
    ]

    cfg.caption_right_subtitle = [
        (20, "[C.C.P. \u00a7 473(b); CRC 3.1200",     FONT_BOLD, 9),
        (21, " et seq.]",                            FONT_BOLD, 9),
    ]

    # --- HEARING INFO ---
    cfg.hearing_info = {
        "Date":  "February 20, 2026 (Friday)",
        "Time":  "8:30 AM",
        "Dept":  "R",
        "Judge": "Hon. Judge Presiding",
    }

    # --- FOOTER ---
    cfg.footer_text = "EX PARTE APPLICATION \u2013 SET ASIDE RULING (CCP \u00a7 473(b))"

    # --- OUTPUT ---
    cfg.output_dir  = os.path.dirname(os.path.abspath(__file__))
    cfg.output_name = "EX_PARTE_SET_ASIDE_v2.pdf"
    cfg.total_pages = 8

    return cfg


# ==============================================================================
# DOCUMENT BUILDER
# ==============================================================================

def build_document():
    """Build the complete Ex Parte Application to Set Aside Ruling."""
    cfg = build_config()
    engine = PleadingEngine(cfg)
    c = engine.canvas
    ind = 0.3 * inch    # Standard paragraph indent
    ind2 = 0.6 * inch   # Double indent for sub-items

    # ==================================================================
    # PAGE 1 — Caption (manual draw to fix line-11 spacing)
    # ==================================================================
    engine.begin_page()
    c = engine.canvas
    cfg = engine.config

    # --- Filer Info (Lines 1-6) ---
    c.setFont(FONT_ROMAN, FONT_SIZE)
    filer = [cfg.filer_name, cfg.filer_address, cfg.filer_city_state,
             cfg.filer_phone, cfg.filer_email]
    for i, txt in enumerate(filer, 1):
        c.drawString(MARGIN_LEFT, engine.gy(i), txt)
    c.setFont(FONT_ITALIC, FONT_SIZE)
    c.drawString(MARGIN_LEFT, engine.gy(6), cfg.filer_role)

    # --- Court Info (Lines 8-9) ---
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawCentredString(PAGE_WIDTH / 2, engine.gy(8), cfg.court_line1)
    c.drawCentredString(PAGE_WIDTH / 2, engine.gy(9), cfg.court_line2)

    # --- Caption Box (Lines 11-22) ---
    c.saveState()
    c.setLineWidth(0.5)
    cap_top = engine.gy(11) + 14   # 14pt above baseline = proper clearance
    cap_bot = engine.gy(22.5)
    c.line(LEFT_RAIL_X, cap_top, RIGHT_RAIL_X, cap_top)
    c.line(LEFT_RAIL_X, cap_bot, RIGHT_RAIL_X, cap_bot)
    c.line(CENTER_SEP_X, cap_top, CENTER_SEP_X, cap_bot)
    c.restoreState()

    # Left side: parties (shifted to start at line 12)
    for ln, txt, font in cfg.caption_left:
        c.setFont(font, FONT_SIZE)
        c.drawString(MARGIN_LEFT, engine.gy(ln), txt)

    # Right side: Case number on line 12 (NOT 11)
    info_x = CENTER_SEP_X + 10
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawString(info_x, engine.gy(12), cfg.case_number)

    # Right side: Document title (shifted)
    for ln, txt, font, size in cfg.caption_right_title:
        c.setFont(font, size)
        c.drawString(info_x, engine.gy(ln), txt)

    # Right side: Subtitle
    if cfg.caption_right_subtitle:
        for ln, txt, font, size in cfg.caption_right_subtitle:
            c.setFont(font, size)
            c.drawString(info_x, engine.gy(ln), txt)

    # --- Hearing Info (Lines 23-26) ---
    c.setFont(FONT_ROMAN, FONT_SIZE)
    hearing_line = 23
    for label, value in cfg.hearing_info.items():
        c.drawString(MARGIN_LEFT, engine.gy(hearing_line),
                     f"{label}:  {value}")
        hearing_line += 1
    # Lines 27-28 reserved. Body starts on Page 2.

    # ==================================================================
    # PAGE 2 — Notice + Grounds
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_bold(ln, "TO PLAINTIFF GARY KEARNEY AND HIS ATTORNEY OF")
    ln += 1
    engine.text_bold(ln, "RECORD, BRIAN HECKMANN:")
    ln += 2

    ln = engine.text_wrapped(
        "PLEASE TAKE NOTICE that on February 20, 2026, at 8:30 A.M., or "
        "as soon thereafter as the matter may be heard in Department R of "
        "the above-entitled court, Defendants ERIC JONES and NUHA SAYEGH "
        "will, and hereby do, move this Court for an order setting aside "
        "the ruling made on February 17, 2026, which overruled "
        "Defendants\u2019 Demurrer and ordered an Answer within 5 days.",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "I. GROUNDS FOR THIS APPLICATION")
    ln += 1

    ln = engine.text_wrapped(
        "This application is made on the grounds that Defendants\u2019 failure "
        "to appear at the February 17, 2026 hearing was the direct result "
        "of clear clerical error and misinformation provided by the Court "
        "itself. Specifically, the conformed copy of the Demurrer returned "
        "to Defendants bore a handwritten hearing date of \u201c2/19/26,\u201d not "
        "2/17/26. (See Exhibit A, attached hereto.)",
        ln, indent=ind
    )

    ln += 1
    ln = engine.text_wrapped(
        "Relief is mandatory under Code of Civil Procedure \u00a7 473(b) when "
        "a party\u2019s default or dismissal is caused by effective mistake, "
        "inadvertence, surprise, or excusable neglect\u2014especially when "
        "that \u201csurprise\u201d is a conflicting hearing date issued by the "
        "Court Clerk.",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 3 — Relief Requested + Basis
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_bold(ln, "II. RELIEF REQUESTED")
    ln += 1

    engine.text(ln, "Defendants request that the Court:", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "1.  Set aside the Minute Order of February 17, 2026;",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "2.  Reset the Hearing on Demurrer for a future date (or hear "
        "it instanter on February 20, 2026);",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "3.  Stay any time to file an Answer pending the hearing on "
        "the merits of the Demurrer.",
        ln, indent=ind2
    )

    ln += 1
    ln = engine.text_wrapped(
        "This application is based on this notice, the attached "
        "Memorandum of Points and Authorities, the Declaration of "
        "Eric Jones and Nuha Sayegh, the attached Exhibit A (Conformed "
        "Copy with 2/19 Date), and the papers and records on file in "
        "this action.",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 4 — Memorandum of Points and Authorities
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_centered(ln, "MEMORANDUM OF POINTS AND AUTHORITIES")
    ln += 2

    engine.text_bold(ln, "I. INTRODUCTION")
    ln += 1

    ln = engine.text_wrapped(
        "This case presents a classic instance of \u201csurprise\u201d and "
        "\u201cexcusable neglect\u201d warranting mandatory relief under CCP "
        "\u00a7 473(b). Defendants filed a timely Demurrer on February 6, "
        "2026. The Court Clerk returned the conformed copy of the face "
        "page with a handwritten hearing date of February 19, 2026. "
        "Relying on this official Court instruction, Defendants prepared "
        "to appear on February 19.",
        ln, indent=ind
    )

    ln += 1
    ln = engine.text_wrapped(
        "However, the Court held the hearing on February 17, 2026\u2014two "
        "days early\u2014and overruled the Demurrer in Defendants\u2019 absence. "
        "The Minute Order of February 17, 2026 itself confirms: "
        "\u201cOn the Court\u2019s own motion, the Hearing on Demurrer \u2013 without "
        "Motion to Strike scheduled for 02/19/2026 is advanced to this "
        "date and vacated.\u201d This is dispositive: the Court\u2019s own record "
        "confirms the original hearing date was February 19, which is "
        "exactly what the Clerk wrote on Defendants\u2019 conformed copy.",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "II. RELIEF IS MANDATORY UNDER CCP \u00a7 473(b)")
    ln += 1

    ln = engine.text_wrapped(
        "\u201cThe court shall, whenever an application for relief is made "
        "no more than six months after entry of judgment, is in proper "
        "form, and is accompanied by an attorney\u2019s sworn affidavit "
        "attesting to his or her mistake, inadvertence, surprise, or "
        "neglect, vacate any (1) resulting default entered by the clerk "
        "against his or her client, and which will result in entry of a "
        "default judgment . . .\u201d (CCP \u00a7 473(b).)",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 4 — Memorandum (cont.) + Declaration
    # ==================================================================
    engine.begin_page()

    ln = 1
    ln = engine.text_wrapped(
        "The word \u201cshall\u201d is mandatory. Here, the \u201csurprise\u201d is "
        "objective and documented: The Clerk wrote \u201c2/19/26\u201d on the "
        "filing. It is legally impossible for defendants to be expected "
        "to appear on a date different from the one written on their "
        "conformed copy by the Court\u2019s own Clerk.",
        ln, indent=ind
    )

    ln += 1
    ln = engine.text_wrapped(
        "Additionally, the Minute Order confirms the hearing was "
        "advanced from 02/19/2026 to 02/17/2026 \u201con the Court\u2019s own "
        "motion.\u201d Defendants received no notice of this advancement. A "
        "party cannot be penalized for obeying the written instruction "
        "of the Court Clerk when the Court itself advances the hearing "
        "without notice to the affected party.",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "III. CONCLUSION")
    ln += 1

    ln = engine.text_wrapped(
        "For the foregoing reasons, Defendants respectfully request "
        "that the Court set aside the February 17, 2026 ruling, reset "
        "the Demurrer hearing to allow for a hearing on the merits, and "
        "stay all deadlines imposed by the vacated ruling.",
        ln, indent=ind
    )

    ln += 2
    engine.text_centered(ln, "DECLARATION OF ERIC JONES AND NUHA SAYEGH")
    ln += 2

    engine.text(ln, "I, ERIC JONES, declare:", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "1.  I am a Defendant in this action. I have personal knowledge "
        "of the facts set forth herein.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "2.  On February 6, 2026, we filed a Demurrer to the Complaint "
        "in this action.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "3.  Upon filing, the Court Clerk returned a conformed copy of "
        "the Demurrer face page to us.",
        ln, indent=ind2
    )

    # ==================================================================
    # PAGE 5 — Declaration (cont.) + Perjury + Signatures
    # ==================================================================
    engine.begin_page()

    ln = 1
    ln = engine.text_wrapped(
        "4.  On this conformed copy, the Clerk clearly hand-wrote the "
        "hearing date as \u201c02/19/2026.\u201d A true and correct copy of this "
        "document is attached hereto as Exhibit A.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "5.  Relying on this date, we cleared our schedules to appear "
        "on February 19, 2026.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "6.  We were shocked to discover on the online court portal "
        "that a hearing was held on February 17, 2026, and a ruling "
        "was issued against us for non-appearance.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "7.  Our failure to appear on February 17 was solely due to "
        "our reliance on the handwritten date of February 19 provided "
        "by the Court Clerk.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "8.  The Minute Order itself confirms: \u201cthe Hearing on Demurrer "
        "\u2013 without Motion to Strike scheduled for 02/19/2026 is "
        "advanced to this date and vacated.\u201d This confirms the original "
        "hearing date was 02/19/2026, consistent with our conformed copy.",
        ln, indent=ind2
    )

    ln = engine.text_wrapped(
        "9.  I provided notice of this Ex Parte Application to "
        "Plaintiff\u2019s attorney, Brian Heckmann, by email on "
        "February 19, 2026, before 10:00 A.M.",
        ln, indent=ind2
    )

    ln += 1
    ln = engine.text_wrapped(
        "I declare under penalty of perjury under the laws of the "
        "State of California that the foregoing is true and correct.",
        ln
    )

    ln += 1
    engine.draw_execution_line(ln, "February 19, 2026")
    ln += 2

    engine.draw_signature(ln, name="ERIC BRAKEBILL JONES", title="Defendant In Pro Per")
    ln += 3

    engine.draw_signature(ln, name="NUHA SAYEGH", title="Defendant In Pro Per")

    # ==================================================================
    # PAGE 6 — [PROPOSED] ORDER
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_centered(ln, "[PROPOSED] ORDER")
    ln += 1
    engine.text_centered(
        ln,
        "SETTING ASIDE FEBRUARY 17, 2026 RULING AND"
    )
    ln += 1
    engine.text_centered(
        ln,
        "RESETTING HEARING ON DEMURRER"
    )
    ln += 2

    ln = engine.text_wrapped(
        "The Ex Parte Application of Defendants Eric Brakebill Jones "
        "and Nuha Sayegh to set aside the ruling of February 17, 2026, "
        "having come before the Court, and good cause appearing therefor:",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "IT IS HEREBY ORDERED THAT:")
    ln += 1

    ln = engine.text_wrapped(
        "1.  The Minute Order of February 17, 2026, overruling "
        "Defendants\u2019 Demurrer, is hereby SET ASIDE;",
        ln, indent=ind
    )

    ln = engine.text_wrapped(
        "2.  The Hearing on Demurrer \u2013 Without Motion to Strike is "
        "hereby RESET to __________________ at _______ in "
        "Department R;",
        ln, indent=ind
    )

    ln = engine.text_wrapped(
        "3.  All deadlines arising from the February 17, 2026 ruling, "
        "including the 5-day order to Answer, are hereby STAYED "
        "pending the reset hearing;",
        ln, indent=ind
    )

    ln = engine.text_wrapped(
        "4.  Counsel for Plaintiff shall give notice of entry of "
        "this order.",
        ln, indent=ind
    )

    ln += 2
    engine.text(ln, "DATED: ___________________")
    ln += 2

    engine.draw_judge_signature(
        ln,
        "Hon. Judge Presiding, Dept R",
        right_align=True
    )

    # --- SAVE BODY ---
    output = engine.save()

    # ==================================================================
    # EXHIBIT MERGER — Attach the stamped Demurrer with 2/19 date
    # ==================================================================
    script_dir = os.path.dirname(os.path.abspath(__file__))
    exhibit_path = os.path.join(
        script_dir, "..", "DEMURRER_FEB_19_STAMPED",
        "KEARNEY_SAYEGH_DEMURRER_02_19_2026_STAMPED.pdf"
    )

    if os.path.exists(exhibit_path):
        print("Attaching Exhibit A (Stamped Demurrer with 2/19 date)...")
        body_reader = PdfReader(output)
        exhibit_reader = PdfReader(exhibit_path)
        writer = PdfWriter()

        # Add all body pages
        for p in body_reader.pages:
            writer.add_page(p)

        # Create exhibit tab page if the function exists
        try:
            tab_pdf = create_exhibit_tab("EXHIBIT A")
            tab_reader = PdfReader(tab_pdf)
            for p in tab_reader.pages:
                writer.add_page(p)
        except Exception:
            print("  Note: Exhibit tab not generated (function may not exist).")

        # Add all exhibit pages
        for p in exhibit_reader.pages:
            writer.add_page(p)
        print(f"  Appended {len(exhibit_reader.pages)} exhibit page(s).")

        # Write merged output
        merged_path = os.path.join(
            script_dir, "..", "EX_PARTE_SET_ASIDE_v2.pdf"
        )
        with open(merged_path, "wb") as f:
            writer.write(f)

        total_pages = len(writer.pages)
        print(f"\nMerged PDF: {merged_path} ({total_pages} pages)")
        output = merged_path
    else:
        print(f"WARNING: Exhibit A not found at {exhibit_path}")
        print("  Body-only PDF generated without Exhibit A.")

    print(f"\n{'='*60}")
    print(f"FILED-READY PDF: {output}")
    print(f"Ex Parte: Fri Feb 20, 2026 | 8:30 AM | Dept R")
    print(f"{'='*60}")
    return output


if __name__ == "__main__":
    build_document()
