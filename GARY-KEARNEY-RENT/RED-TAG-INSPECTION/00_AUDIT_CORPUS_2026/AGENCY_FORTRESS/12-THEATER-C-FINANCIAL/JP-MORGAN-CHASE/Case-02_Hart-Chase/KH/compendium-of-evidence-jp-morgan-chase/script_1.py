# Create the Chronology and Declaration files for Exhibits C, D, and E
chronology_content = """# **CHRONOLOGY OF KEY COMMUNICATIONS & FORMAL DEMANDS**

**August 14, 2025:** In-person meeting at Chase Bank, Longview, TX. Notified branch VP of fraud on Kathleen A. Hart's personal account. Established joint account for her care under a valid Power of Attorney (POA).

**August 27, 2025:** Call from Chris Salinas, Chase Global Security. Despite explaining the POA and medical urgency, Mr. Salinas summarily froze all accounts based on his stated "discomfort."

**September 1-12, 2025:** Multiple calls and emails to Chase support tiers. Consistently met with stonewalling and conflicting information. No resolution provided.

**September 13, 2025:** In-person meeting at Chase Bank, El Monte, CA. Requested the specific policy justifying the account freeze and the demand for Ms. Hart's in-person appearance, which was medically impossible. Staff failed to provide any policy and admitted their confusion.

**September 15, 2025:** Formal complaint filed with the Office of the Comptroller of the Currency (OCC).

**September 16, 2025:** Formal complaint filed with the Consumer Financial Protection Bureau (CFPB).

**September 23, 2025:** Formal demand package, including this Compendium of Evidence, submitted to Chase Executive Leadership and supplemented to OCC/CFPB complaints.
"""

declaration_d_content = """# **DECLARATION OF ERIC JONES**

I, Eric Jones, declare the following is true and correct:

1. On August 27, 2025, I spoke with Chris Salinas of Chase Global Security regarding Kathleen A. Hart's accounts.

2. I explained my role as Agent under a valid POA and that recent transactions were for Ms. Hart's urgent care following surgery. I informed him Ms. Hart was medically unavailable but offered to facilitate a future call.

3. Mr. Salinas disregarded my explanation and the medical context, stating he was "not comfortable" and unilaterally froze all accounts, directly impeding my ability to provide care for Ms. Hart.

I declare under penalty of perjury that the foregoing is true and correct.

Executed on September 23, 2025.

_________________________
Eric Jones
"""

declaration_e_content = """# **DECLARATION OF ERIC JONES**

I, Eric Jones, declare the following is true and correct:

1. On September 13, 2025, I met with staff at the Chase branch in El Monte, CA, to resolve the improper account freeze.

2. I repeatedly demanded to see the written policy justifying the freeze and the medically impossible demand that Ms. Hart appear in person.

3. The staff were unable to produce any such policy and admitted their own confusion, confirming no clear, lawful basis for their refusal to provide assistance.

I declare under penalty of perjury that the foregoing is true and correct.

Executed on September 23, 2025.

_________________________
Eric Jones
"""

# Write the files
with open('CHRONOLOGY_EXHIBIT_C.md', 'w') as f:
    f.write(chronology_content)

with open('DECLARATION_EXHIBIT_D.md', 'w') as f:
    f.write(declaration_d_content)

with open('DECLARATION_EXHIBIT_E.md', 'w') as f:
    f.write(declaration_e_content)

print("Created exhibits C, D, and E:")
print("- CHRONOLOGY_EXHIBIT_C.md")
print("- DECLARATION_EXHIBIT_D.md") 
print("- DECLARATION_EXHIBIT_E.md")