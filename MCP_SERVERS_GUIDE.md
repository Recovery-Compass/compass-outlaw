# MCP Servers Configuration - Compass Outlaw

**Last Updated:** December 4, 2025  
**Project:** Compass Outlaw  
**Protocol:** PFV V16

---

## Overview

Compass Outlaw integrates 19 Model Context Protocol (MCP) servers for comprehensive legal advocacy, attorney accountability, and domestic violence case management.

**Configuration File:** `claude_desktop_config_COMPASS_OUTLAW.json`  
**Total Servers:** 19 (including N8N advanced automation)

---

## Critical Servers for Compass Outlaw

### 1. Playwright (Browser Automation) ⭐
**Package:** `@executeautomation/playwright-mcp-server`  
**Purpose:** Web automation for State Bar complaints, court e-filing, form filling

**Use Cases:**
- Auto-fill State Bar complaint forms at https://apps.calbar.ca.gov/complaint/
- Navigate court e-filing portals
- Scrape attorney disciplinary records
- Extract data from LASC case search
- Automate evidence upload workflows

**Commands:**
```typescript
// Example: Fill State Bar complaint form
await playwright.navigateTo("https://apps.calbar.ca.gov/complaint/");
await playwright.fillForm({
  complainantName: "Nuha Sayegh",
  attorneyBarNumber: "234013",
  // ... etc
});
```

---

### 2. Manus AI (Legal Research) ⭐
**Package:** `@manusfoundation/manus-mcp-server`  
**API Key:** Configured (sk-vP81c9S43620Vh9nj6cwpAovaLtHP4Nuq1wOEVUy9DPAizBqThAtgwseV2Gj)

**Purpose:** Advanced legal document analysis, case research, citation verification

**Use Cases:**
- Analyze 600+ file evidence dossiers
- Extract relevant California Probate Code sections
- Verify case law citations
- Generate legal research summaries
- Cross-reference attorney misconduct patterns

**Integration:**
```typescript
const analysis = await manus.analyzeDocument({
  type: "income_expense_declaration",
  content: fl150PDF,
  jurisdiction: "California"
});
```

---

### 3. Cerebra Legal (California Law) ⭐
**Package:** `mcp-cerebra-legal-server`

**Purpose:** Specialized California legal research, attorney verification, State Bar lookup

**Use Cases:**
- Real-time California Rules of Professional Conduct lookup
- Attorney State Bar status verification
- California Probate Code section retrieval
- Family Law code research
- Domestic violence statute analysis

**Features:**
- Current California statutes (updated regularly)
- Attorney disciplinary history search
- Case law specific to California courts
- Local court rules (LA Superior, etc.)

---

### 4. N8N (Advanced Workflow Automation) ⭐⭐⭐
**URL:** https://compass-outlaw.app.n8n.cloud/mcp-server/http  
**Type:** Self-hosted, MCP-enabled workflow automation

**Purpose:** Advanced workflow automation, complex integrations, data pipelines

**Key Features:**
- Visual workflow builder
- 400+ integrations
- Custom code execution (JavaScript/Python)
- Database operations
- API integrations
- Scheduled workflows
- Webhook triggers
- Error handling & retry logic

**Use Cases for Compass Outlaw:**

1. **State Bar Complaint Pipeline:**
   ```
   Trigger: New complaint filed
   → Extract evidence from Fortress
   → Generate SHA256 checksums
   → Upload to Supabase
   → Auto-fill State Bar form (Playwright)
   → Send confirmation email
   → Log to Airtable
   → SMS notification to client
   ```

2. **Attorney Intelligence Gathering:**
   ```
   Trigger: New attorney added
   → Search State Bar records (Cerebra)
   → Query CourtListener for cases
   → Brave Search for reputation
   → Reddit OSINT scan
   → Aggregate data
   → Store in Supabase
   → Generate report
   → Email to team
   ```

3. **Evidence Processing Pipeline:**
   ```
   Trigger: File uploaded to /evidence/
   → Calculate checksum
   → Convert PDF to text (Doc Ops)
   → Analyze with Manus AI
   → Extract key facts
   → Tag and categorize
   → Store metadata in Supabase
   → Update case timeline
   → Notify attorney
   ```

4. **Court Deadline Monitoring:**
   ```
   Trigger: Daily at 8 AM
   → Query Supabase for upcoming deadlines
   → Check if <7 days away
   → Send email reminder
   → Send SMS alert
   → Update dashboard
   → Log reminder sent
   ```

