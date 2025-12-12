#!/usr/bin/env python3
"""
Legal PDF Processor for One Legal Compliance
Generates court-compliant PDFs with pleading paper formatting

Usage:
    python legal_pdf_processor.py generate < input.html
    python legal_pdf_processor.py validate /path/to/document.pdf
    python legal_pdf_processor.py add_bookmarks /path/to/document.pdf '[{"page": 0, "title": "TOC"}]'
"""

import sys
import json
from pathlib import Path
from typing import Dict, List, Optional

# Check if MCP server mode
MCP_MODE = '--mcp' in sys.argv


def check_dependencies():
    """Check if required libraries are installed"""
    missing = []
    
    try:
        import weasyprint
    except ImportError:
        missing.append('weasyprint')
    
    try:
        import PyPDF2
    except ImportError:
        missing.append('PyPDF2')
    
    try:
        import pikepdf
    except ImportError:
        missing.append('pikepdf')
    
    if missing:
        print(f"ERROR: Missing required libraries: {', '.join(missing)}")
        print(f"Install with: pip install {' '.join(missing)}")
        sys.exit(1)


# Only check dependencies if not in help mode
if '--help' not in sys.argv and '-h' not in sys.argv:
    check_dependencies()

from weasyprint import HTML, CSS
from PyPDF2 import PdfReader, PdfWriter
import pikepdf


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
    
    PLEADING_CSS = """
    @page {
        size: letter;
        margin-top: 1in;
        margin-bottom: 1in;
        margin-left: 1.5in;
        margin-right: 0.5in;
        
        @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
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
    
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        border: 1px solid black;
        padding: 0.5em;
    }
    """
    
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
        
        css_content = self.PLEADING_CSS
        if css_custom:
            css_content += "\n" + css_custom
        
        try:
            html = HTML(string=html_content)
            css = CSS(string=css_content)
            html.write_pdf(output_path, stylesheets=[css])
            
            # Validate
            validation = self.validate_pdf(output_path)
            
            return {
                'success': True,
                'output_path': str(output_path),
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
            return {'passed': False, 'checks': checks, 'errors': errors, 'warnings': warnings}
        
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
                if len(pdf.pages) > 0:
                    page = pdf.pages[0]
                    mediabox = page.MediaBox
                    width = float(mediabox[2]) / 72  # points to inches
                    height = float(mediabox[3]) / 72
                    
                    if abs(width - 8.5) < 0.1 and abs(height - 11) < 0.1:
                        checks['page_size_ok'] = True
                    else:
                        errors.append(f"Wrong page size: {width:.1f}x{height:.1f} (expected 8.5x11)")
                
                # Check metadata
                try:
                    if pdf.docinfo.get('/Title') or pdf.docinfo.get('/Author'):
                        checks['metadata_ok'] = True
                    else:
                        warnings.append("Missing PDF metadata (Title/Author)")
                except:
                    warnings.append("Could not read PDF metadata")
            
            # Check text searchability with PyPDF2
            with open(pdf_path, 'rb') as f:
                reader = PdfReader(f)
                
                # Extract text from first page
                if len(reader.pages) > 0:
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
            'file_size_mb': round(file_size_mb, 2)
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
            
            return {'success': True, 'output_path': str(output_path)}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}


def print_help():
    """Print usage help"""
    help_text = """
Legal PDF Processor - One Legal Compliance Tool

Usage:
    python legal_pdf_processor.py generate < input.html
    python legal_pdf_processor.py validate /path/to/document.pdf
    python legal_pdf_processor.py add_bookmarks /path/to/document.pdf '[{"page": 0, "title": "TOC"}]'

Commands:
    generate        Generate PDF from HTML (reads from stdin)
    validate        Validate PDF against One Legal specs
    add_bookmarks   Add navigation bookmarks to PDF

Options:
    --mcp          Run as MCP server (for Claude Desktop integration)
    --help, -h     Show this help message

Examples:
    # Generate PDF from HTML file
    cat document.html | python legal_pdf_processor.py generate output.pdf
    
    # Validate existing PDF
    python legal_pdf_processor.py validate motion.pdf
    
    # Add bookmarks
    python legal_pdf_processor.py add_bookmarks motion.pdf '[{"page": 0, "title": "Table of Contents"}, {"page": 5, "title": "Exhibits"}]'

Requirements:
    - weasyprint
    - PyPDF2
    - pikepdf

Install with: pip install weasyprint PyPDF2 pikepdf
"""
    print(help_text)


def main():
    """Main entry point"""
    if '--help' in sys.argv or '-h' in sys.argv:
        print_help()
        sys.exit(0)
    
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided. Use --help for usage.'}))
        sys.exit(1)
    
    command = sys.argv[1]
    processor = LegalPDFProcessor()
    
    try:
        if command == 'generate':
            # Read HTML from stdin
            html_content = sys.stdin.read()
            output_path = sys.argv[2] if len(sys.argv) > 2 else 'output.pdf'
            result = processor.generate_pdf_from_html(html_content, output_path)
            print(json.dumps(result, indent=2))
        
        elif command == 'validate':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'No PDF path provided'}))
                sys.exit(1)
            pdf_path = sys.argv[2]
            result = processor.validate_pdf(pdf_path)
            print(json.dumps(result, indent=2))
        
        elif command == 'add_bookmarks':
            if len(sys.argv) < 4:
                print(json.dumps({'error': 'Missing PDF path or bookmarks JSON'}))
                sys.exit(1)
            pdf_path = sys.argv[2]
            bookmarks_json = sys.argv[3]
            bookmarks = json.loads(bookmarks_json)
            result = processor.add_bookmarks(pdf_path, bookmarks)
            print(json.dumps(result, indent=2))
        
        else:
            print(json.dumps({'error': f'Unknown command: {command}. Use --help for usage.'}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
