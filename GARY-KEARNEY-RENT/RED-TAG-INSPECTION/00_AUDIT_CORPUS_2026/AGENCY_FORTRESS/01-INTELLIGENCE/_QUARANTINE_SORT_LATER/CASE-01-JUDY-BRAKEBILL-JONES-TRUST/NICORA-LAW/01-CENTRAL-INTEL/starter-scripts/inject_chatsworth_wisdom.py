# INJECTION SCRIPT: SYNC CHATSWORTH WISDOM
# Protocol: PFV V16
# Objective: Resolve Cloud/Local mismatch by injecting missing wisdom node

from supabase import create_client, Client

# --- CONFIGURATION ---
# Credentials extracted from verified script
SUPABASE_URL = "https://udpilfxpsgyhbmjikuxt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcGlsZnhwc2d5aGJtamlrdXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM4NzI4MiwiZXhwIjoyMDc0OTYzMjgyfQ.0ngFwfFguJKwCA6f51ugvpkW2S2FlQtZremfokZDSdI"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Credentials")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Connection Error: {e}")
    exit(1)

# --- INTELLIGENCE NODE ---
chatsworth_node = {
    "extract_type": "pattern_detection",
    "title": "Chatsworth Conflict Pattern (Sara Memari)",
    "content": "A compelling pattern of legal malpractice documented across 3 consecutive days (Nov 17-19, 2025). Day 1: Disclosure of conflict. Day 2: Confirmation of conflict. Day 3: Harm materializes (Abandonment). This node serves as the primary evidence anchor for State Bar Complaint #2 against Sara Memari.",
    "tags": ["Chatsworth", "Sara Memari", "Scheduling Conflict", "Legal Malpractice", "Pattern", "SBN_332144"],
    "related_case": "C5-HBui",
    "extraction_method": "manual_pattern_verification",
    "relevance_score": 1.0,
    "verified": True
}

# --- EXECUTION ---
print(f"Injecting Chatsworth Conflict node into otter_knowledge_extracts...")

try:
    response = supabase.table("otter_knowledge_extracts").insert(chatsworth_node).execute()
    print(f"✅ Injected: {chatsworth_node['title']}")
except Exception as e:
    print(f"❌ Failed to inject: {str(e)}")

print("Sync Operation Complete.")
