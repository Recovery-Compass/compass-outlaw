#!/usr/bin/env python3
"""
================================================================================
FIRST AMENDED EX PARTE APPLICATION — FULL CONTENT REBUILD
Re-engineered per Clerk Rejection Notes — Monterey County Local Rules

Case:     Estate of Judy Brakebill Jones (25PR000590)
Court:    Superior Court of California — County of Monterey, Probate Division
Hearing:  Wednesday, February 18, 2026 at 8:30 AM, Dept 13
Engine:   generate_ca_pleading_v1.PleadingEngine

CLERK CORRECTIONS APPLIED:
  1. Hearing date → Wednesday, February 18, 2026
  2. Time → 8:30 AM
  3. Department → 13
  4. Title → "EX PARTE APPLICATION FOR SUSPENSION OF POWERS (PROB. CODE § 9614)"
  5. Declaration of Notice → Holiday Bypass: Fri Feb 13 by 5 PM (Feb 16 is holiday)
  6. All original body content / kill-chain arguments / exhibits preserved
================================================================================
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "LETHAL"))

from generate_ca_pleading_v1 import (
    PleadingEngine,
    PleadingConfig,
    FONT_BOLD,
    FONT_ROMAN,
    FONT_ITALIC,
    MARGIN_LEFT,
    PAGE_WIDTH,
    MARGIN_RIGHT,
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
    """Populate PleadingConfig with corrected geometry per Clerk rejection."""
    cfg = PleadingConfig()

    # --- FILER ---
    cfg.filer_name       = "ERIC BRAKEBILL JONES"
    cfg.filer_address    = "5634 Noel Drive"
    cfg.filer_city_state = "Temple City, CA 91780"
    cfg.filer_phone      = "(626) 348-3019"
    cfg.filer_email      = "eric@recovery-compass.org"
    cfg.filer_role       = "Petitioner and Successor Trustee In Pro Per"

    # --- COURT ---
    cfg.court_line1 = "SUPERIOR COURT OF CALIFORNIA"
    cfg.court_line2 = "COUNTY OF MONTEREY \u2013 PROBATE DIVISION"

    # --- CAPTION LEFT (Estate) ---
    cfg.caption_left = [
        (11, "Estate of:",                    FONT_ROMAN),
        (13, "JUDY BRAKEBILL JONES,",         FONT_BOLD),
        (14, "aka JUDY LEE JONES,",           FONT_ROMAN),
        (16, "Decedent.",                     FONT_ROMAN),
    ]

    # --- CAPTION RIGHT ---
    cfg.case_number = "Case No. 25PR000590"

    # CORRECTED TITLE per Clerk docketing requirements
    cfg.caption_right_title = [
        (13, "EX PARTE APPLICATION FOR",              FONT_BOLD, 10),
        (14, "SUSPENSION OF POWERS",                  FONT_BOLD, 10),
        (15, "(PROB. CODE \u00a7 9614)",               FONT_BOLD, 10),
    ]

    cfg.caption_right_subtitle = [
        (17, "[FIRST AMENDED \u2013 CORRECTED",        FONT_BOLD, 9),
        (18, " HEARING DATE PER CLERK ORDER]",         FONT_BOLD, 9),
    ]

    # --- HEARING INFO (CORRECTED per Clerk Rejection) ---
    cfg.hearing_info = {
        "Date":  "February 18, 2026 (Wednesday)",
        "Time":  "8:30 AM",
        "Dept":  "13",
        "Judge": "Hon. Elisabeth K. Mineta",
    }

    # --- FOOTER ---
    cfg.footer_text = "EX PARTE APPLICATION \u2013 SUSPENSION & SPECIAL ADMINISTRATION"

    # --- OUTPUT ---
    cfg.output_dir  = os.path.dirname(os.path.abspath(__file__))
    cfg.output_name = "AMENDED_EX_PARTE_FILED_READY.pdf"
    cfg.total_pages = 8

    return cfg


# ==============================================================================
# DOCUMENT BUILDER
# ==============================================================================

def build_document():
    """Build the complete First Amended Ex Parte Application with all content."""
    cfg = build_config()
    engine = PleadingEngine(cfg)
    c = engine.canvas
    ind = 0.3 * inch    # Standard paragraph indent
    ind2 = 0.6 * inch   # Double indent for sub-items

    # ==================================================================
    # PAGE 1 — Caption
    # ==================================================================
    engine.begin_page()
    engine.draw_caption()

    # Opening address on line 27
    engine.text_bold(27, "TO THE HONORABLE JUDGE OF THE SUPERIOR COURT:")

    # ==================================================================
    # PAGE 2 — Introduction & Basis for Ex Parte Relief (Exigency)
    # ==================================================================
    engine.begin_page()

    ln = 1
    ln = engine.text_wrapped(
        "Petitioner Eric Brakebill Jones (\"Petitioner\") hereby applies Ex "
        "Parte for an Order suspending the powers of Heidi Jones Blanchard "
        "(\"Respondent\") and appointing Petitioner as Special Administrator "
        "with General Powers under the Independent Administration of Estates "
        "Act (IAEA) to preserve the Estate.",
        ln, indent=ind
    )

    ln += 1  # spacer

    engine.text_bold(ln, "I. BASIS FOR EX PARTE RELIEF (THE EXIGENCY)")
    ln += 1

    ln = engine.text_wrapped(
        "This Application is based on the urgent need to prevent further "
        "waste and dissipation of Estate assets.",
        ln, indent=ind
    )

    # --- 1. Ongoing Insolvency ---
    engine.text_bold(ln, "1. Ongoing Insolvency (The \"Mule Transaction\"):", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "Evidence confirms Respondent previously facilitated the unauthorized "
        "transfer of $10,985.00 in Estate cash to a third-party account "
        "lacking economic substance (Exhibit A, Chase Transaction #61). This "
        "established a pattern of dissipation. The Estate is currently "
        "unbonded against this risk.",
        ln, indent=ind2
    )

    # --- 2. Constructive Abandonment ---
    engine.text_bold(ln, "2. Constructive Abandonment (The \"Nexus\"):", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "Respondent and her counsel have constructively abandoned the defense "
        "of the Estate, evidenced by their default on mandatory filing fees "
        "in the related appellate matter (Jones v. Superior Court, Case "
        "H054014) as of January 23, 2026 (Exhibit E).",
        ln, indent=ind2
    )

    # ==================================================================
    # PAGE 3 — Remaining Exigency Arguments + Memorandum of P&A
    # ==================================================================
    engine.begin_page()

    ln = 1

    # --- 3. Regulatory Conflict ---
    engine.text_bold(ln, "3. Regulatory Conflict (State Bar Case #265071):", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "Respondent\u2019s counsel is currently the subject of a Priority 1 State "
        "Bar investigation regarding the misappropriation identified in "
        "Exhibit A. Consequently, the Fiduciary is effectively "
        "unrepresented.",
        ln, indent=ind2
    )

    # --- 4. Waste ---
    engine.text_bold(ln, "4. Waste:", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "The Real Property is the sole remaining asset. Without the immediate "
        "appointment of a Special Administrator to list and sell the "
        "property, the Estate faces irreparable harm from tax defaults, "
        "insurance lapses, and market decline.",
        ln, indent=ind2
    )

    ln += 1  # spacer

    # --- MEMORANDUM OF POINTS AND AUTHORITIES ---
    engine.text_bold(ln, "II. MEMORANDUM OF POINTS AND AUTHORITIES")
    ln += 1

    engine.text_bold(
        ln,
        "A. THE COURT MUST SUSPEND POWERS TO PREVENT \"FUTURE\" HARM",
        indent=ind
    )
    ln += 1
    engine.text_bold(ln, "(PROB. CODE \u00a7 9614)", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "Probate Code \u00a7 9614 mandates suspension if \"it appears to the court "
        "that the personal representative has wasted... or is about to do "
        "so.\"",
        ln, indent=ind
    )

    ln = engine.text_wrapped(
        "The standard is predictive. The \"Mule Transaction\" (Exhibit A) "
        "proves the propensity to dissipate assets. The \"Appellate Default\" "
        "(Exhibit E) proves the incapacity to manage legal duties. Combined, "
        "these facts demonstrate that the Respondent is \"about to\" allow the "
        "Estate to collapse through neglect or further dissipation. The "
        "\"staleness\" of the initial theft is irrelevant; the unbonded risk "
        "creates a fresh emergency every day the Respondent remains in power.",
        ln, indent=ind
    )

    # ==================================================================
    # PAGE 4 — Memorandum (cont.) + Declaration of Eric Jones
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_bold(
        ln,
        "B. APPOINTMENT OF SPECIAL ADMINISTRATOR IS NECESSARY",
        indent=ind
    )
    ln += 1
    engine.text_bold(ln, "(PROB. CODE \u00a7 8540)", indent=ind)
    ln += 1

    ln = engine.text_wrapped(
        "Under Estate of Feeney (1983), the Court has inherent power to "
        "appoint a Special Administrator to preserve the estate when the "
        "current representative is paralyzed or compromised.",
        ln, indent=ind
    )

    ln = engine.text_wrapped(
        "Here, the Estate is leaderless. The Respondent has defaulted in the "
        "Court of Appeal. Her counsel is conflicted (State Bar #265071). "
        "Immediate appointment of Petitioner as Special Administrator with "
        "General Powers (Prob. Code \u00a7 8544) is the only mechanism to secure "
        "the Real Property, list it for sale, and deposit proceeds into a "
        "blocked account, thereby curing the risk.",
        ln, indent=ind
    )

    ln += 1  # spacer

    # --- DECLARATION OF ERIC BRAKEBILL JONES ---
    engine.text_bold(ln, "III. DECLARATION OF ERIC BRAKEBILL JONES")
    ln += 1

    engine.text(ln, "I, Eric Brakebill Jones, declare:", indent=ind)
    ln += 1

    # 1. The Property
    engine.text_bold(ln, "1. The Property:", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "The asset at risk is 17742 Berta Canyon Road, Salinas, CA. It is "
        "currently unoccupied.",
        ln, indent=ind2
    )

    # 2. Evidence of Dissipation
    engine.text_bold(ln, "2. Evidence of Dissipation (Exhibit A):", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "Attached as Exhibit A is a Chase Bank receipt showing the deposit of "
        "$10,985.00 (vehicle sale proceeds) into a third-party account ending "
        "in #9872 on May 22, 2025. These funds were diverted from the Trust.",
        ln, indent=ind2
    )

    # ==================================================================
    # PAGE 5 — Declaration (cont.) + Perjury + Execution
    # ==================================================================
    engine.begin_page()

    ln = 1

    # 3. Evidence of Admission
    engine.text_bold(ln, "3. Evidence of Admission (Exhibit B):", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "Attached as Exhibit B is a letter from Nicora Law dated June 27, "
        "2025, admitting possession of these funds, which contradicts their "
        "subsequent Verified Petition.",
        ln, indent=ind2
    )

    # 4. Evidence of Abandonment
    engine.text_bold(ln, "4. Evidence of Abandonment (Exhibit E):", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "Attached as Exhibit E is the \"Notice of Default\" from the Court of "
        "Appeal (Case H054014) dated Jan 23, 2026. This confirms "
        "Respondent\u2019s counsel has ceased legal defense of the Estate.",
        ln, indent=ind2
    )

    # 5. Necessity
    engine.text_bold(ln, "5. Necessity:", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "I request appointment as Special Administrator to list the property "
        "immediately. I agree to hold all net proceeds in a Court-Blocked "
        "Account.",
        ln, indent=ind2
    )

    ln += 1  # spacer

    # Perjury + Execution
    ln = engine.text_wrapped(
        "I declare under penalty of perjury under the laws of the State of "
        "California that the foregoing is true and correct.",
        ln
    )

    ln += 1
    engine.draw_execution_line(ln, "February 13, 2026")
    ln += 2

    engine.draw_signature(ln, name="ERIC BRAKEBILL JONES", title="Petitioner")

    # ==================================================================
    # PAGE 6 — Declaration Regarding Notice (CRC 3.1204)
    #           UPDATED per Clerk Rejection
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_bold(ln, "IV. DECLARATION REGARDING NOTICE (CRC 3.1204)")
    ln += 1

    engine.text(ln, "I, Eric Brakebill Jones, declare:", indent=ind)
    ln += 1

    # 1. Notice Given — HOLIDAY BYPASS (Feb 16 is court holiday)
    engine.text_bold(ln, "1. Notice Given:", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "On Friday, February 13, 2026, by 5:00 PM, I gave ex parte notice "
        "to opposing counsel, Albert J. Nicora and Michael Atteridge, via "
        "electronic service (email) at anicora@nicoralaw.com and "
        "maatteridge@nicoralaw.com. I attached a copy of this Application "
        "and informed them the matter would be heard on Wednesday, "
        "February 18, 2026, at 8:30 AM in Dept 13.",
        ln, indent=ind2
    )

    # 2. No Opposition Expected
    engine.text_bold(ln, "2. No Opposition Expected:", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "I do not expect an appearance. Counsel has ceased communication and "
        "defaulted on the related appellate matter (Exhibit E). Furthermore, "
        "Counsel has a direct conflict of interest regarding the evidence of "
        "asset dissipation (Exhibit A) and is the subject of State Bar "
        "Investigation #265071 regarding the same.",
        ln, indent=ind2
    )

    # 3. Exigency
    engine.text_bold(ln, "3. Exigency:", indent=ind)
    ln += 1
    ln = engine.text_wrapped(
        "Immediate suspension is required because notice to the Respondent "
        "of a \"removal\" action presents a severe risk that remaining liquid "
        "assets will be dissipated before a hearing can be held (CRC "
        "3.1204(b)(3)).",
        ln, indent=ind2
    )

    ln += 1
    ln = engine.text_wrapped(
        "I declare under penalty of perjury under the laws of the State of "
        "California that the foregoing is true and correct.",
        ln
    )

    ln += 1
    engine.text(ln, "ERIC BRAKEBILL JONES")

    # ==================================================================
    # PAGE 7 — [PROPOSED] ORDER
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_centered(ln, "[PROPOSED] ORDER")
    ln += 1
    engine.text_centered(
        ln,
        "SUSPENDING POWERS AND APPOINTING SPECIAL ADMINISTRATOR"
    )
    ln += 2

    ln = engine.text_wrapped(
        "The Ex Parte Petition of Eric Brakebill Jones for Suspension of "
        "Powers of Executor and Appointment of Special Administrator having "
        "come before the Court, and good cause appearing therefor:",
        ln, indent=ind
    )

    ln += 1
    engine.text_bold(ln, "IT IS HEREBY ORDERED THAT:")
    ln += 1

    # Order item 1
    ln = engine.text_wrapped(
        "1. The powers of Heidi Jones Blanchard as Personal Representative "
        "of the Estate of Judy Brakebill Jones are hereby SUSPENDED pursuant "
        "to Probate Code \u00a7 9614, pending further order of this Court;",
        ln, indent=ind
    )

    # Order item 2
    ln = engine.text_wrapped(
        "2. Eric Brakebill Jones is hereby appointed Special Administrator "
        "with General Powers under the Independent Administration of Estates "
        "Act (Probate Code \u00a7\u00a7 8540, 8544);",
        ln, indent=ind
    )

    # Order item 3
    ln = engine.text_wrapped(
        "3. The Special Administrator is authorized to list for sale, "
        "market, and sell the real property located at 17742 Berta Canyon "
        "Road, Salinas, CA, under IAEA authority;",
        ln, indent=ind
    )

    # Order item 4
    ln = engine.text_wrapped(
        "4. All net proceeds from the sale shall be deposited into a "
        "Court-Blocked Account, subject to further order of this Court;",
        ln, indent=ind
    )

    # Order item 5
    ln = engine.text_wrapped(
        "5. Letters of Special Administration shall issue upon the filing "
        "of any required bond.",
        ln, indent=ind
    )

    ln += 1
    engine.text(ln, "DATED: ___________________")
    ln += 2

    # Judge signature block
    engine.draw_judge_signature(
        ln,
        "Hon. Elisabeth K. Mineta",
        right_align=True
    )

    # ==================================================================
    # PAGE 8 — PROOF OF SERVICE (Updated)
    # ==================================================================
    engine.begin_page()

    ln = 1
    engine.text_centered(ln, "PROOF OF SERVICE")
    ln += 2

    ln = engine.text_wrapped(
        "I, Eric Brakebill Jones, declare that I am over 18 years of age "
        "and the Petitioner in this action, appearing In Pro Per. On "
        "February 13, 2026, I served the following document(s):",
        ln
    )

    ln += 1
    engine.text_bold(ln, "EX PARTE APPLICATION FOR SUSPENSION OF POWERS OF")
    ln += 1
    engine.text_bold(ln, "EXECUTOR AND APPOINTMENT OF SPECIAL ADMINISTRATOR")
    ln += 1
    engine.text_bold(ln, "WITH GENERAL POWERS [FIRST AMENDED]")
    ln += 1

    ln = engine.text_wrapped(
        "on the following party by the method indicated:",
        ln
    )

    ln += 1
    engine.text_bold(ln, "BY ELECTRONIC SERVICE (EMAIL):")
    ln += 1

    engine.text(ln, "Albert J. Nicora, Esq.", indent=ind)
    ln += 1
    engine.text(ln, "Michael Atteridge, Esq.", indent=ind)
    ln += 1
    engine.text(ln, "Nicora Law, APC", indent=ind)
    ln += 1
    engine.text(ln, "anicora@nicoralaw.com", indent=ind)
    ln += 1
    engine.text(ln, "maatteridge@nicoralaw.com", indent=ind)
    ln += 1
    engine.text(ln, "Counsel for Heidi Jones Blanchard", indent=ind)
    ln += 2

    ln = engine.text_wrapped(
        "I declare under penalty of perjury under the laws of the State of "
        "California that the foregoing is true and correct.",
        ln
    )

    ln += 1
    engine.draw_execution_line(ln, "February 13, 2026")
    ln += 2
    engine.text(ln, "ERIC BRAKEBILL JONES")

    # --- SAVE BODY ---
    output = engine.save()

    # ==================================================================
    # EXHIBIT MERGER — Attach original exhibits if they exist
    # ==================================================================
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ex_parte_dir = os.path.join(
        script_dir, "NICORA", "EX PARTE", "FINAL"
    )
    source_pdf = os.path.join(ex_parte_dir, "Ex Parte Petition.pdf")

    # Check if the original PDF exists to extract exhibit pages
    if os.path.exists(source_pdf):
        print("Extracting exhibit pages from original filing...")
        src_reader = PdfReader(source_pdf)
        body_reader = PdfReader(output)
        writer = PdfWriter()

        # Add all 8 body pages from our newly generated PDF
        for p in body_reader.pages:
            writer.add_page(p)

        # Add exhibit pages from the original (pages 9-15 = indices 8-14)
        total_src = len(src_reader.pages)
        if total_src > 8:
            for i in range(8, total_src):
                writer.add_page(src_reader.pages[i])
            print(f"  Appended {total_src - 8} exhibit pages from original.")

        # Write the merged output
        merged_path = os.path.join(script_dir, "AMENDED_EX_PARTE_FILED_READY.pdf")
        with open(merged_path, "wb") as f:
            writer.write(f)

        total_pages = len(writer.pages)
        print(f"\nMerged PDF: {merged_path} ({total_pages} pages)")
        output = merged_path
    else:
        print(f"NOTE: Original PDF not found at {source_pdf}")
        print("  Exhibits not appended. Body-only PDF generated.")

    print(f"\n{'='*60}")
    print(f"FILED-READY PDF: {output}")
    print(f"Hearing: Wed Feb 18, 2026 | 8:30 AM | Dept 13")
    print(f"{'='*60}")
    return output


if __name__ == "__main__":
    build_document()
