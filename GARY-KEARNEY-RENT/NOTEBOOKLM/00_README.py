import os
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import textwrap

# --- CONTENT DEFINITIONS ---

README_TEXT = """SYSTEMIC PREDATOR PROFILE: FORENSIC AUDIT OF GARY W. KEARNEY (SBN 71443)
MISSION: OPERATION KEARNEY (THEATER B)
OBJECTIVE: CONVERT EVICTION DEFENSE INTO $115,000.00 LIQUIDITY EXTRACTION

1. EXECUTIVE SUMMARY
Subject Gary W. Kearney (Attorney/Landlord) has threatened eviction based on a "Busy Signal" lie. 
Forensic audit suggests the rental unit (5634 Noel Dr) is an unpermitted "Ghost Unit" (Illegal Density). 
Operational strategy is "Void Ab Initio" - declaring the lease illegal to force rent disgorgement.

2. TARGET VULNERABILITIES
- Rule 3.3 Violation: Fabricated "Busy Signal" evidence.
- Civil Code 789.3: Refusal to authorize utility transfer ($98k liability).
- TCMC 9-1E-2: Illegal parking width (<8ft) proving unpermitted density.

3. STRATEGIC DOCTRINE
We do not defend; we attack. We assert a $115,000.00 counter-claim for restitution and statutory penalties.
"""

EMAIL_TEXT = """FROM: Gary Kearney <gwkearney@outlook.com>
DATE: Fri, Jan 9, 2026 at 4:45 PM
TO: Eric Jones <brakebill@gmail.com>
SUBJECT: Rent

Eric,

I have attempted to call you several times, and your phone indicates that it is busy.

You have not paid rent for either December 2025 or January 2026. I will be serving you with a Three-Day Notice to Pay Rent or Quit.

I would like to resolve this problem without litigation. If you vacate the property and leave it in good condition by January 20, 2026, I will not seek a judgment against you and Nuha Saygh for rent and attorneys' fees (and likely electric service), nor will I report you to a credit agency as a delinquent tenant.

Please advise if this is acceptable, and I will draft an agreement accordingly.

Gary W. Kearney
539 Catalpa Road
Arcadia, California 91007
626-688-7656
"""

STATUTE_TEXT = """CALIFORNIA CIVIL CODE SECTION 789.3
PROHIBITION ON INTERRUPTION OF UTILITY SERVICE

(a) A landlord shall not with intent to terminate the occupancy under any lease or other tenancy... willfully cause, directly or indirectly, the interruption or termination of any utility service furnished the tenant, including, but not limited to, water, heat, light, electricity, gas, telephone, elevator, or refrigeration, whether or not the utility service is under the control of the landlord.

(b) Any landlord who violates this section shall be liable to the tenant in a civil action for all of the following:
   (1) Actual damages of the tenant.
   (2) One hundred dollars ($100) for each day or part thereof that the landlord is in violation of this section.

ANALYSIS FOR CASE:
Landlord Kearney has refused to sign the Transfer of Service (TOS) authorization for >980 days. This constitutes "indirect interruption" and "willful" conduct intended to maintain leverage over the tenancy.
Total Statutory Liability: 980 days * $100 = $98,000.00.
"""

CASELAW_TEXT = """LEGAL AUTHORITY BRIEF: ILLEGAL CONTRACTS & RENT COLLECTION

1. Espinoza v. Calva (2008) 169 Cal.App.4th 1393
HOLDING: A landlord cannot collect rent for a dwelling unit that does not have a valid certificate of occupancy or permit. The lease agreement for an illegal unit is "void ab initio" (void from the beginning) because the object of the contract is illegal.
APPLICATION: If 5634 Noel Drive is an unpermitted "Ghost Unit," Kearney has no legal standing to demand rent or evict for non-payment.

2. Carter v. Cohen (2010) 188 Cal.App.4th 1038
HOLDING: A tenant who paid rent for an illegal/unpermitted unit is entitled to restitution (disgorgement) of rent paid, as the landlord was unjustly enriched by collecting money for an uninhabitable/illegal structure.
APPLICATION: Eric Jones is entitled to a refund of all rent paid since May 2023 (~$75,000.00).

3. Gruzen v. Henry (1978) 84 Cal.App.3d 515
HOLDING: The landlord is not entitled to the "reasonable value" of the premises if the lack of a permit renders the occupancy illegal. Strict compliance with housing codes overrides equity.
"""

EVIDENCE_LOG_TEXT = """DECLARATION OF ERIC B. JONES RE: MOBILE CARRIER LOGS
(Evidence Code 1560 - Business Records)

1. I am the account holder for the mobile number (626) 348-3019.
2. On January 9, 2026, Landlord Gary Kearney claimed via email that he "attempted to call [me] several times" and received a "busy signal."
3. I have reviewed the official Carrier Call Logs provided by my service provider for the period of January 1, 2026 through January 9, 2026.
4. FINDING: The logs reflect ZERO (0) incoming calls from Gary Kearney's known number (626-688-7656).
5. CONCLUSION: The claim of a "busy signal" is a fabrication intended to create a pretext for "lack of communication" in a legal filing. This evidence is preserved to impeach any future Declaration of Diligence.
"""

