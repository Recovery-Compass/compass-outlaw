#!/bin/bash
# DASHBOARD UPDATE PROMPT - Quick Command for Eric Jones
# Usage: When you have new developments to add to project dashboards
# Created: October 29, 2025

cat << 'EOF'

═══════════════════════════════════════════════════════════════════
  DASHBOARD UPDATE WORKFLOW - COPY THIS PROMPT TO CLAUDE
═══════════════════════════════════════════════════════════════════

Update my project dashboards with these recent developments:

**Directory to analyze:** [PASTE DIRECTORY PATH HERE]

**Project Area:** [SELECT ONE: SVS / Judy Trust / Kathy Hart / Recovery Compass]

**What happened:** [BRIEF DESCRIPTION OF DEVELOPMENT]

**Timeframe:** [DATE/TIME OF EVENTS]

---

**INSTRUCTIONS FOR CLAUDE:**

1. Read all files in the specified directory
2. Extract key developments, decisions, and outcomes
3. Update the relevant live status file:
   - ~/SVS_ATTORNEY_TRANSITION_LIVE_STATUS.md (for SVS/Nuha case)
   - ~/JUDY_TRUST_LIVE_STATUS.md (for Judy Trust matters)
   - ~/KATHY_HART_POA_LIVE_STATUS.md (for Kathy Hart/JPMorgan case)
   - ~/RECOVERY_COMPASS_LIVE_STATUS.md (for Recovery Compass projects)

4. Generate executive summary showing:
   - What changed (key developments)
   - Current status (where things stand now)
   - Next actions (what needs to happen)
   - Threat assessment (any new risks)
   - Blind spots (what might be missing)

5. Preserve all historical context in the status file
6. Add timestamps for all updates
7. Flag any immediate action items

---

**OUTPUT REQUIREMENTS:**

✅ Updated live status file (with complete history)
✅ Executive summary (concise, actionable)
✅ Timeline of events (if applicable)
✅ Next actions list (prioritized)
✅ Any templates or scripts generated (if applicable)

═══════════════════════════════════════════════════════════════════

**QUICK VARIANTS:**

For SVS updates:
"Update SVS dashboard with developments in: [directory]"

For Judy Trust updates:
"Update Judy Trust dashboard with developments in: [directory]"

For Kathy Hart updates:
"Update Kathy Hart dashboard with developments in: [directory]"

For Recovery Compass updates:
"Update Recovery Compass dashboard with developments in: [directory]"

For all projects (morning briefing):
"Generate morning briefing for all four projects: SVS, Judy Trust, Kathy Hart, Recovery Compass"

═══════════════════════════════════════════════════════════════════

EOF
