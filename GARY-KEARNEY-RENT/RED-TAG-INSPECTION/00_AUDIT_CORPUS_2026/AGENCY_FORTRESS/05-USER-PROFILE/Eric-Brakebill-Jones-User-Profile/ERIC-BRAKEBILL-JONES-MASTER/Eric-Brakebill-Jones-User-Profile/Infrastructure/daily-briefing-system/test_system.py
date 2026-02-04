#!/usr/bin/env python3
"""Quick system validation without requiring browser authentication"""
import os
import json
from pathlib import Path

print("🔍 Daily Briefing System Validation\n")

# Check files
files_to_check = [
    ('gmail-credentials.json', 'Gmail OAuth credentials'),
    ('calendar-credentials.json', 'Calendar OAuth credentials'),
    ('.env', 'Perplexity API key'),
    ('gmail_intelligence.py', 'Gmail intelligence script'),
    ('calendar_intelligence.py', 'Calendar intelligence script'),
    ('perplexity_intelligence.py', 'Perplexity intelligence script'),
    ('daily_briefing_automation.sh', 'Automation script'),
    ('query_interface.py', 'Query interface'),
    ('DAILY_BRIEFING_CONFIG.json', 'Master configuration')
]

all_good = True
for filename, description in files_to_check:
    if Path(filename).exists():
        print(f"✅ {description}: {filename}")
    else:
        print(f"❌ {description}: {filename} NOT FOUND")
        all_good = False

print("\n📦 Python Environment:")
try:
    from google.auth.transport.requests import Request
    print("✅ google-auth installed")
except:
    print("❌ google-auth NOT installed")
    all_good = False

try:
    from googleapiclient.discovery import build
    print("✅ google-api-python-client installed")
except:
    print("❌ google-api-python-client NOT installed")
    all_good = False

try:
    import requests
    print("✅ requests installed")
except:
    print("❌ requests NOT installed")
    all_good = False

print("\n🔧 Automation:")
launchd_path = Path.home() / 'Library/LaunchAgents/com.recoverycompass.dailybriefing.plist'
if launchd_path.exists():
    print(f"✅ Launchd job configured: {launchd_path}")
else:
    print(f"❌ Launchd job NOT configured")
    all_good = False

print("\n📊 Configuration:")
try:
    with open('DAILY_BRIEFING_CONFIG.json', 'r') as f:
        config = json.load(f)
    print(f"✅ Config loaded: {len(config.get('data_sources', {}))} data source categories")
    print(f"✅ Cases configured: {len(config['data_sources']['primary']['cases']['projects'])} projects")
except Exception as e:
    print(f"❌ Config error: {e}")
    all_good = False

print("\n" + "="*60)
if all_good:
    print("🎉 SYSTEM READY FOR DEPLOYMENT")
    print("\n📝 Next step: First automation run will prompt for Google login")
    print("   After that, runs automatically daily at 9:00 AM")
else:
    print("⚠️  Some components missing - review errors above")