EVIDENCE_PARKING_TEXT = """DECLARATION OF DEFECTIVE INFRASTRUCTURE (PARKING)
VIOLATION OF TEMPLE CITY MUNICIPAL CODE 9-1E-2

1. SITE INSPECTION: The driveway at 5630 Noel Drive is currently striped/configured to attempt to fit three (3) vehicles side-by-side.
2. MEASUREMENT: The width of the assigned parking space for Unit 5634 is less than 8 feet (approx. 90 inches).
3. CODE VIOLATION: TCMC 9-1E-2 requires parking spaces in R-2/R-3 zones to be a minimum of 10 feet wide (enclosed) or standard width for open spaces.
4. DENSITY IMPLICATION: The physical inability to fit legal parking for 3 units strongly suggests the property is legally permitted as a Duplex (2 units), making the 3rd unit (5634) an unpermitted addition ("Ghost Unit").
"""

PROFILE_TEXT = """TARGET INTELLIGENCE PROFILE: GARY W. KEARNEY
BAR NUMBER: 71443
STATUS: Active Attorney / Real Estate Broker / Judge Pro Tem

1. PROFESSIONAL ROLES:
- Certified Family Law Specialist.
- Judge Pro Tem (Los Angeles Superior Court).
- Property Owner/Landlord.

2. OPERATIONAL PATTERN ("SYSTEMIC PREDATOR"):
- Utilizes judicial title ("Judge Pro Tem") in private landlord correspondence to intimidate tenants.
- Creates "Hybrid" tenancies where utilities remain in his name to retain "shut-off" leverage.
- Violates Rule of Professional Conduct 3.3 (Candor) by fabricating evidence of communication failures.

3. CONFLICT OF INTEREST:
- Potential nexus with "Di Chen" and "Bing Xu" (Real Estate Agents/Trusts) in the Pasadena area.
- May be adjudicating cases involving parties he transacts with in real estate.
"""

# --- GENERATION ENGINE ---

def create_pdf(filename, content, header):
    c = canvas.Canvas(filename, pagesize=LETTER)
    width, height = LETTER
    
    # Header
    c.setFont("Helvetica-Bold", 12)
    c.drawString(72, height - 72, header)
    c.line(72, height - 75, width - 72, height - 75)
    
    # Body
    text = c.beginText(72, height - 100)
    text.setFont("Helvetica", 10)
    text.setLeading(14)
    
    lines = content.split('\n')
    for line in lines:
        wrapped = textwrap.wrap(line, width=90)
        for w_line in wrapped:
            text.textLine(w_line)
        text.textLine(" ") # Paragraph break
        
    c.drawText(text)
    c.save()
    print(f"[+] GENERATED: {filename}")

def generate_assets():
    # 1. README (Text File)
    with open("00_MASTER_README.txt", "w") as f:
        f.write(README_TEXT)
    print("[+] GENERATED: 00_MASTER_README.txt")

    # 2. EVIDENCE - LOGS
    create_pdf("01_EVIDENCE_FACTUAL_Log_Mobile_Carrier.pdf", EVIDENCE_LOG_TEXT, "EVIDENCE: MOBILE CARRIER LOGS & PERJURY PROOF")

    # 3. EVIDENCE - PARKING
    create_pdf("01_EVIDENCE_FACTUAL_Photos_Parking_Width.pdf", EVIDENCE_PARKING_TEXT, "EVIDENCE: INFRASTRUCTURE DEFECTS & ZONING VIOLATION")

    # 4. LEGAL - CASE LAW
    create_pdf("02_LEGAL_AUTHORITY_CaseLaw_Espinoza_v_Calva.pdf", CASELAW_TEXT, "LEGAL AUTHORITY: ILLEGAL CONTRACTS & VOID LEASES")

    # 5. LEGAL - STATUTE
    create_pdf("02_LEGAL_AUTHORITY_Statute_CivilCode_789.3.pdf", STATUTE_TEXT, "LEGAL AUTHORITY: CIVIL CODE 789.3 (UTILITY PENALTIES)")

    # 6. COMMS - THREAT
    create_pdf("03_OPPOSING_COMMS_Email_Kearney_Jan9.pdf", EMAIL_TEXT, "OPPOSING COUNSEL COMMUNICATION (JAN 9, 2026)")

    # 7. INTEL - PROFILE
    create_pdf("04_HISTORICAL_INTEL_Kearney_StateBar_Profile.pdf", PROFILE_TEXT, "TARGET INTELLIGENCE: GARY W. KEARNEY (SBN 71443)")

if __name__ == "__main__":
    generate_assets()