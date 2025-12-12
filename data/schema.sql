-- Compass Outlaw Legal Database Schema
-- Version: 1.0
-- Purpose: Store case metadata for automated legal document generation

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

-- Sample case data (for testing)
INSERT OR IGNORE INTO cases (case_number, case_title, plaintiff_name, defendant_name, court_name, court_county, status) VALUES
('24-CV-12345', 'Doe v. Smith', 'John Doe', 'Jane Smith', 'Superior Court of California, County of Los Angeles', 'Los Angeles', 'active');

-- Sample party data
INSERT OR IGNORE INTO parties (case_id, party_type, full_name, pro_per) VALUES
(1, 'plaintiff', 'John Doe', 1);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_parties_case ON parties(case_id);
CREATE INDEX IF NOT EXISTS idx_specs_type ON one_legal_specs(spec_type);