5. **Client Communication Automation:**
   ```
   Trigger: Case status change
   → Generate update summary
   → Send email via Resend
   → Send SMS via Twilio
   → Log to iMessage
   → Update client portal
   → Record communication
   ```

**Integration with Other MCP Servers:**
- **Playwright:** Trigger browser automation from N8N workflows
- **Manus AI:** Send documents for analysis, receive structured results
- **Supabase:** Read/write database, trigger on DB changes
- **Cerebra:** Query legal databases within workflows
- **GitHub:** Auto-commit workflow changes, trigger deploys

**N8N vs Zapier:**
| Feature | N8N | Zapier |
|---------|-----|--------|
| Custom Code | ✅ Full JS/Python | ⚠️ Limited |
| Self-Hosted | ✅ Yes | ❌ Cloud only |
| MCP Integration | ✅ Native | ⚠️ Via proxy |
| Database Access | ✅ Direct | ⚠️ Via API |
| Cost | ✅ Fixed | ⚠️ Per execution |
| Debugging | ✅ Full logs | ⚠️ Limited |

**Recommended for:**
- Complex multi-step workflows
- Database-heavy operations
- Custom integrations
- High-volume automation
- Cost-sensitive projects

---

### 5. Zapier (Simple Automation)
**URL:** https://actions.zapier.com/mcp/server

**Purpose:** Quick, simple workflow automation

**Use Cases:**
- Simple email notifications
- Single-step integrations
- Quick prototypes

**Note:** Use N8N for complex workflows, Zapier for simple triggers.

---

### 6. Supabase (Database) ⭐
**Package:** `mcp-server-supabase`  
**Project ID:** ftiiajmvmxthcpdwqerh  
**URL:** https://ftiiajmvmxthcpdwqerh.supabase.co

**Purpose:** Direct database access for Compass Outlaw data

**Tables:**
- `function_usage_logs` - API call audit trail
- `cases` - Active domestic violence cases
- `attorneys` - Attorney performance tracking
- `evidence` - Document metadata and checksums
- `complaints` - State Bar complaints filed

**Integration with N8N:**
```javascript
// N8N workflow: Trigger on new Supabase row
// 1. Listen for INSERT on 'cases' table
// 2. Extract case data
// 3. Trigger attorney research workflow
// 4. Update case with findings
```

**Queries:**
```sql
-- Get attorney misconduct patterns
SELECT attorney_id, COUNT(*) as violations
FROM function_usage_logs
WHERE function_name = 'attorney-accountability'
GROUP BY attorney_id
ORDER BY violations DESC;
```

---

## Supporting Servers

### 7. GitHub
**Purpose:** Repository management, version control, deployment

**Features:**
- Push/pull commits
- Create branches
- Manage issues
- Deploy to production
- Review PRs

---

### 8. Context7
**API Key:** ${CONTEXT7_API_KEY}

**Purpose:** Real-time legal documentation and statute lookup

**Use Cases:**
- Current California Probate Code sections
- State Bar Rules of Professional Conduct
- Updated court procedures
- Recent legislative changes

---

### 9. CourtListener
**API Key:** ${COURTLISTENER_API_KEY}

**Purpose:** Federal and state case law, dockets, opinions

**Features:**
- Search 10M+ cases
- Get attorney litigation history
- Download court documents
- Track active dockets
- Find similar cases

---

### 10. Brave Search
**API Key:** ${BRAVE_API_KEY}

**Purpose:** Fast, privacy-focused web search

**Use Cases:**
- Attorney reputation research
- State Bar public records
- News articles about attorneys
- Professional social media profiles

---

### 11. Firecrawl
**API Key:** ${FIRECRAWL_API_KEY}

**Purpose:** Advanced web scraping with JavaScript rendering

**Features:**
- Scrape attorney websites
- Extract court calendar data
- Parse legal directories
- Capture dynamic content

---

### 12. Cloudflare
**Token:** 0YzzhykG9KzMx3Q8UDwAT5VSMGTvlbovnN9uU2Kt  
**Account:** 876573804668414b6f7d352de8d35816

**Purpose:** CDN management, DNS, deployment

---

### 13. Sequential Thinking
**Purpose:** Enhanced reasoning for complex legal analysis

**Use Cases:**
- Multi-step legal strategy development
- Complex evidence chain analysis
- Attorney accountability pattern detection

---

### 14. Doc Ops MCP
**Purpose:** Universal document conversion

