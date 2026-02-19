#!/usr/bin/env python3
"""
SAYEGH DEADLINE TRACKER
Case: Sayegh v. Sayegh (25PDFL01441)
Purpose: Track days remaining until January 6, 2026 hearing and check filing status
"""

import os
from datetime import datetime, date
from pathlib import Path

# Configuration
FORTRESS_ROOT = Path("/Users/ericjones/Fortress")
CASE_DIR = FORTRESS_ROOT / "02-CASES" / "Case-04_Sayegh-DVRO"
OUTPUT_DIR = CASE_DIR / "05-OUTPUT"
HEARING_DATE = date(2026, 1, 6)
FILING_DEADLINE = date(2025, 12, 19)  # Estimated deadline for Jan 6 hearing

def calculate_days_remaining(target_date):
    """Calculate days remaining until target date"""
    today = date.today()
    delta = target_date - today
    return delta.days

def check_filing_status():
    """Check if motion has been filed by looking for key documents"""
    motion_files = [
        "DRAFT_Motion_SetAside_Nov19_CCP473b.txt",
        "FILED_Motion_SetAside_Nov19_CCP473b.pdf",
        "Motion_SetAside_Nov19_CCP473b.pdf"
    ]
    
    for filename in motion_files:
        file_path = OUTPUT_DIR / filename
        if file_path.exists():
            if "FILED" in filename:
                return "FILED", filename
            elif "DRAFT" in filename:
                return "DRAFT", filename
            else:
                return "PREPARED", filename
    
    return "NOT_STARTED", None

def check_exhibit_status():
    """Check if exhibits have been packaged"""
    exhibit_dir = OUTPUT_DIR / "JAN6_EXHIBIT_PACKAGE"
    if exhibit_dir.exists():
        exhibit_count = len([f for f in exhibit_dir.glob("EXHIBIT_*") 
                            if not any(x in f.name for x in ["CHECKSUMS", "MANIFEST"])])
        return True, exhibit_count
    return False, 0

def print_status_report():
    """Print comprehensive status report"""
    print("=" * 60)
    print("SAYEGH v. SAYEGH DEADLINE TRACKER")
    print("Case No.: 25PDFL01441")
    print("=" * 60)
    print()
    
    # Current date
    today = date.today()
    print(f"Current Date: {today.strftime('%B %d, %Y')}")
    print()
    
    # Hearing countdown
    days_to_hearing = calculate_days_remaining(HEARING_DATE)
    print(f"JANUARY 6, 2026 HEARING")
    print(f"Days Remaining: {days_to_hearing} days")
    
    if days_to_hearing < 0:
        print("⚠️  HEARING DATE HAS PASSED")
    elif days_to_hearing == 0:
        print("🔥 HEARING IS TODAY!")
    elif days_to_hearing <= 7:
        print("🔥 CRITICAL: Less than 1 week until hearing")
    elif days_to_hearing <= 14:
        print("⚠️  WARNING: Less than 2 weeks until hearing")
    else:
        print("✓ Adequate time remaining")
    print()
    
    # Filing deadline countdown
    days_to_filing = calculate_days_remaining(FILING_DEADLINE)
    print(f"ESTIMATED FILING DEADLINE")
    print(f"Target Date: {FILING_DEADLINE.strftime('%B %d, %Y')}")
    print(f"Days Remaining: {days_to_filing} days")
    
    if days_to_filing < 0:
        print("🔥 FILING DEADLINE HAS PASSED - File immediately or request extension")
    elif days_to_filing == 0:
        print("🔥 FILING DEADLINE IS TODAY")
    elif days_to_filing <= 3:
        print("🔥 CRITICAL: Less than 3 days to file")
    elif days_to_filing <= 7:
        print("⚠️  WARNING: Less than 1 week to file")
    else:
        print("✓ Adequate time to prepare filing")
    print()
    
    # Motion filing status
    filing_status, filename = check_filing_status()
    print(f"MOTION TO SET ASIDE STATUS")
    print(f"Status: {filing_status}")
    
    if filing_status == "FILED":
        print(f"✓ Motion filed: {filename}")
    elif filing_status == "DRAFT":
        print(f"⚠️  Draft exists: {filename}")
        print("   Next step: Finalize and convert to PDF for filing")
    elif filing_status == "PREPARED":
        print(f"⚠️  Motion prepared: {filename}")
        print("   Next step: File with court")
    else:
        print("🔥 Motion not yet prepared")
        print("   Next step: Complete draft using DRAFT_Motion_SetAside_Nov19_CCP473b.txt")
    print()
    
    # Exhibit status
    exhibits_ready, exhibit_count = check_exhibit_status()
    print(f"EXHIBIT PACKAGE STATUS")
    
    if exhibits_ready:
        print(f"✓ Exhibits packaged: {exhibit_count} exhibits ready")
        print(f"   Location: {OUTPUT_DIR}/JAN6_EXHIBIT_PACKAGE/")
    else:
        print("⚠️  Exhibits not yet packaged")
        print("   Next step: Run package_jan6_exhibits.sh")
    print()
    
    # Critical next steps
    print("=" * 60)
    print("CRITICAL NEXT STEPS")
    print("=" * 60)
    
    if filing_status == "NOT_STARTED":
        print("1. Complete draft Motion to Set Aside (CCP 473(b))")
        print("2. Complete draft Declaration of Nuha Sayegh")
    
    if not exhibits_ready:
        print("3. Run: bash /Users/ericjones/Fortress/03-CODE/tools/package_jan6_exhibits.sh")
    
    if filing_status in ["NOT_STARTED", "DRAFT", "PREPARED"]:
        print("4. Review all documents with Nuha")
        print("5. Have Nuha sign Declaration under penalty of perjury")
        print("6. Convert all documents to PDF format")
        print("7. File with court (in person or electronically)")
        print("8. Serve on Respondent and his attorney")
        print("9. File Proof of Service")
    
    if days_to_filing <= 7:
        print()
        print("⚠️  URGENT: Filing deadline approaching - prioritize completion")
    
    print()
    print("=" * 60)
    print("For questions or assistance, contact Eric Jones")
    print("Email: eric@recovery-compass.org")
    print("=" * 60)
    print()

def main():
    """Main function"""
    try:
        print_status_report()
        return 0
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
