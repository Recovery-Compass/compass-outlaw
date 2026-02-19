#!/usr/bin/env python3
"""
================================================================================
SUPPLEMENTAL MEMO GENERATOR
Renders: "NOTICE OF FILING OF RELATED UNLIMITED CIVIL ACTION;
          SUPPLEMENTAL REQUEST FOR JUDICIAL NOTICE"

Case:     26PDUD00325 (Kearney v. Jones — UD)
Related:  26NNCV00412 (Sayegh v. Kearney — Unlimited Civil)
Engine:   generate_ca_pleading_v1.PleadingEngine
================================================================================
"""

import sys
import os

# Ensure the LETHAL subdirectory is on the path so the import resolves.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "LETHAL"))

from generate_ca_pleading_v1 import (
    PleadingEngine,
    PleadingConfig,
    FONT_BOLD,
    FONT_ROMAN,
    FONT_ITALIC,
)
from reportlab.lib.units import inch


def build_config() -> PleadingConfig:
    """Populate PleadingConfig with the exact target geometry payload."""
    cfg = PleadingConfig()

    # --- FILER ---
    cfg.filer_name       = "ERIC BRAKEBILL JONES"
    cfg.filer_address    = "5634 Noel Drive"
    cfg.filer_city_state = "Temple City, CA 91780"
    cfg.filer_phone      = "(626) 348-3019"
    cfg.filer_email      = "eric@recovery-compass.org"
    cfg.filer_role       = "Defendant in Pro Per"

    # --- COURT ---
    cfg.court_line1 = "SUPERIOR COURT OF THE STATE OF CALIFORNIA"
    cfg.court_line2 = "COUNTY OF LOS ANGELES \u2013 PASADENA COURTHOUSE"

    # --- CAPTION LEFT (Parties) ---
    cfg.caption_left = [
        (11, "GARY W. KEARNEY, an individual,", FONT_ROMAN),
        (13, "Plaintiff,",                       FONT_ROMAN),
        (15, "vs.",                               FONT_ROMAN),
        (17, "ERIC BRAKEBILL JONES, et al.,",    FONT_ROMAN),
        (19, "Defendants.",                       FONT_ROMAN),
    ]

    # --- CAPTION RIGHT ---
    cfg.case_number = "Case No. 26PDUD00325"

    cfg.caption_right_title = [
        (13, "NOTICE OF FILING OF RELATED",       FONT_BOLD, 11),
        (14, "UNLIMITED CIVIL ACTION;",           FONT_BOLD, 11),
        (15, "SUPPLEMENTAL REQUEST FOR",           FONT_BOLD, 11),
        (16, "JUDICIAL NOTICE",                    FONT_BOLD, 11),
    ]

    cfg.caption_right_subtitle = [
        (17, "[Evid. Code \u00a7 452(d); Asuncion v. Superior Court]", FONT_BOLD, 9),
    ]

    # --- HEARING INFO ---
    cfg.hearing_info = {
        "Date":         "February 19, 2026",
        "Time":         "1:30 P.M.",
        "Dept":         "R",
        "Action Filed": "January 28, 2026",
    }

    # --- FOOTER ---
    cfg.footer_text = "NOTICE OF FILING OF RELATED CASE & SUPPLEMENTAL RJN"

    # --- OUTPUT ---
    cfg.output_dir  = os.path.dirname(os.path.abspath(__file__))
    cfg.output_name = "SUPPLEMENTAL_MEMO_FILED_READY.pdf"
    cfg.total_pages = 2

    return cfg


