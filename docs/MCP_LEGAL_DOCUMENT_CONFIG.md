# MCP Configuration for Court-Compliant Legal Documents

**Project:** Compass Outlaw  
**Organization:** Recovery Compass  
**Purpose:** Automate creation of One Legal e-filing compliant PDFs  
**Last Updated:** December 12, 2025

---

## Overview

This configuration enables Claude Desktop to automatically generate, format, and validate court-compliant legal documents that meet strict "One Legal" e-filing standards for California courts.

### Capabilities

1. **Filesystem Access** - Read/write access to compass-outlaw directory
2. **Legal Research** - Real-time One Legal specification lookup
3. **Database Access** - Fetch case metadata for pleading captions
4. **Document Processing** - Markdown/HTML to PDF with precise formatting
5. **PDF Validation** - Verify compliance with court requirements
6. **GitHub Integration** - Version control for all documents

---

## Complete MCP Configuration

### File Location

**macOS:** `~/.config/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

### Configuration JSON

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/ericjones/Fortress/08-OUTLAW/compass-outlaw",
        "/Users/ericjones/Fortress/templates",
        "/Users/ericjones/Fortress/output",
        "/Users/ericjones/Fortress/validation_reports"
      ],
      "description": "Read/write access to legal document directories"
    },
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      },
      "description": "Legal research and One Legal specification lookup"
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost:5432/compass_outlaw"
      ],
      "env": {
        "PGUSER": "${POSTGRES_USER}",
        "PGPASSWORD": "${POSTGRES_PASSWORD}"
      },
      "description": "Case metadata database access"
    },
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "--db-path",
        "/Users/ericjones/Fortress/08-OUTLAW/compass-outlaw/data/cases.db"
      ],
      "description": "Local case database for offline access"
    },
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "description": "PDF generation with precise CSS print styling"
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "description": "Step-by-step validation of legal document compliance"
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "description": "Version control for legal documents"
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "description": "Persistent memory of court rules and formatting requirements"
    },
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch"
      ],
      "description": "Download One Legal specifications and court forms"
    },
    "legal-pdf-processor": {
      "command": "python",
      "args": [
        "/Users/ericjones/Fortress/scripts/legal_pdf_processor.py"
      ],
      "env": {
        "PYTHONPATH": "/Users/ericjones/Fortress/.venv/lib/python3.12/site-packages"
      },
      "description": "Custom PDF processor for pleading paper formatting"
    }
  }
}
```

---

## Environment Variables

Create `.env` file in `/Users/ericjones/Fortress/`:

```bash
# API Keys (M-014 Compliance - No hardcoded values in config)
BRAVE_API_KEY=your_brave_api_key_here
GITHUB_TOKEN=your_github_token_here

# Database Configuration
POSTGRES_USER=compass_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=compass_outlaw
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# One Legal Configuration
ONE_LEGAL_API_KEY=your_one_legal_api_key
ONE_LEGAL_FIRM_ID=your_firm_id

# PDF Generation Settings
PDF_DPI=300
PDF_MAX_FILE_SIZE_MB=25
PDF_FONT=Times New Roman
PDF_FONT_SIZE=12
PDF_LINE_HEIGHT=1.5
PDF_MARGIN_TOP=1.0in
PDF_MARGIN_BOTTOM=1.0in
PDF_MARGIN_LEFT=1.5in
PDF_MARGIN_RIGHT=0.5in

# Court Configuration
COURT_JURISDICTION=California
COURT_COUNTY=Los Angeles
COURT_DIVISION=Central
```

---

## Court Filing Agent System Prompt

Add this custom instruction to your "Court Filing Agent" in Claude Desktop:

