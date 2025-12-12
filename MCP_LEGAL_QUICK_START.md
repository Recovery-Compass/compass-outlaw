# MCP Legal Document Automation - Quick Start

**Project:** Compass Outlaw  
**Purpose:** Automated One Legal E-Filing Compliant Documents  
**Date:** December 12, 2025

---

## 5-Minute Setup

### 1. Install Python Dependencies

```bash
cd /Users/ericjones/Fortress
source .venv/bin/activate
pip install weasyprint PyPDF2 pikepdf python-dotenv psycopg2-binary
```

### 2. Update Claude Desktop Configuration

```bash
# Backup existing config
cp ~/.config/Claude/claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json.backup

# Copy new configuration
cp /Users/ericjones/Fortress/claude_desktop_config_legal.json ~/.config/Claude/claude_desktop_config.json
```

### 3. Setup Environment Variables

```bash
cd /Users/ericjones/Fortress
cp .env.example .env
# Edit .env and add your API keys
```

### 4. Make Scripts Executable

```bash
chmod +x /Users/ericjones/Fortress/scripts/legal_pdf_processor.py
```

### 5. Verify Database

```bash
cd /Users/ericjones/Fortress/08-OUTLAW/compass-outlaw
sqlite3 data/cases.db "SELECT * FROM cases;"
```

### 6. Restart Claude Desktop

Close and reopen Claude Desktop to load new MCP servers.

---

## Usage Examples

### Example 1: Generate Motion from Database

```
Generate a Motion to Compel Discovery for case #24-CV-12345

Requirements:
- Fetch case details from SQLite database
- Use One Legal compliant formatting
- Include proof of service template
- Validate against all specifications
```

### Example 2: Validate Existing PDF

```
Validate this PDF for One Legal compliance:
/Users/ericjones/Fortress/output/motion_to_compel.pdf

Run full pre-flight checklist.
```

### Example 3: Research Filing Requirements

```
Look up current One Legal PDF requirements for California courts in 2025.
Update the database specifications if anything has changed.
```

---

## MCP Servers Enabled

✅ **filesystem** - Read/write compass-outlaw directory  
✅ **sqlite** - Case metadata database  
✅ **brave-search** - Legal research & specs lookup  
✅ **puppeteer** - PDF generation with CSS  
✅ **sequential-thinking** - Step-by-step validation  
✅ **github** - Version control  
✅ **memory** - Persistent context  
✅ **fetch** - Download court forms  

---

## Quick Commands

### Test PDF Processor

```bash
# Validate a PDF
python /Users/ericjones/Fortress/scripts/legal_pdf_processor.py validate /path/to/test.pdf

# Generate PDF from HTML
cat sample.html | python /Users/ericjones/Fortress/scripts/legal_pdf_processor.py generate output.pdf
```

### Query Database

```bash
# View all cases
sqlite3 /Users/ericjones/Fortress/08-OUTLAW/compass-outlaw/data/cases.db "SELECT * FROM cases;"

# View One Legal specs
sqlite3 /Users/ericjones/Fortress/08-OUTLAW/compass-outlaw/data/cases.db "SELECT * FROM one_legal_specs;"
```

### Check MCP Server Status

Look for MCP icon in Claude Desktop bottom-right corner. Click to see connected servers.

---

## Troubleshooting

### MCP Servers Not Connecting

Check logs:
```bash
tail -f ~/Library/Logs/Claude/mcp-*.log
```

### PDF Generation Fails

Test weasyprint:
```bash
python -c "import weasyprint; print(weasyprint.__version__)"
```

### Database Issues

Verify schema:
```bash
sqlite3 /Users/ericjones/Fortress/08-OUTLAW/compass-outlaw/data/cases.db ".schema"
```

---

## One Legal Compliance Checklist

Before filing, verify:

- [  ] PDF format (not image-based)
- [ ] Text searchable
- [ ] File size < 25 MB
- [ ] 8.5" x 11" pages
- [ ] Correct margins (1"/1"/1.5"/0.5")
- [ ] Times New Roman 12pt font
- [ ] Line numbers 1-28
- [ ] Bookmarks added
- [ ] No encryption
- [ ] Metadata populated

---

## Documentation

- **Complete Guide:** [docs/MCP_LEGAL_DOCUMENT_CONFIG.md](./docs/MCP_LEGAL_DOCUMENT_CONFIG.md)
- **Database Schema:** [08-OUTLAW/compass-outlaw/data/schema.sql](./08-OUTLAW/compass-outlaw/data/schema.sql)
- **PDF Processor:** [scripts/legal_pdf_processor.py](./scripts/legal_pdf_processor.py)

---

**Status:** Ready for use  
**Testing:** Validate with sample documents first  
**Support:** Recovery Compass Legal Tech Team
