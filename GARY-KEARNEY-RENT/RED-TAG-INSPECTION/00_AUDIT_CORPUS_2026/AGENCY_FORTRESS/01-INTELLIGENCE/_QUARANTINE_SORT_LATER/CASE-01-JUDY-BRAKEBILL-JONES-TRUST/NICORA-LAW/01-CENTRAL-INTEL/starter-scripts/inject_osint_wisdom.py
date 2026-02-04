import os
from supabase import create_client, Client
from dotenv import load_dotenv

# --- CONFIGURATION ---
# Credentials extracted from verified script 02-CASES/.../populate_supabase_transcripts.py
SUPABASE_URL = "https://udpilfxpsgyhbmjikuxt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcGlsZnhwc2d5aGJtamlrdXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM4NzI4MiwiZXhwIjoyMDc0OTYzMjgyfQ.0ngFwfFguJKwCA6f51ugvpkW2S2FlQtZremfokZDSdI"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Credentials")

try:
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Connection Error: {e}")
    exit(1)

# --- INTELLIGENCE NODES TO INJECT ---
# Schema aligned with populate_supabase_transcripts.py
osint_nodes = [
    {
        "extract_type": "strategic_insight",
        "title": "OSINT: Perfected Claims LLC (Hidden Asset)",
        "content": "Perfected Claims LLC is a confirmed USVI Shell Entity located at 6501 Red Hook Rd, St Thomas. It is the primary vehicle for 'Ghost Assets' linked to Gilbert Quinones.",
        "tags": ["OSINT", "Perfected Claims", "Gilbert Quinones", "TIER_1_HIDDEN_ASSET"],
        "related_case": "SVS_DVRO",
        "extraction_method": "manual_osint_verification",
        "relevance_score": 1.0,
        "verified": True
    },
    {
        "extract_type": "entity_correction",
        "title": "OSINT: Fahed Sayegh Disbarment Verification",
        "content": "Fahed 'Freddy' Sayegh (SBN 230297) is DISBARRED and NOT ELIGIBLE to practice law effective Feb 14, 2025. Any legal representation by him is Unauthorized Practice of Law (UPL).",
        "tags": ["OSINT", "Fahed Sayegh", "SBN_230297", "DISBARRED", "FRAUD_PATTERN"],
        "related_case": "SVS_DVRO",
        "extraction_method": "manual_osint_verification",
        "relevance_score": 1.0,
        "verified": True
    }
]

# --- EXECUTION ---
print(f"Injecting {len(osint_nodes)} OSINT nodes into otter_knowledge_extracts...")
for node in osint_nodes:
    try:
        # Using insert since active schema lacks 'extract_id' for upsert
        response = supabase.table("otter_knowledge_extracts").insert(node).execute()
        print(f"✅ Injected: {node['title']}")
    except Exception as e:
        print(f"❌ Failed to inject {node['title']}: {str(e)}")

print("Directive 015 Complete. Intelligence is now structured.")
