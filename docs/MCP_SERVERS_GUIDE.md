# MCP Servers Configuration - Compass Outlaw (Optimized)

**Last Updated:** December 12, 2025
**Project:** Compass Outlaw
**Protocol:** PFV V16.3 (Strategic Singularity)

---

## Overview

This configuration defines the **Strategic Singularity** toolset for Agency Fortress. It is optimized for the **Agent-to-Agent PR Protocol** and strict legal compliance.

**Configuration File:** `config/claude_desktop_config_optimized.json`
**Active Servers:** 11

---

## Core Server Stack

| Server | Purpose | Key Directive |
|--------|---------|---------------|
| **Filesystem** | Direct access to Fortress | Read-only preferred for Evidence |
| **SQLite** | Structured Case Data | Stores One Legal validation cache |
| **GitHub** | Code Operations | **M-019**: Executor cannot self-validate |
| **Google Drive** | Document Retrieval | Source of Truth for Evidence |
| **Gmail** | Communication | **M-001**: "Contemporaneous notes" check |
| **Brave Search** | Intelligence | Attorney background verification |
| **Puppeteer** | Browser Automation | E-Filing Portal interaction |
| **Sequential Thinking** | Complex Reasoning | "Chain of Thought" for legal logic |
| **Memory** | Session Context | Retains case facts across turns |
| **Fetch** | Web Retrieval | Getting latest court rules |
| **iMessage** | Client Comms | **FT-001**: Two-Party Consent rules apply |

---

## Custom Tools

### 1. Legal PDF Processor (`scripts/legal_pdf_processor.py`)
**Role:** The "Clerk Simulator"
**Command:** `python3 scripts/legal_pdf_processor.py <file.pdf>`
**Checks:**
- 24bp Line Height (Nuclear Option)
- "Transcript" prohibition (M-001)
- PDF/A compliance
- File size (< 25MB)

### 2. Court Filing Agent (`src/agents/court_filing_agent_prompt.md`)
**Role:** The "System Prompt" for the specialized persona.
**Mandate:** "Accuracy > Speed"

---

## Installation

1. **Install Dependencies:**
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   npm install -g @modelcontextprotocol/server-github
   npm install -g @modelcontextprotocol/server-brave-search
   npm install -g @modelcontextprotocol/server-puppeteer
   npm install -g @modelcontextprotocol/server-sequential-thinking
   npm install -g @modelcontextprotocol/server-memory
   npm install -g @modelcontextprotocol/server-fetch
   npm install -g @modelcontextprotocol/server-gdrive
   npm install -g @modelcontextprotocol/server-gmail
   ```

2. **Deploy Config:**
   Copy `config/claude_desktop_config_optimized.json` to your Claude Desktop config directory.

3. **Verify:**
   Restart Claude and check the MCP icon.

---

**Status:** ✅ OPTIMIZED & ALIGNED
**Auditor:** Gemini