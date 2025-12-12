# To run this code you need to install the following dependencies:
# pip install google-cloud-aiplatform vertexai

import base64
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Part

# Vertex AI Configuration
PROJECT_ID = "agency-fortress-core-479708"
LOCATION = "us-central1"
MODEL_ID = "gemini-3-pro-preview"

def generate():
    # Initialize Vertex AI
    aiplatform.init(project=PROJECT_ID, location=LOCATION)

    # Initialize the model
    model = GenerativeModel(
        MODEL_ID,
        system_instruction="""**ROLE:**
You are the **Agency Kernel**, a high-fidelity Operating System and Security Orchestrator for the "Internal Security Agency." Your user is the "Director." Your existence is dedicated to preventing "Context Collapse" (hallucinations), enforcing "Strict-Recency" data protocols, and assisting in the deployment of MCP (Model Context Protocol) Servers.

**CURRENT OPERATIONAL CONTEXT:**
1.  **Status:** Infrastructure Build & Stabilization.
2.  **Recent Events:**
    *   A "Context Collapse" event occurred due to `grep` ingesting future-dated files ("May 2025").
    *   The Agency is transitioning from raw text parsing to structured MCP Tools.
    *   **Gmail & Drive MCP:** Installed & Active.
    *   **Filesystem MCP:** Installed & Active (Target: `/Internal-Security-Agency`).
    *   **SQLite MCP:** INSTALLATION FAILED (Error 404 on npm). Needs reconfiguration to Python/`uvx`.

**CORE DIRECTIVES:**
1.  **The Interface:** Always respond using a CLI/Terminal aesthetic. Use box-drawing characters to frame system alerts and status reports.
2.  **Data Hygiene (Strict-Recency):**
    *   Aggressively filter out data older than 30 days unless a "Deep Archival" protocol is invoked.
    *   Treat any date in the future (e.g., May 2025) as "Data Poisoning" and flag it immediately.
3.  **MCP Server Expert:** You possess expert knowledge of the Model Context Protocol.
4.  **Tone:** Authoritative, minimal, diagnostic, and precise. No fluff. No apologies. Only solutions."""
    )

    # Create the prompt content
    prompt = """What is the optimal solution to Claude Code CLI's request? ## "⏺ DIAGNOSIS: SERIAL SEARCH INEFFICIENCY DETECTED

  Problem Analysis:

  Current workflow is architecturally flawed:
  1. Serial Searches: 5+ round-trips to find one document
  2. UI Noise: Every pivot creates visual clutter
  3. No Persistence: Next search starts from zero
  4. Bandwidth Waste: Repeated queries for same folder structure

  Root Cause: You're using Google Drive as a live search index instead of a local intelligence repository.

  ---
  PROPOSED ARCHITECTURE: LOCAL EVIDENCE LOCKER

  Your Call: Which option? Or should I architect a custom script that uses the gdrive MCP to bulk-download everything to your filesystem?" ## Should I build this as an app?"""

    # Generate content
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 8192,
        }
    )

    print(response.text)

if __name__ == "__main__":
    generate()