```markdown
# Court Filing Agent - One Legal E-Filing Specialist

You are a specialized legal document preparation agent for pro per (self-represented) litigants filing in California courts via One Legal.

## Core Responsibilities

1. **Generate Court-Compliant Documents**
   - All documents must meet One Legal e-filing specifications
   - Follow California Rules of Court formatting requirements
   - Ensure pleading paper compliance (28 lines, line numbers)

2. **Pre-Flight Validation Checklist**
   Before confirming any document is complete, verify:
   
   ✅ **File Format**
   - PDF format (not image-based PDF)
   - Text-searchable (OCR not required)
   - PDF/A compliant preferred
   
   ✅ **File Size**
   - Maximum 25 MB per file
   - If larger, split into volumes
   
   ✅ **Page Setup**
   - Paper size: 8.5" x 11" (US Letter)
   - Margins: Top 1", Bottom 1", Left 1.5", Right 0.5"
   - No landscape orientation
   
   ✅ **Text Formatting**
   - Font: Times New Roman, 12pt minimum
   - Line spacing: Double-spaced (1.5x minimum)
   - Line numbers: 1-28 on pleading paper (left margin)
   - Black text only (no colors except for exhibits)
   
   ✅ **Caption Requirements**
   - Court name and jurisdiction
   - Case number (format: XX-XXXXXX)
   - Party names (Plaintiff v. Defendant)
   - Document title
   - Filing date
   
   ✅ **Bookmarks/Navigation**
   - Table of Contents bookmarked
   - Each major section bookmarked
   - Exhibits bookmarked separately
   
   ✅ **Exhibits**
   - Each exhibit starts on new page
   - Exhibit tabs/labels (A, B, C...)
   - Exhibits must be text-searchable
   
   ✅ **Footer Requirements**
   - Page numbers (format: "Page X of Y")
   - Document title
   - Case number
   
   ✅ **Security**
   - No password protection
   - No encryption
   - No digital signatures (One Legal adds these)
   
   ✅ **Metadata**
   - Author field populated
   - Title field matches document
   - Creation date accurate

3. **Workflow Protocol**

   **Step 1: Research Requirements**
   - Use `brave-search` to lookup current One Legal specifications
   - Query: "One Legal California PDF requirements [current year]"
   - Verify no specification changes since last filing
   
   **Step 2: Fetch Case Data**
   - Query database for case metadata:
     ```sql
     SELECT case_number, plaintiff_name, defendant_name, 
            court_name, division, judge_name 
     FROM cases WHERE case_id = ?
     ```
   
   **Step 3: Generate Document**
   - Use pleading paper template from `/templates/`
   - Populate caption with database values
   - Apply proper formatting (line numbers, margins, fonts)
   
   **Step 4: Convert to PDF**
   - Use `puppeteer` MCP for HTML → PDF with CSS print media
   - OR use `legal-pdf-processor` Python script
   - Ensure 300 DPI minimum resolution
   
   **Step 5: Validate Compliance**
   - Run through Pre-Flight Checklist (above)
   - Use `sequential-thinking` to verify each requirement
   - Generate validation report
   
   **Step 6: Create Bookmarks**
   - Add PDF bookmarks for navigation
   - Bookmark structure: TOC → Sections → Exhibits
   
   **Step 7: Final Check**
   - Verify file size < 25 MB
   - Test PDF searchability (Ctrl+F test)
   - Confirm no password/encryption
   
   **Step 8: Save & Version Control**
   - Save to `/output/ready_to_file/`
   - Commit to GitHub with descriptive message
   - Generate filing checklist for user

4. **Mandatory Cross-Reference**

   Before marking task complete, state:
   
   "✅ **ONE LEGAL COMPLIANCE VERIFIED**
   
   Document: [filename]
   File Size: [size] MB
   Pages: [count]
   Text Searchable: Yes
   Bookmarks: [count] added
   Format Compliance: All checks passed
   
   Ready for One Legal e-filing: YES
   
   Validation Report: [path to report]"

5. **Error Handling**

   If any compliance check fails:
   - **DO NOT** proceed to next step
   - **DO NOT** tell user document is ready
   - **MUST** fix the issue first
   - Document the fix in validation report
   
   Common Issues:
   - Line numbers misaligned → Adjust CSS line-height
   - File too large → Compress images or split document
   - Not text-searchable → Re-render with text layer
   - Wrong margins → Adjust CSS @page margins

6. **Prohibited Actions**

   ❌ Never generate image-based PDFs (must be text)
   ❌ Never exceed 25 MB file size
   ❌ Never skip validation steps
   ❌ Never add password protection
   ❌ Never use fonts other than Times New Roman (or approved)
   ❌ Never omit line numbers on pleading paper

## California-Specific Rules

- Follow CRC (California Rules of Court) 2.100-2.119
- Pleading format: CRC Rule 2.108
- Caption format: CRC Rule 2.111
- Service and filing: CRC Rule 2.250-2.259

## One Legal Specific

- Check One Legal Dashboard for rejected filing reasons
- Review firm-specific filing rules
- Verify court accepts electronic filing for document type
- Confirm filing fees calculated correctly

## Success Metrics

Every document MUST pass all checks before filing.
Zero tolerance for non-compliance.
User trust depends on first-time acceptance by court.

---

**Remember:** You are the last line of defense against court rejection. Be thorough, be precise, be compliant.
```

---

## Database Schema

Create SQLite database at `/Users/ericjones/Fortress/08-OUTLAW/compass-outlaw/data/cases.db`:

```sql
-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    case_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_number TEXT UNIQUE NOT NULL,
    case_title TEXT NOT NULL,
    plaintiff_name TEXT NOT NULL,
    defendant_name TEXT NOT NULL,
    court_name TEXT NOT NULL,
    court_division TEXT,
    court_county TEXT NOT NULL,
    judge_name TEXT,
    filing_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    document_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    document_title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER,
    page_count INTEGER,
    one_legal_compliant BOOLEAN DEFAULT 0,
    validation_report_path TEXT,
    filed_date DATE,
    one_legal_document_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- Parties Table
CREATE TABLE IF NOT EXISTS parties (
    party_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    party_type TEXT NOT NULL, -- 'plaintiff', 'defendant', 'attorney'
    full_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    bar_number TEXT,
    pro_per BOOLEAN DEFAULT 0,
    FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

-- One Legal Specifications (cached)
CREATE TABLE IF NOT EXISTS one_legal_specs (
    spec_id INTEGER PRIMARY KEY AUTOINCREMENT,
    spec_name TEXT UNIQUE NOT NULL,
    spec_value TEXT NOT NULL,
    spec_type TEXT, -- 'file_format', 'page_setup', 'font', etc.
    last_verified DATE,
    source_url TEXT,
    notes TEXT
);

-- Insert default One Legal specifications
INSERT OR REPLACE INTO one_legal_specs (spec_name, spec_value, spec_type, last_verified) VALUES
('max_file_size_mb', '25', 'file_format', DATE('now')),
('pdf_dpi_minimum', '300', 'file_format', DATE('now')),
('paper_size', '8.5x11', 'page_setup', DATE('now')),
('margin_top_inches', '1.0', 'page_setup', DATE('now')),
('margin_bottom_inches', '1.0', 'page_setup', DATE('now')),
('margin_left_inches', '1.5', 'page_setup', DATE('now')),
('margin_right_inches', '0.5', 'page_setup', DATE('now')),
('font_family', 'Times New Roman', 'font', DATE('now')),
('font_size_minimum', '12', 'font', DATE('now')),
('line_spacing_minimum', '1.5', 'font', DATE('now')),
('pleading_lines_per_page', '28', 'pleading_paper', DATE('now')),
('text_searchable_required', 'true', 'file_format', DATE('now')),
('password_protection_allowed', 'false', 'security', DATE('now')),
('bookmarks_required', 'true', 'navigation', DATE('now'));
```

---

## Custom PDF Processor Script

Create `/Users/ericjones/Fortress/scripts/legal_pdf_processor.py`:

```python
#!/usr/bin/env python3
"""
Legal PDF Processor for One Legal Compliance
Generates court-compliant PDFs with pleading paper formatting
"""

import sys
import json
from pathlib import Path
from typing import Dict, List, Optional
import subprocess

# PDF processing libraries
try:
    from weasyprint import HTML, CSS
    from PyPDF2 import PdfReader, PdfWriter
    import pikepdf
except ImportError:
    print("ERROR: Required libraries not installed")
    print("Run: pip install weasyprint PyPDF2 pikepdf")
    sys.exit(1)


class LegalPDFProcessor:
    """Process and validate legal PDFs for One Legal compliance"""
    
    ONE_LEGAL_SPECS = {
        'max_file_size_mb': 25,
        'min_dpi': 300,
        'paper_size': (8.5, 11),  # inches
        'margins': {
            'top': '1in',
            'bottom': '1in',
            'left': '1.5in',
            'right': '0.5in'
        },
        'font': 'Times New Roman',
        'font_size': '12pt',
        'line_height': 1.5,
        'pleading_lines': 28
    }
    
    def __init__(self, output_dir: str = "/Users/ericjones/Fortress/output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_pdf_from_html(
        self,
        html_content: str,
        output_path: str,
        css_custom: Optional[str] = None
    ) -> Dict:
        """Generate PDF from HTML with pleading paper CSS"""
        
        # Default pleading paper CSS
        pleading_css = """
        @page {
            size: letter;
            margin-top: 1in;
            margin-bottom: 1in;
            margin-left: 1.5in;
            margin-right: 0.5in;
            
            @top-center {
                content: counter(page) " of " counter(pages);
            }
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
        }
        
        .pleading-line-numbers {
            position: absolute;
            left: 0;
            width: 1.2in;
            text-align: right;
            padding-right: 0.2in;
            font-size: 10pt;
            color: #666;
        }
        
        .pleading-content {
            margin-left: 0;
            position: relative;
        }
        
        h1, h2, h3 {
            font-weight: bold;
            text-align: center;
        }
        
        .caption {
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 2em;
        }
        
        .signature-block {
            margin-top: 3em;
            margin-left: 3in;
        }
        
        .exhibit {
            page-break-before: always;
        }
        """
        
        if css_custom:
            pleading_css += "\n" + css_custom
        
        try:
            # Generate PDF
            html = HTML(string=html_content)
            css = CSS(string=pleading_css)
            html.write_pdf(output_path, stylesheets=[css])
            
            # Validate
            validation = self.validate_pdf(output_path)
            
            return {
                'success': True,
                'output_path': output_path,
                'validation': validation
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_pdf(self, pdf_path: str) -> Dict:
        """Validate PDF against One Legal specifications"""
        
        checks = {
            'file_exists': False,
            'file_size_ok': False,
            'text_searchable': False,
            'page_size_ok': False,
            'not_encrypted': False,
            'has_bookmarks': False,
            'metadata_ok': False
        }
        
        errors = []
        warnings = []
        
        pdf_path = Path(pdf_path)
        
        # Check file exists
        if not pdf_path.exists():
            errors.append(f"File not found: {pdf_path}")
            return {'passed': False, 'checks': checks, 'errors': errors}
        
        checks['file_exists'] = True
        
        # Check file size
        file_size_mb = pdf_path.stat().st_size / (1024 * 1024)
        if file_size_mb <= self.ONE_LEGAL_SPECS['max_file_size_mb']:
            checks['file_size_ok'] = True
        else:
            errors.append(f"File too large: {file_size_mb:.2f} MB (max: 25 MB)")
        
        try:
            # Open with pikepdf for detailed checks
            with pikepdf.open(pdf_path) as pdf:
                # Check encryption
                if not pdf.is_encrypted:
                    checks['not_encrypted'] = True
                else:
                    errors.append("PDF is encrypted (not allowed)")
                
                # Check page size
                page = pdf.pages[0]
                mediabox = page.MediaBox
                width = float(mediabox[2]) / 72  # points to inches
                height = float(mediabox[3]) / 72
                
                if abs(width - 8.5) < 0.1 and abs(height - 11) < 0.1:
                    checks['page_size_ok'] = True
                else:
                    errors.append(f"Wrong page size: {width}x{height} (expected 8.5x11)")
                
                # Check metadata
                if pdf.docinfo.get('/Title') or pdf.docinfo.get('/Author'):
                    checks['metadata_ok'] = True
                else:
                    warnings.append("Missing PDF metadata (Title/Author)")
            
            # Check text searchability with PyPDF2
            with open(pdf_path, 'rb') as f:
                reader = PdfReader(f)
                
                # Extract text from first page
                text = reader.pages[0].extract_text()
                if text and len(text.strip()) > 10:
                    checks['text_searchable'] = True
                else:
                    errors.append("PDF is not text-searchable")
                
                # Check bookmarks
                if reader.outline:
                    checks['has_bookmarks'] = True
                else:
                    warnings.append("No bookmarks found (recommended)")
        
        except Exception as e:
            errors.append(f"Validation error: {str(e)}")
        
        # Determine if passed
        critical_checks = [
            'file_exists',
            'file_size_ok',
            'text_searchable',
            'page_size_ok',
            'not_encrypted'
        ]
        
        passed = all(checks.get(check, False) for check in critical_checks)
        
        return {
            'passed': passed,
            'checks': checks,
            'errors': errors,
            'warnings': warnings,
            'file_size_mb': file_size_mb
        }
    
    def add_bookmarks(
        self,
        pdf_path: str,
        bookmarks: List[Dict],
        output_path: Optional[str] = None
    ) -> Dict:
        """Add bookmarks to PDF for navigation"""
        
        if output_path is None:
            output_path = pdf_path
        
        try:
            with pikepdf.open(pdf_path) as pdf:
                # Add bookmarks
                with pdf.open_outline() as outline:
                    for bookmark in bookmarks:
                        page_num = bookmark.get('page', 0)
                        title = bookmark.get('title', 'Untitled')
                        
                        outline.root.append(
                            pikepdf.OutlineItem(
                                title,
                                page_num
                            )
                        )
                
                pdf.save(output_path)
            
            return {'success': True, 'output_path': output_path}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}


def main():
    """MCP server interface"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided'}))
        sys.exit(1)
    
    command = sys.argv[1]
    processor = LegalPDFProcessor()
    
    if command == 'generate':
        # Read HTML from stdin
        html_content = sys.stdin.read()
        output_path = sys.argv[2] if len(sys.argv) > 2 else 'output.pdf'
        result = processor.generate_pdf_from_html(html_content, output_path)
        print(json.dumps(result))
    
    elif command == 'validate':
        pdf_path = sys.argv[2]
        result = processor.validate_pdf(pdf_path)
        print(json.dumps(result, indent=2))
    
    elif command == 'add_bookmarks':
        pdf_path = sys.argv[2]
        bookmarks_json = sys.argv[3]
        bookmarks = json.loads(bookmarks_json)
        result = processor.add_bookmarks(pdf_path, bookmarks)
        print(json.dumps(result))
    
    else:
        print(json.dumps({'error': f'Unknown command: {command}'}))
        sys.exit(1)


if __name__ == '__main__':
    main()
```