**Formats:**
- PDF ↔ DOCX ↔ HTML ↔ Markdown
- Batch processing
- OCR support
- Image extraction

---

### 15. Word Document Server
**Purpose:** Microsoft Word document creation with signatures

**Features:**
- Create legal filings
- Insert digital signatures
- Format according to court rules
- Generate from templates

---

### 16. YouTube
**Purpose:** Extract transcripts from legal education videos

**Use Cases:**
- CLE presentation analysis
- Legal tutorial transcription
- Attorney speaking engagement research

---

### 17. Reddit
**Purpose:** OSINT from legal subreddits

**Communities:**
- r/legaladvice
- r/Probate
- r/paralegal
- r/lawyers

---

### 18. iMessage
**Purpose:** SMS/iMessage integration

**Use Cases:**
- Client communication logging
- Evidence collection from texts
- Automated client updates
- Emergency notifications

---

### 19. Filesystem
**Path:** `/Users/ericjones/Fortress`

**Purpose:** Direct access to Fortress directory structure

**Key Paths:**
- `02-CASES/` - Active cases
- `04-ASSETS/` - API credentials
- `08-OUTLAW/` - Compass Outlaw project
- `05-KNOWLEDGE/` - Legal research

---

## Installation & Setup

### Install All Servers

```bash
# Core servers (npm)
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @executeautomation/playwright-mcp-server
npm install -g @manusfoundation/manus-mcp-server
npm install -g mcp-cerebra-legal-server
npm install -g @context7/mcp-server
npm install -g @modelcontextprotocol/server-brave-search
npm install -g @modelcontextprotocol/server-courtlistener
npm install -g firecrawl-mcp
npm install -g doc-ops-mcp

# Python servers (uvx)
uvx install mcp-server-supabase
uvx install office-word-mcp-server

# Cloudflare
npm install -g @cloudflare/mcp-server-cloudflare
```

### Configure Claude Desktop

1. Copy configuration:
   ```bash
   cp claude_desktop_config_COMPASS_OUTLAW.json \
      ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Restart Claude Desktop

3. Verify servers loaded:
   - Click "MCP Servers" icon
   - Should see all 18 servers active

### Test Each Server

```bash
# Test Playwright
npx @executeautomation/playwright-mcp-server --help

# Test Manus
npx @manusfoundation/manus-mcp-server --version

# Test Cerebra
npx mcp-cerebra-legal-server --version

# Test Supabase
uvx mcp-server-supabase --help
```

---

## Workflow Examples

### Example 1: File State Bar Complaint

```typescript
// 1. Extract data from evidence
const evidence = await filesystem.readFile(
  "/Users/ericjones/Fortress/02-CASES/Case-04_Sayegh-DVRO/H_BUI_MEMARI/STATE_BAR_ATTACHMENTS/"
);

// 2. Verify attorney bar number
const attorney = await cerebraLegal.verifyAttorney({
  name: "Hannah Bui",
  barNumber: "234013"
});

// 3. Navigate to complaint form
await playwright.navigateTo("https://apps.calbar.ca.gov/complaint/");

// 4. Fill form automatically
await playwright.fillComplaintForm({
  complainant: {
    name: "Nuha Sayegh",
    phone: "626-348-3039",
    email: "chefnuha@gmail.com"
  },
  attorney: {
    name: "Hannah Bui",
    barNumber: "234013",
    firm: "H Bui Law Firm"
  },
  violations: [
    "Rule 1.1 (Competence)",
    "Rule 1.3 (Diligence)",
    "Rule 1.7 (Conflict of Interest)"
  ]
});

// 5. Upload exhibits
await playwright.uploadFiles([
  "EXHIBIT_1_FL150_ERROR.pdf",
  "EXHIBIT_2_LATE_LOGIN_EMAIL.pdf",
  // ... etc
]);

// 6. Submit and log
const confirmation = await playwright.submitForm();
await supabase.insertRecord("complaints", {
  case_id: "25PDFL01441",
  attorney_bar: "234013",
  filed_date: new Date(),
  confirmation_number: confirmation
});

// 7. Send notifications via Zapier
await zapier.trigger("complaint_filed", {
  case: "Sayegh",
  attorney: "H Bui",
  confirmation: confirmation
});
```

### Example 2: Attorney Performance Tracking

```typescript
// 1. Get attorney from Cerebra
const attorney = await cerebraLegal.searchAttorney({
  name: "Sara Memari",
  barNumber: "332144"
});

// 2. Check disciplinary history
const history = await cerebraLegal.getDisciplinaryHistory("332144");