def build_document():
    """Build the complete pleading document."""
    cfg = build_config()
    engine = PleadingEngine(cfg)
    ind = 0.3 * inch  # Standard paragraph indent

    # ==================================================================
    # PAGE 1 — Caption + Opening Body
    # ==================================================================
    engine.begin_page()
    engine.draw_caption()

    # Body text begins at line 23 (after hearing info occupies 23-26,
    # but hearing_info dict has 4 entries -> lines 23-26 used).
    # We start body at line 27.
    # Actually — hearing info goes 23-26 (4 lines). So body starts at 27.
    # But that only leaves lines 27-28 on page 1, which is too tight.
    # The caption + hearing info fill lines 1-26 per the engine.
    # We use remaining lines 27-28 for the opening address.

    ln = 27
    engine.text_bold(ln, "TO THE COURT AND ALL PARTIES:")
    ln += 1  # 28 — last line on page 1

    # ==================================================================
    # PAGE 2 — Full Body Text
    # ==================================================================
    engine.begin_page()

    ln = 1
    ln = engine.text_wrapped(
        "PLEASE TAKE NOTICE that on February 12, 2026, subsequent to the "
        "filing of Defendant\u2019s Demurrer, a critical jurisdictional event "
        "occurred which mandates this Court\u2019s immediate attention. Defendant "
        "has filed and served a Notice of Related Case (CM-015) in this "
        "action, formally linking this summary proceeding to the prior-pending "
        "Unlimited Civil Action: Sayegh v. Kearney (LASC Case No. "
        "26NNCV00412).",
        ln
    )

    ln += 1  # blank line

    # --- SECTION I ---
    engine.text_bold(ln, "I. BASIS FOR SUPPLEMENTAL FILING")
    ln += 1
    ln = engine.text_wrapped(
        "This filing is submitted pursuant to the Court\u2019s inherent authority "
        "to consider new controlling facts that arise after statutory briefing "
        "deadlines. The Related Case Notice could not have been presented "
        "prior to its filing on February 12, 2026.",
        ln, indent=ind
    )

    # --- SECTION II ---
    engine.text_bold(ln, "II. JUDICIAL NOTICE OF \u201cFIRST-IN-TIME\u201d JURISDICTION")
    ln += 1
    ln = engine.text_wrapped(
        "Defendant requests this Court take Judicial Notice (Evid. Code "
        "\u00a7 452(d)) of the court records in Case No. 26NNCV00412.",
        ln, indent=ind
    )

    engine.text(ln, "Civil Case Filed: January 21, 2026.", indent=ind)
    ln += 1
    engine.text(ln, "UD Case Filed: January 28, 2026.", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "Because the Civil Court acquired jurisdiction first, and because "
        "that action seeks rescission of the lease based on illegality "
        "(Temple City Municipal Code \u00a7 9-1E-2), the doctrine of Exclusive "
        "Concurrent Jurisdiction applies.",
        ln, indent=ind
    )

    # --- SECTION III ---
    engine.text_bold(ln, "III. THE ASUNCION MANDATE")
    ln += 1

    ln = engine.text_wrapped(
        "Under Asuncion v. Superior Court (1980) 108 Cal.App.3d 141, this "
        "Court should not adjudicate possession in a summary proceeding when "
        "complex issues of title and fraud are already pending in a superior "
        "jurisdiction. Proceeding here risks inconsistent rulings regarding "
        "the validity of a lease that the Civil Court may declare void ab "
        "initio.",
        ln, indent=ind
    )

    # --- SECTION IV ---
    engine.text_bold(ln, "IV. CONCLUSION")
    ln += 1
    ln = engine.text_wrapped(
        "Defendant respectfully requests this Court STAY this Unlawful "
        "Detainer action pending resolution of the First-Filed Unlimited "
        "Civil Action.",
        ln, indent=ind
    )

    # Check if signature fits on this page (need ~4 lines)
    if ln + 5 > 28:
        # Overflow to page 3
        cfg.total_pages = 3
        engine.begin_page()
        ln = 1

    ln += 1  # blank line

    # --- SIGN-OFF ---
    engine.text(ln, "DATED: February 13, 2026")
    ln += 2  # skip a line for spacing

    # Signature rule + name + role
    engine.draw_signature(ln, name="ERIC BRAKEBILL JONES", title="Defendant in Pro Per")

    # --- SAVE ---
    output = engine.save()
    print(f"\n{'='*60}")
    print(f"FILED-READY PDF: {output}")
    print(f"{'='*60}")
    return output


if __name__ == "__main__":
    build_document()
