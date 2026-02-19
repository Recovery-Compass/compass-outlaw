#!/usr/bin/env python3
"""
================================================================================
EX PARTE APPLICATION TO SET ASIDE FEBRUARY 17, 2026 RULING
AND RESET HEARING ON DEMURRER -- VERSION 3 (WEAPONIZED)

Case:     Gary Kearney vs Eric Brakebill Jones, et al. (26PDUD00325)
Court:    Superior Court of California — County of Los Angeles, Pasadena
Dept:     R
Engine:   generate_ca_pleading_v1.PleadingEngine

FORCE MULTIPLIERS ADDED:
1. Citation to Au-Yang v. Barton (1999) - Advancing hearing w/o notice is error.
2. "Void Ab Initio" argument (Due Process violation).
3. Duty of Candor challenge to opposing counsel.

GEOMETRY FIXES:
- Manual caption placement.
- Clean separation of footer/hearing info on Page 1.
================================================================================
"""

import sys
import os

# Ensure we can find the lethal engine
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
)
from reportlab.lib.units import inch
from pypdf import PdfReader, PdfWriter

# ==============================================================================
# CONFIGURATION
# ==============================================================================

def build_config() -> PleadingConfig:
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

    # --- CAPTION LEFT ---
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
        (12, "EX PARTE APPLICATION TO SET",          FONT_BOLD, 10),
        (13, "ASIDE VOID RULING OF FEB 17;",         FONT_BOLD, 10), # Aggressive Title
        (14, "MEMORANDUM OF POINTS AND",             FONT_BOLD, 10),
        (15, "AUTHORITIES;",                         FONT_BOLD, 10),
        (16, "DECLARATION OF DEFENDANTS",            FONT_BOLD, 10),
    ]

    cfg.caption_right_subtitle = [
        (18, "[IMMEDIATE RELIEF REQUESTED]",          FONT_BOLD, 9),
        (19, "C.C.P. \u00a7 473(b); Au-Yang v. Barton", FONT_BOLD, 9), # Citation in caption
        (20, "(1999) 21 Cal.4th 958",                 FONT_BOLD, 9),
    ]

    # --- HEARING INFO (Lines 23-26) ---
    cfg.hearing_info = {
        "Date":  "February 20, 2026 (Friday)",
        "Time":  "8:30 AM",
        "Dept":  "R",
        "Judge": "Hon. Judge Presiding",
    }

    # --- FOOTER ---
    cfg.footer_text = "EX PARTE APPLICATION \u2013 SET ASIDE VOID RULING"

    # --- OUTPUT ---
    cfg.output_dir  = os.path.dirname(os.path.abspath(__file__))
    cfg.output_name = "EX_PARTE_SET_ASIDE_v3.pdf"
    cfg.total_pages = 8

    return cfg


# ==============================================================================
# DOCUMENT BUILDER
# ==============================================================================