// 3. Search case outcomes via CourtListener
const cases = await courtlistener.searchCases({
  attorney: "Sara Memari",
  court: "Los Angeles Superior"
});

// 4. Web search for reputation
const webResults = await braveSearch.search(
  "Sara Memari attorney reviews complaints"
);

// 5. Store in database
await supabase.insertRecord("attorney_intelligence", {
  bar_number: "332144",
  disciplinary_history: history,
  case_count: cases.length,
  reputation_score: calculateScore(webResults)
});
```

### Example 3: Evidence Analysis Pipeline

```typescript
// 1. Read PDF exhibit
const pdf = await filesystem.readFile("EXHIBIT_1_FL150_ERROR.pdf");

// 2. Convert to text via Doc Ops
const text = await docOps.convertToText(pdf);

// 3. Analyze with Manus AI
const analysis = await manus.analyzeFinancialDocument({
  content: text,
  type: "FL-150",
  jurisdiction: "California"
});

// 4. Verify against California law via Context7
const rules = await context7.getCalifornia ProblCode("section 2030");

// 5. Generate report
const report = await sequentialThinking.analyze({
  evidence: analysis,
  law: rules,
  question: "Is the $5,500 income figure correct?"
});

// 6. Store findings
await supabase.insertRecord("evidence_analysis", {
  exhibit_id: "EXHIBIT_1",
  analysis: report,
  violations_found: ["Mathematical error", "Misleading declaration"]
});
```

---

## Security & Best Practices

### API Key Management
- ✅ All keys stored in configuration file
- ✅ Configuration excluded from git (.gitignore)
- ⚠️ Rotate keys every 90 days
- ⚠️ Monitor usage for anomalies

### Rate Limiting
| Server | Limit | Reset |
|--------|-------|-------|
| Manus | 1000/day | 24 hours |
| CourtListener | 5000/day | 24 hours |
| Brave Search | 2000/day | 24 hours |
| Context7 | Unlimited | N/A |
| Firecrawl | 500/month | Monthly |

### Error Handling
```typescript
try {
  const result = await manus.analyze(document);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
  } else if (error.code === 'INVALID_API_KEY') {
    // Alert admin
  }
  // Log to Supabase
  await supabase.insertRecord("errors", {
    server: "manus",
    error: error.message,
    timestamp: new Date()
  });
}
```

---

## Monitoring & Maintenance

### Daily Checks
```bash
# Check server status
claude mcp status

# View recent errors
tail -f ~/Library/Logs/Claude/mcp-servers.log

# Test critical servers
./test-mcp-servers.sh
```

### Weekly Reviews
- API usage by server
- Error rates
- Response times
- Cost per server

### Monthly Audits
- Rotate API keys
- Update server packages
- Review new MCP servers available
- Optimize configurations

---

## Troubleshooting

### Server Not Loading
1. Check configuration syntax
2. Verify npm/uvx installation
3. Check API key validity
4. Review Claude logs

### Slow Performance
1. Check rate limits
2. Optimize query complexity
3. Use caching where possible
4. Consider server health

### API Errors
1. Verify API key hasn't expired
2. Check service status page
3. Review usage limits
4. Contact support if needed

---

## Future Enhancements

### Planned Additions
- [ ] Lex Machina integration (attorney analytics)
- [ ] LexisNexis MCP server
- [ ] Westlaw integration
- [ ] PACER federal court access
- [ ] Email MCP (Gmail/Outlook)
- [ ] Calendar MCP (Google Calendar)

### Custom Servers to Build
- [ ] State Bar complaint tracker
- [ ] Attorney accountability database
- [ ] Evidence chain verification
- [ ] Court deadline calculator

---

## Support & Resources

**Documentation:**
- MCP Protocol: https://modelcontextprotocol.io
- Anthropic MCP Docs: https://docs.anthropic.com/mcp
- This Guide: `MCP_SERVERS_GUIDE.md`

**Configuration:**
- Active Config: `claude_desktop_config_COMPASS_OUTLAW.json`
- API Keys: `.env.production` (not in git)
- Server List: This document

**Testing:**
- Test Script: `test-mcp-servers.sh`
- Logs: `~/Library/Logs/Claude/`

---

**Status:** ✅ 18 servers configured and ready  
**Last Test:** December 4, 2025  
**Next Review:** December 11, 2025  
**Protocol:** PFV V16

*Compiled for Compass Outlaw domestic violence advocacy platform*
