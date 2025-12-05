# State Bar Complaint Documentation

This directory contains complete State Bar complaint packages for attorney misconduct cases.

## Active Complaints

### Sayegh v. H Bui Law Firm (Case-04)
**Directory:** `sayegh-hbui-memari/`  
**Status:** Ready to File  
**Respondents:** Hannah Bui (SBN 234013), Sara Memari (SBN 332144)  
**Case:** 25PDFL01441 - Los Angeles Superior Court (Pasadena)

**Summary:**
- 10 documented exhibits with SHA256 verification
- 6 attorney failures documented (FL-150 error, late login, Chatsworth conflict, etc.)
- 5 Rules of Professional Conduct violations mapped
- 932-word statement ready for online filing
- Complete filing checklist and instructions

**Filing URL:** https://apps.calbar.ca.gov/complaint/

**Key Evidence:**
- FL-150 income error: $5,500 filed vs $0 actual
- Late login email: 8:39 AM for 8:30 AM hearing
- Chatsworth conflict: 3-day pattern of attorney prioritizing other case
- Abandonment: Terminated 48 hours after failed hearing

See `sayegh-hbui-memari/PACKAGE_SUMMARY.md` for complete details.

---

## Directory Structure

```
state-bar-complaints/
├── README.md (this file)
└── sayegh-hbui-memari/
    ├── PACKAGE_SUMMARY.md
    ├── FILING_CHECKLIST.md
    ├── STATEMENT_FINAL_WITH_CHATSWORTH.txt
    ├── CHECKSUMS.txt
    ├── EXHIBIT_1_FL150_ERROR_5500_Income.pdf
    ├── EXHIBIT_2_LATE_LOGIN_EMAIL_839AM.pdf
    ├── EXHIBIT_3_TERMINATION_EMAIL_Nov22.txt
    ├── EXHIBIT_4_FL150_WARNING_EMAIL_Nov18.txt
    ├── EXHIBIT_5_MINUTE_ORDER_Nov19_Hearing.pdf
    ├── EXHIBIT_6_PROOF_ZERO_INCOME_EBT.txt
    ├── EXHIBIT_7_RETAINER_PAYMENT_7500_Nov4.pdf
    ├── EXHIBIT_8_CHATSWORTH_Nov18_Email.pdf
    ├── EXHIBIT_9_CHATSWORTH_Nov19_SMOKING_GUN.txt
    └── EXHIBIT_10_CHATSWORTH_Nov17_Meeting_Notes.txt
```

---

## Integration Notes

These complaint packages are compiled under **PFV V16 Protocol** and follow strict standards for:
- Evidence integrity (SHA256 checksums)
- Legal compliance (proper description of meeting notes vs. recordings)
- Complete documentation (all claims supported by exhibits)
- Filing readiness (forms, checklists, contact information)

For integration into Compass Outlaw, these packages demonstrate the evidence chain documentation and systematic approach to legal accountability that the platform should support for domestic violence advocacy cases.

---

*Last Updated: December 4, 2025*
