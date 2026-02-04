# AUDIT SCRIPT: KNOWLEDGE INTEGRITY CHECK
# Protocol: PFV V16
# Objective: Verify existence of specific wisdom nodes in Supabase

from supabase import create_client, Client
import json

# --- CONFIGURATION ---
# Credentials extracted from verified script 02-CASES/.../populate_supabase_transcripts.py
SUPABASE_URL = "https://udpilfxpsgyhbmjikuxt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcGlsZnhwc2d5aGJtamlrdXh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM4NzI4MiwiZXhwIjoyMDc0OTYzMjgyfQ.0ngFwfFguJKwCA6f51ugvpkW2S2FlQtZremfokZDSdI"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Credentials")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Connection Error: {e}")
    exit(1)

def audit_term(term):
    print(f"\n🔎 Auditing Term: '{term}'...")
    try:
        # Search in title, content, or tags (if applicable)
        # Note: 'ilike' is case-insensitive
        response = supabase.table("otter_knowledge_extracts").select("*").or_(f"title.ilike.%{term}%,content.ilike.%{term}%").execute()
        
        results = response.data
        if results:
            print(f"✅ FOUND {len(results)} entries.")
            for item in results:
                print(f"   - ID: {item.get('id')}")
                print(f"   - Title: {item.get('title')}")
                print(f"   - Content: {item.get('content')[:100]}...") # Truncate for readability
                print(f"   - Tags: {item.get('tags')}")
        else:
            print(f"❌ MISSING. No entries found for '{term}'.")
            
    except Exception as e:
        print(f"⚠️ Query Error for '{term}': {e}")

print("="*50)
print("STARTING KNOWLEDGE INTEGRITY AUDIT")
print("Target Table: otter_knowledge_extracts")
print("="*50)

# 1. Audit "Chatsworth" (Sara Memari Conflict)
audit_term("Chatsworth")

# 2. Audit "Perfected Claims" (Freddy Sayegh/Quinones)
audit_term("Perfected Claims")

# 3. Audit "Red Hook" (Address Verification)
audit_term("Red Hook")

# 4. Audit "Sayegh" (General Disbarment Check)
audit_term("Disbarment")

print("\n" + "="*50)
print("AUDIT COMPLETE")