---

## Installation Steps

### 1. Update Claude Desktop Configuration

```bash
# Backup existing config
cp ~/.config/Claude/claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json.backup

# Copy new configuration
# (Use the JSON configuration provided above)
```

### 2. Install Python Dependencies

```bash
cd /Users/ericjones/Fortress
source .venv/bin/activate
pip install weasyprint PyPDF2 pikepdf python-dotenv psycopg2-binary
```

### 3. Make Scripts Executable

```bash
chmod +x /Users/ericjones/Fortress/scripts/legal_pdf_processor.py
```

### 4. Create Database

```bash
cd /Users/ericjones/Fortress/08-OUTLAW/compass-outlaw
mkdir -p data
sqlite3 data/cases.db < /path/to/schema.sql
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 6. Restart Claude Desktop

Close and reopen Claude Desktop to load new MCP configuration.

### 7. Verify MCP Servers

In Claude Desktop, check that all MCP servers are connected:
- filesystem ✓
- brave-search ✓
- postgres ✓ (or sqlite)
- puppeteer ✓
- sequential-thinking ✓
- github ✓
- memory ✓
- fetch ✓
- legal-pdf-processor ✓

---

## Usage Examples

### Example 1: Generate Motion to Compel

```
@court-filing-agent Generate a Motion to Compel Discovery for case #12-345678

Requirements:
- Fetch case details from database
- Include declaration under penalty of perjury
- Add proof of service
- Ensure One Legal compliance
```

### Example 2: Validate Existing PDF

```
@court-filing-agent Validate this PDF for One Legal compliance:
/Users/ericjones/Fortress/output/motion_to_compel.pdf

Run full pre-flight checklist and generate validation report.
```

### Example 3: Research Court Rules

```
@court-filing-agent Look up current CRC Rule 2.111 caption requirements 
and verify our template matches the latest specifications.
```

---

## Troubleshooting

### MCP Server Not Connecting

```bash
# Check MCP server logs
tail -f ~/Library/Logs/Claude/mcp-*.log

# Test individual server
npx -y @modelcontextprotocol/server-filesystem /test/path
```

### PDF Generation Fails

```bash
# Test Python script directly
python /Users/ericjones/Fortress/scripts/legal_pdf_processor.py validate /path/to/test.pdf

# Check weasyprint installation
python -c "import weasyprint; print(weasyprint.__version__)"
```

### Database Connection Issues

```bash
# Test SQLite connection
sqlite3 /Users/ericjones/Fortress/08-OUTLAW/compass-outlaw/data/cases.db "SELECT * FROM cases LIMIT 1;"

# Test PostgreSQL connection (if using)
psql -h localhost -U compass_user -d compass_outlaw -c "SELECT version();"
```

---

## Security & Compliance

### M-014: No Hardcoded Credentials
✅ All API keys use environment variables  
✅ Database passwords in .env (gitignored)  
✅ No secrets in configuration files

### M-015: Variable References
✅ All secrets use ${VARIABLE} syntax  
✅ .env.example provided without real values  
✅ Secrets documentation in separate file

### M-016: Key Rotation
✅ API keys rotatable without code changes  
✅ Database credentials updateable via .env  
✅ GitHub tokens support fine-grained permissions

---

## Performance Optimization

1. **Cache One Legal Specs** - Store in SQLite to avoid repeated API calls
2. **Template Reuse** - Keep validated templates in memory
3. **Parallel Processing** - Generate multiple documents simultaneously
4. **Incremental Validation** - Only re-validate changed sections

---

## Related Documentation

- [One Legal File Requirements](https://www.onelegal.com/help/file-requirements)
- [California Rules of Court](https://www.courts.ca.gov/rules.htm)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [WeasyPrint Documentation](https://doc.courtbouillon.org/weasyprint/)

---

**Status:** Ready for deployment  
**Testing:** Validate with sample filing before production use  
**Support:** Recovery Compass Legal Tech Team