def build_document():
    cfg = build_config()
    engine = PleadingEngine(cfg)
    c = engine.canvas
    ind = 0.3 * inch
    ind2 = 0.6 * inch

    # ==================================================================
    # PAGE 1 — Caption
    # ==================================================================
    engine.begin_page()
    c = engine.canvas

    # Manual Filer/Court placement
    c.setFont(FONT_ROMAN, FONT_SIZE)
    filer = [cfg.filer_name, cfg.filer_address, cfg.filer_city_state,
             cfg.filer_phone, cfg.filer_email]
    for i, txt in enumerate(filer, 1):
        c.drawString(MARGIN_LEFT, engine.gy(i), txt)
    c.setFont(FONT_ITALIC, FONT_SIZE)
    c.drawString(MARGIN_LEFT, engine.gy(6), cfg.filer_role)

    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawCentredString(PAGE_WIDTH / 2, engine.gy(8), cfg.court_line1)
    c.drawCentredString(PAGE_WIDTH / 2, engine.gy(9), cfg.court_line2)

    # Caption Box
    c.saveState()
    c.setLineWidth(0.5)
    cap_top = engine.gy(11) + 12
    cap_bot = engine.gy(22) - 4
    c.line(LEFT_RAIL_X, cap_top, RIGHT_RAIL_X, cap_top)
    c.line(LEFT_RAIL_X, cap_bot, RIGHT_RAIL_X, cap_bot)
    c.line(CENTER_SEP_X, cap_top, CENTER_SEP_X, cap_bot)
    c.restoreState()

    # Left content
    for ln, txt, font in cfg.caption_left:
        c.setFont(font, FONT_SIZE)
        c.drawString(MARGIN_LEFT, engine.gy(ln), txt)

    # Right content
    info_x = CENTER_SEP_X + 10
    c.setFont(FONT_BOLD, FONT_SIZE)
    c.drawString(info_x, engine.gy(11), cfg.case_number) # Case No on 11

    for ln, txt, font, size in cfg.caption_right_title:
        c.setFont(font, size)
        c.drawString(info_x, engine.gy(ln), txt)

    if cfg.caption_right_subtitle:
        for ln, txt, font, size in cfg.caption_right_subtitle:
            c.setFont(font, size)
            c.drawString(info_x, engine.gy(ln), txt)

    # Hearing Info (Lines 23-26) - STRICT PLACEMENT
    c.setFont(FONT_ROMAN, FONT_SIZE)
    h_line = 23
    for label, value in cfg.hearing_info.items():
        c.drawString(MARGIN_LEFT, engine.gy(h_line), f"{label}:  {value}")
        h_line += 1

    # ==================================================================
    # PAGE 2 — Notice + Grounds (WEAPONIZED)
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_bold(ln, "TO PLAINTIFF GARY KEARNEY AND HIS ATTORNEY OF RECORD:")
    ln += 2

    ln = engine.text_wrapped(
        "PLEASE TAKE NOTICE that on February 20, 2026, at 8:30 A.M. in Dept R, "
        "Defendants ERIC JONES and NUHA SAYEGH will move this Court for an order "
        "SETTING ASIDE AND VACATING the ruling of February 17, 2026, which "
        "overruled Defendants\u2019 Demurrer in their absence.",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "I. GROUNDS FOR THIS APPLICATION")
    ln += 1

    # STRATEGIC POINT 1: CLEAR ERROR
    ln = engine.text_wrapped(
        "1.  CLERICAL ERROR & SURPRISE (CCP \u00a7 473(b)): The Court Clerk explicitly "
        "wrote \u201c02/19/2026\u201d on Defendants\u2019 conformed copy of the Demurrer. "
        "Defendants relied on this official notice. The Court then advanced the "
        "hearing to 02/17/2026 without notice, resulting in a default ruling.",
        ln, indent=ind
    )

    # STRATEGIC POINT 2: VOID ORDER
    ln += 1
    ln = engine.text_wrapped(
        "2.  VOID ORDER / DUE PROCESS VIOLATION: A trial court has no authority "
        "to advance a hearing date without notice to the parties. Such an order "
        "denies fundamental Due Process and is void. (Au-Yang v. Barton (1999) "
        "21 Cal.4th 958.)",
        ln, indent=ind
    )

    ln += 1
    ln = engine.text_wrapped(
        "3.  DUTY OF CANDOR: If Plaintiff\u2019s counsel was present on Feb 17 and "
        "failed to correct the Court regarding the noticed date of Feb 19, such "
        "silence constitutes a breach of the duty of candor to the tribunal.",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 3 — Relief
    # ==================================================================
    engine.begin_page()
    ln = 1
    engine.text_bold(ln, "II. RELIEF REQUESTED")
    ln += 1
    engine.text(ln, "Defendants request that the Court:", indent=ind)
    ln += 1
    ln = engine.text_wrapped("1.  Declare the Minute Order of Feb 17, 2026 VOID and set it aside;", ln, indent=ind2)
    ln = engine.text_wrapped("2.  Reset the Demurrer for a hearing on the merits;", ln, indent=ind2)
    ln = engine.text_wrapped("3.  Stay the order requiring an Answer within 5 days.", ln, indent=ind2)

    # ==================================================================
    # PAGE 4 — Memorandum (THE FORCE MULTIPLIERS)
    # ==================================================================
    engine.begin_page()
    ln = 1
    engine.text_centered(ln, "MEMORANDUM OF POINTS AND AUTHORITIES")
    ln += 2
    engine.text_bold(ln, "I. INTRODUCTION")
    ln += 1
    ln = engine.text_wrapped(
        "This is not merely a case of excusable neglect; it is a case of judicial error "
        "that implicates Due Process. The Court Clerk hand-wrote \u201c2/19/26\u201d on "
        "Defendants\u2019 filing. The Court then advanced the hearing to 2/17/26 \u201con "
        "its own motion\u201d (per the Minute Order) and ruled against Defendants in "
        "absentia. This Order is void.",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "II. THE ORDER IS VOID (Au-Yang v. Barton)")
    ln += 1
    ln = engine.text_wrapped(
        "The California Supreme Court has been unequivocal: A trial court may not "
        "advance a hearing date without reasonable notice to the parties. To do so "
        "strips a litigant of the opportunity to be heard. \u201c[T]he court\u2019s "
        "discretion to manage its calendar... does not extend to advancing a hearing "
        "date without notice.\u201d (Au-Yang v. Barton (1999) 21 Cal.4th 958, 963.)",
        ln, indent=ind
    )
    ln += 1
    ln = engine.text_wrapped(
        "Here, the Minute Order admits the hearing was \u201cadvanced.\u201d Defendants "
        "received no notice. Consequently, the Feb 17 ruling is void ab initio "
        "and must be vacated immediately.",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 5 — Memo Cont + Ethical Hook
    # ==================================================================
    engine.begin_page()
    ln = 1
    engine.text_bold(ln, "III. MANDATORY RELIEF UNDER CCP \u00a7 473(b)")
    ln += 1
    ln = engine.text_wrapped(
        "Even if the Order were not void, relief is mandatory. CCP \u00a7 473(b) requires "
        "the Court to set aside a default caused by \u201csurprise.\u201d Defendants\u2019 "
        "reliance on the date written by the Court Clerk constitutes the definition "
        "of excusable surprise.",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "IV. DUTY OF CANDOR")
    ln += 1
    ln = engine.text_wrapped(
        "All counsel have a duty of candor to the Tribunal. If Plaintiff\u2019s counsel "
        "appeared on Feb 17 and realized the Court was proceeding on a date different "
        "from the one noticed, he had an ethical obligation to inform the Court of "
        "the discrepancy rather than silently accept a default ruling against "
        "unrepresented litigants.",
        ln, indent=ind
    )

    ln += 2
    engine.text_bold(ln, "V. CONCLUSION")
    ln += 1
    ln = engine.text_wrapped(
        "The ruling was issued in violation of Due Process and in contradiction to "
        "the Court\u2019s own written notice. It must be set aside.",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 6 — Declaration
    # ==================================================================
    engine.begin_page()
    ln = 1
    engine.text_centered(ln, "DECLARATION OF ERIC JONES")
    ln += 2
    engine.text(ln, "I, ERIC JONES, declare:", indent=ind)
    ln += 1
    ln = engine.text_wrapped("1. I am a Defendant in this action.", ln, indent=ind2)
    ln = engine.text_wrapped(
        "2. On Feb 6, 2026, the Clerk returned my Demurrer with a hearing date "
        "of \u201c02/19/2026\u201d clearly written on it (Exhibit A).",
        ln, indent=ind2
    )
    ln = engine.text_wrapped(
        "3. I received NO notice that the hearing was advanced to Feb 17.",
        ln, indent=ind2
    )
    ln = engine.text_wrapped(
        "4. Had I known, I would have appeared. My absence was caused entirely "
        "by the Court\u2019s conflicting dates.",
        ln, indent=ind2
    )
    ln = engine.text_wrapped(
        "5. I notified Plaintiff\u2019s counsel of this Ex Parte on Feb 19, 2026 "
        "by email before 10:00 AM.",
        ln, indent=ind2
    )

    ln += 1
    engine.draw_execution_line(ln, "February 19, 2026")
    ln += 2
    engine.draw_signature(ln, "ERIC BRAKEBILL JONES", "Defendant In Pro Per")
    ln += 3
    engine.draw_signature(ln, "NUHA SAYEGH", "Defendant In Pro Per")

    # ==================================================================
    # PAGE 7 — Order
    # ==================================================================
    engine.begin_page()
    ln = 1
    engine.text_centered(ln, "[PROPOSED] ORDER")
    ln += 2
    ln = engine.text_wrapped(
        "Good cause appearing, and finding that the hearing of Feb 17, 2026 was "
        "advanced without notice in violation of law (Au-Yang v. Barton):",
        ln, indent=ind
    )
    ln += 1
    engine.text_bold(ln, "IT IS ORDERED:")
    ln += 1
    ln = engine.text_wrapped("1. The Ruling of Feb 17, 2026 is VACATED as void;", ln, indent=ind)
    ln = engine.text_wrapped("2. The Demurrer is RESET for: _______________;", ln, indent=ind)
    ln = engine.text_wrapped("3. The Order to Answer is STAYED.", ln, indent=ind)
    ln += 2
    engine.text(ln, "DATED: ___________________")
    ln += 2
    engine.draw_judge_signature(ln, "Judge of the Superior Court", right_align=True)

    # --- SAVE ---
    output = engine.save()

    # ==================================================================
    # MERGE WITH EXHIBIT
    # ==================================================================
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Assuming Exhibit A is in the parent/sibling folder as before
    exhibit_path = os.path.join(
        script_dir, "..", "DEMURRER_FEB_19_STAMPED",
        "KEARNEY_SAYEGH_DEMURRER_02_19_2026_STAMPED.pdf"
    )

    if os.path.exists(exhibit_path):
        body_reader = PdfReader(output)
        exhibit_reader = PdfReader(exhibit_path)
        writer = PdfWriter()

        for p in body_reader.pages:
            writer.add_page(p)

        try:
            tab_pdf = create_exhibit_tab("EXHIBIT A")
            tab_reader = PdfReader(tab_pdf)
            for p in tab_reader.pages:
                writer.add_page(p)
        except:
            pass

        for p in exhibit_reader.pages:
            writer.add_page(p)

        merged_path = os.path.join(script_dir, "..", "EX_PARTE_SET_ASIDE_v3.pdf")
        with open(merged_path, "wb") as f:
            writer.write(f)
        output = merged_path
    else:
        print("Exhibit not found, generating body only.")

    print(f"GENERATED: {output}")
    return output

if __name__ == "__main__":
    build_document()