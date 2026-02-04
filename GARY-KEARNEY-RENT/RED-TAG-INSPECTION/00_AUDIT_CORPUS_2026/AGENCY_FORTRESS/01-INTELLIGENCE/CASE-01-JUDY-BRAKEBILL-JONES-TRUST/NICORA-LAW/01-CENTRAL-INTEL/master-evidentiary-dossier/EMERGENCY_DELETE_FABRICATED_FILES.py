#!/usr/bin/env python3
"""
EMERGENCY: Delete ALL files with potentially fabricated content
Preserve ONLY format templates (_CORRECTED files)

REASON: AI fabricated evidence in Declaration Paragraph 4:
- Claimed Eric "obtained from Gary William Jones's personal records"
- Claimed Eric "personally photographed this document at his residence"
- TRUTH: Eric received deposit receipt via email from Gretchen

This is PERJURY if filed. DELETE ALL content-merged files immediately.
"""

import os
import glob
import shutil
from datetime import datetime

OUTPUT_DIR = "/Users/ericjones/Compass Fortress/cases/judy-jones-probate-850/4-email-to-anuar-nov15/ALL-ATTACHMENTS-READY-TO-SEND"
BACKUP_DIR = "/Users/ericjones/Compass Fortress/cases/judy-jones-probate-850/DELETED_FABRICATED_FILES_BACKUP"

# Patterns for files with AI-generated content (UNSAFE)
DELETE_PATTERNS = [
    "*_FINAL.pdf",
    "*_FINAL.docx",
    "*_FINAL_*.pdf",
    "*_FINAL_*.docx",
    "*_VALIDATED.pdf",
    "*_VALIDATED.docx",
    "*_COMPLETE.pdf",
    "*_COMPLETE.docx"
]

# Patterns for safe files (format only, no content)
SAFE_PATTERNS = [
    "*_CORRECTED.pdf",
    "*_CORRECTED.docx"
]

def main():
    print("\n" + "="*70)
    print("EMERGENCY DELETION - FABRICATED EVIDENCE REMOVAL")
    print("="*70)
    print("\n⚠️  DELETING files with AI-generated content (potential perjury)")
    print("✅ PRESERVING format-only templates (_CORRECTED files)")
    print("\n" + "="*70 + "\n")

    # Create backup directory
    os.makedirs(BACKUP_DIR, exist_ok=True)
    print(f"✓ Backup directory: {BACKUP_DIR}\n")

    deleted_files = []
    preserved_files = []

    # Delete unsafe files
    print("DELETING UNSAFE FILES:")
    print("-" * 70)

    for pattern in DELETE_PATTERNS:
        for filepath in glob.glob(os.path.join(OUTPUT_DIR, pattern)):
            filename = os.path.basename(filepath)

            # Backup before deleting
            backup_path = os.path.join(BACKUP_DIR, filename)
            shutil.copy2(filepath, backup_path)

            # Delete original
            os.remove(filepath)

            deleted_files.append(filename)
            print(f"  ✗ DELETED: {filename}")

    print(f"\n✓ Deleted {len(deleted_files)} unsafe files")
    print(f"✓ Backed up to: {BACKUP_DIR}")

    # List preserved files
    print("\n" + "="*70)
    print("SAFE FILES PRESERVED (format only, no AI content):")
    print("-" * 70)

    for pattern in SAFE_PATTERNS:
        for filepath in glob.glob(os.path.join(OUTPUT_DIR, pattern)):
            filename = os.path.basename(filepath)
            filesize_kb = os.path.getsize(filepath) / 1024
            preserved_files.append(filename)
            print(f"  ✓ {filename} ({filesize_kb:.1f} KB)")

    # Summary
    print("\n" + "="*70)
    print("EMERGENCY DELETION COMPLETE")
    print("="*70)
    print(f"\n✗ Deleted: {len(deleted_files)} files with fabricated content")
    print(f"✓ Preserved: {len(preserved_files)} format-only templates")

    print("\n📋 NEXT STEPS FOR ANUAR:")
    print("  1. Use _CORRECTED files (format templates only)")
    print("  2. Use Eric's source files from:")
    print("     /Users/ericjones/11-15/5-bird/judy-jones-probate-850/")
    print("     self-filing-IRONCLAD-FINAL/remediated_docx_v2/")
    print("  3. Manually merge content (human verification required)")
    print("  4. NO AI content generation in legal declarations")

    print("\n⚠️  REASON FOR DELETION:")
    print("  AI fabricated evidence in Declaration Paragraph 4:")
    print("  - Claimed Eric obtained docs from Gary's personal records")
    print("  - Claimed Eric photographed at Gary's residence")
    print("  - TRUTH: Received via email from Gretchen")
    print("  - This would be PERJURY if filed")

    print("\n" + "="*70 + "\n")

    # List deleted files
    if deleted_files:
        print("DELETED FILES (backed up):")
        for f in deleted_files:
            print(f"  • {f}")
        print()

if __name__ == "__main__":
    main()
