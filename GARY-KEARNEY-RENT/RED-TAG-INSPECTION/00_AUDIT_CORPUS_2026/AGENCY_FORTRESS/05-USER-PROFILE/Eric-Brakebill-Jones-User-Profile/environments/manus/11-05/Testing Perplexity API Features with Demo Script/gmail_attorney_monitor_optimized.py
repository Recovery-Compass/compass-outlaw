#!/usr/bin/env python3
"""
Gmail Attorney Monitor - Optimized Version
Eliminates temporal misalignment through Gmail API integration
with enhanced reliability, configuration management, and error handling
"""

import os
import json
import time
import base64
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import re

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient import http as google_http
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False
    print("⚠️  Gmail API libraries not installed. Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")


class GmailAttorneyMonitor:
    """
    Monitors Gmail for attorney communications with enhanced reliability
    PRIMARY source for attorney engagement verification (filesystem is SECONDARY)
    
    Optimizations:
    - External configuration file support
    - Exponential backoff for API errors
    - Batch message retrieval
    - Full email body extraction
    - Rate limit handling
    - Local caching with TTL
    """
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
    DEFAULT_CONFIG_PATH = Path.home() / '.gmail_attorney_monitor_config.json'
    DEFAULT_CACHE_PATH = Path.home() / '.gmail_attorney_monitor_cache.json'
    CACHE_TTL_HOURS = 1  # Cache validity period
    
    def __init__(self, 
                 credentials_path: Optional[str] = None,
                 config_path: Optional[str] = None,
                 enable_cache: bool = True):
        """
        Initialize Gmail monitor with OAuth credentials
        
        Args:
            credentials_path: Path to credentials.json from Google Cloud Console
            config_path: Path to configuration JSON file
            enable_cache: Enable local caching of scan results
        """
        if not GMAIL_AVAILABLE:
            raise RuntimeError("Gmail API libraries not installed")
        
        self.credentials_path = credentials_path or self._find_credentials()
        self.config_path = Path(config_path) if config_path else self.DEFAULT_CONFIG_PATH
        self.cache_path = self.DEFAULT_CACHE_PATH
        self.enable_cache = enable_cache
        
        self.token_path = Path.home() / '.gmail_token.json'
        self.creds = None
        self.service = None
        
        # Load configuration
        self.config = self._load_config()
        self.attorney_contacts = self.config.get('attorney_contacts', {})
        self.engagement_thresholds = self.config.get('engagement_thresholds', {
            'highly_engaged': 24,
            'engaged': 48,
            'moderately_engaged': 72,
            'low_engagement': 168
        })
        
        # Initialize cache
        self.cache = self._load_cache() if enable_cache else {}
        
        self.authenticate()
    
    def _find_credentials(self) -> str:
        """Find Gmail credentials in common locations"""
        search_paths = [
            Path.home() / "environments/api-credentials-vault/gmail-credentials.json",
            Path.home() / "environments/api-credentials-vault/credentials.json",
            Path.home() / ".credentials/gmail-credentials.json",
            Path.home() / "credentials.json",
            Path.cwd() / "gmail-credentials.json",
            Path.cwd() / "credentials.json"
        ]
        
        for path in search_paths:
            if path.exists():
                return str(path)
        
        raise FileNotFoundError(
            "Gmail credentials not found. Download from Google Cloud Console:\n"
            "https://console.cloud.google.com/apis/credentials\n"
            f"Save to one of: {', '.join(str(p) for p in search_paths[:3])}"
        )
    
    def _load_config(self) -> Dict:
        """Load configuration from file or create default"""
        if self.config_path.exists():
            with open(self.config_path, 'r') as f:
                return json.load(f)
        
        # Create default configuration
        default_config = {
            "attorney_contacts": {
                "jonelle_beck": {
                    "emails": ["jcbecklaw@gmail.com", "jonelle@jonellebecklaw.com"],
                    "case": "JJ Trust Property Transfer",
                    "case_id": "21435809"
                },
                "h_bui_firm": {
                    "emails": ["melody@hbuilaw.com", "valerie@hbuilaw.com", 
                              "sara@hbuilaw.com", "hannah@hbuilaw.com"],
                    "case": "SVS DVRO Case 25PDFL01441",
                    "case_id": "25PDFL01441"
                },
                "ramey_flock": {
                    "emails": ["ramey@rameyflock.com", "flock@rameyflock.com"],
                    "case": "Chase Hart POA Settlement",
                    "case_id": "Chase-POA"
                }
            },
            "engagement_thresholds": {
                "highly_engaged": 24,
                "engaged": 48,
                "moderately_engaged": 72,
                "low_engagement": 168
            },
            "risk_zones": {
                "green": 80,
                "yellow": 60,
                "orange": 40
            }
        }
        
        # Save default config
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        print(f"✓ Created default configuration at: {self.config_path}")
        return default_config
    
    def _load_cache(self) -> Dict:
        """Load cache from file"""
        if self.cache_path.exists():
            try:
                with open(self.cache_path, 'r') as f:
                    cache = json.load(f)
                    # Validate cache freshness
                    cache_time = datetime.fromisoformat(cache.get('timestamp', '2000-01-01'))
                    if datetime.now() - cache_time < timedelta(hours=self.CACHE_TTL_HOURS):
                        return cache
            except Exception as e:
                print(f"⚠️  Cache load failed: {e}")
        return {}
    
    def _save_cache(self, data: Dict):
        """Save cache to file"""
        if not self.enable_cache:
            return
        
        cache_data = {
            'timestamp': datetime.now().isoformat(),
            'data': data
        }
        
        try:
            with open(self.cache_path, 'w') as f:
                json.dump(cache_data, f, indent=2, default=str)
        except Exception as e:
            print(f"⚠️  Cache save failed: {e}")
    
    def authenticate(self):
        """Authenticate with Gmail API using OAuth"""
        # Load existing token
        if self.token_path.exists():
            try:
                self.creds = Credentials.from_authorized_user_file(
                    str(self.token_path), 
                    self.SCOPES
                )
            except Exception as e:
                print(f"⚠️  Token load failed: {e}")
                self.creds = None
        
        # Refresh or get new credentials
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                try:
                    self.creds.refresh(Request())
                except Exception as e:
                    print(f"⚠️  Token refresh failed: {e}")
                    self.creds = None
            
            if not self.creds:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, 
                    self.SCOPES
                )
                self.creds = flow.run_local_server(port=0)
            
            # Save token
            try:
                with open(self.token_path, 'w') as token:
                    token.write(self.creds.to_json())
            except Exception as e:
                print(f"⚠️  Token save failed: {e}")
        
        self.service = build('gmail', 'v1', credentials=self.creds)
        print("✓ Gmail API authenticated")
    
    def _api_call_with_retry(self, func, max_retries=3, initial_delay=1):
        """
        Execute API call with exponential backoff retry logic
        
        Args:
            func: Function to execute
            max_retries: Maximum number of retry attempts
            initial_delay: Initial delay in seconds
            
        Returns:
            API response
        """
        delay = initial_delay
        
        for attempt in range(max_retries):
            try:
                return func()
            except HttpError as e:
                if e.resp.status == 429:  # Rate limit
                    if attempt < max_retries - 1:
                        print(f"⚠️  Rate limit hit, retrying in {delay}s...")
                        time.sleep(delay)
                        delay *= 2  # Exponential backoff
                        continue
                    else:
                        raise
                elif e.resp.status >= 500:  # Server error
                    if attempt < max_retries - 1:
                        print(f"⚠️  Server error, retrying in {delay}s...")
                        time.sleep(delay)
                        delay *= 2
                        continue
                    else:
                        raise
                else:
                    raise
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"⚠️  Error: {e}, retrying in {delay}s...")
                    time.sleep(delay)
                    delay *= 2
                    continue
                else:
                    raise
        
        raise RuntimeError(f"API call failed after {max_retries} attempts")
    
    def _batch_get_messages(self, message_ids: List[str]) -> List[Dict]:
        """
        Retrieve multiple messages using batch API
        
        Args:
            message_ids: List of message IDs to retrieve
            
        Returns:
            List of message data dictionaries
        """
        if not message_ids:
            return []
        
        messages = []
        batch_size = 100  # Gmail API batch limit
        
        for i in range(0, len(message_ids), batch_size):
            batch_ids = message_ids[i:i + batch_size]
            batch = self.service.new_batch_http_request()
            
            def create_callback(msg_list):
                def callback(request_id, response, exception):
                    if exception is not None:
                        print(f"⚠️  Batch request error: {exception}")
                    else:
                        msg_list.append(response)
                return callback
            
            for msg_id in batch_ids:
                batch.add(
                    self.service.users().messages().get(
                        userId='me',
                        id=msg_id,
                        format='full'
                    ),
                    callback=create_callback(messages)
                )
            
            try:
                batch.execute()
            except Exception as e:
                print(f"⚠️  Batch execution error: {e}")
        
        return messages
    
    def _extract_email_body(self, payload: Dict) -> str:
        """
        Extract full email body from MIME payload
        
        Args:
            payload: Email payload from Gmail API
            
        Returns:
            Extracted email body text
        """
        body = ""
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        body += base64.urlsafe_b64decode(
                            part['body']['data']
                        ).decode('utf-8', errors='ignore')
                elif part['mimeType'] == 'text/html' and not body:
                    # Fallback to HTML if no plain text
                    if 'data' in part['body']:
                        html_body = base64.urlsafe_b64decode(
                            part['body']['data']
                        ).decode('utf-8', errors='ignore')
                        # Simple HTML tag removal
                        body += re.sub(r'<[^>]+>', '', html_body)
                elif 'parts' in part:
                    # Recursive for nested parts
                    body += self._extract_email_body(part)
        elif 'body' in payload and 'data' in payload['body']:
            body = base64.urlsafe_b64decode(
                payload['body']['data']
            ).decode('utf-8', errors='ignore')
        
        return body.strip()
    
    def scan_attorney_communications(self, hours_back: int = 48) -> Dict:
        """
        Scan Gmail for attorney communications with enhanced reliability
        PRIMARY source for engagement verification
        
        Args:
            hours_back: How many hours back to scan
            
        Returns:
            Dictionary with attorney engagement status
        """
        print(f"\n{'='*70}")
        print(f"GMAIL ATTORNEY COMMUNICATIONS SCAN (OPTIMIZED)")
        print(f"{'='*70}")
        print(f"Scan Window: Last {hours_back} hours")
        print(f"Cache: {'Enabled' if self.enable_cache else 'Disabled'}")
        print()
        
        results = {}
        
        for attorney_name, config in self.attorney_contacts.items():
            print(f"Scanning: {attorney_name.replace('_', ' ').title()}")
            print(f"  Case: {config['case']}")
            print(f"  Email addresses: {', '.join(config['emails'])}")
            
            # Check cache first
            cache_key = f"{attorney_name}_{hours_back}"
            if self.enable_cache and cache_key in self.cache.get('data', {}):
                cached_result = self.cache['data'][cache_key]
                print(f"  ✓ Using cached result")
                results[attorney_name] = cached_result
                continue
            
            attorney_emails = []
            message_ids = []
            
            # Collect message IDs
            for email_addr in config['emails']:
                query = f"(to:{email_addr} OR from:{email_addr}) newer_than:{hours_back}h"
                
                try:
                    messages_result = self._api_call_with_retry(
                        lambda: self.service.users().messages().list(
                            userId='me',
                            q=query,
                            maxResults=100
                        ).execute()
                    )
                    
                    messages = messages_result.get('messages', [])
                    message_ids.extend([msg['id'] for msg in messages])
                    
                except Exception as e:
                    print(f"  ⚠️  Error scanning {email_addr}: {e}")
            
            # Batch retrieve messages
            if message_ids:
                print(f"  Retrieving {len(message_ids)} messages...")
                messages_data = self._batch_get_messages(message_ids)
                
                for msg_data in messages_data:
                    parsed_email = self.parse_email(msg_data)
                    attorney_emails.append(parsed_email)
            
            # Sort by date (most recent first)
            attorney_emails.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Calculate engagement level
            engagement = self.calculate_engagement_level(attorney_emails, hours_back)
            
            result = {
                "status": engagement['status'],
                "email_count": len(attorney_emails),
                "most_recent": attorney_emails[0] if attorney_emails else None,
                "engagement_level": engagement['level'],
                "confidence": engagement['confidence'],
                "case": config['case'],
                "case_id": config['case_id'],
                "emails": attorney_emails[:5]  # Keep 5 most recent
            }
            
            results[attorney_name] = result
            
            # Update cache
            if self.enable_cache:
                if 'data' not in self.cache:
                    self.cache['data'] = {}
                self.cache['data'][cache_key] = result
            
            # Print status
            if engagement['status'] == 'ENGAGED':
                print(f"  ✓ STATUS: ENGAGED")
                if attorney_emails:
                    print(f"  ✓ Most recent: {attorney_emails[0]['date']}")
                    print(f"  ✓ Hours since contact: {engagement['hours_since']:.1f}")
                print(f"  ✓ Confidence: {engagement['confidence']}%")
            else:
                print(f"  ✗ STATUS: NO RECENT CONTACT")
                if engagement['hours_since']:
                    print(f"  ✗ Last contact: {engagement['hours_since']:.1f} hours ago")
                else:
                    print(f"  ✗ Last contact: Never")
            
            print()
        
        # Save cache
        self._save_cache(results)
        
        return results
    
    def parse_email(self, msg_data: Dict) -> Dict:
        """Parse Gmail message data into structured format with full body"""
        headers = {h['name']: h['value'] for h in msg_data['payload']['headers']}
        
        # Get internal date (Gmail's timestamp)
        internal_date = int(msg_data['internalDate']) / 1000
        timestamp = datetime.fromtimestamp(internal_date)
        
        # Extract full body
        body = self._extract_email_body(msg_data['payload'])
        
        # Extract snippet as fallback
        snippet = msg_data.get('snippet', '')
        
        return {
            'id': msg_data['id'],
            'thread_id': msg_data['threadId'],
            'subject': headers.get('Subject', '(No subject)'),
            'from': headers.get('From', ''),
            'to': headers.get('To', ''),
            'date': headers.get('Date', ''),
            'timestamp': timestamp,
            'snippet': snippet,
            'body': body if body else snippet,
            'hours_ago': (datetime.now() - timestamp).total_seconds() / 3600
        }
    
    def calculate_engagement_level(self, emails: List[Dict], window_hours: int) -> Dict:
        """
        Calculate attorney engagement level from email patterns
        Uses configurable thresholds
        
        Returns:
            Status, confidence level, and hours since last contact
        """
        if not emails:
            return {
                'status': 'NO_RECENT_CONTACT',
                'level': 0,
                'confidence': 0,
                'hours_since': None
            }
        
        most_recent = emails[0]
        hours_since = most_recent['hours_ago']
        
        thresholds = self.engagement_thresholds
        
        # Engagement scoring with configurable thresholds
        if hours_since <= thresholds.get('highly_engaged', 24):
            status = 'ENGAGED'
            level = 95
            confidence = 90
        elif hours_since <= thresholds.get('engaged', 48):
            status = 'ENGAGED'
            level = 85
            confidence = 85
        elif hours_since <= thresholds.get('moderately_engaged', 72):
            status = 'ENGAGED'
            level = 75
            confidence = 80
        elif hours_since <= thresholds.get('low_engagement', 168):
            status = 'LOW_ENGAGEMENT'
            level = 60
            confidence = 70
        else:
            status = 'NO_RECENT_CONTACT'
            level = 50
            confidence = 60
        
        # Boost confidence if multiple recent emails
        recent_count = len([e for e in emails if e['hours_ago'] <= 48])
        if recent_count > 1:
            confidence = min(95, confidence + (recent_count * 2))
        
        return {
            'status': status,
            'level': level,
            'confidence': confidence,
            'hours_since': hours_since,
            'recent_email_count': recent_count
        }
    
    def generate_coalition_health_report(self, hours_back: int = 48) -> Dict:
        """
        Generate comprehensive coalition health report from Gmail data
        """
        attorney_status = self.scan_attorney_communications(hours_back)
        
        print(f"{'='*70}")
        print(f"COALITION HEALTH REPORT")
        print(f"{'='*70}")
        print()
        
        # Calculate overall coalition strength
        total_confidence = 0
        attorney_count = len(attorney_status)
        
        for attorney_name, status in attorney_status.items():
            total_confidence += status['confidence']
            
            print(f"{attorney_name.replace('_', ' ').title()}:")
            print(f"  Status: {status['status']}")
            print(f"  Confidence: {status['confidence']}%")
            print(f"  Email Count: {status['email_count']}")
            if status['most_recent']:
                print(f"  Last Contact: {status['most_recent']['date']}")
            print()
        
        overall_coalition = round(total_confidence / attorney_count) if attorney_count > 0 else 0
        
        print(f"OVERALL COALITION STRENGTH: {overall_coalition}%")
        print(f"{'='*70}")
        
        # Determine risk zone using configurable thresholds
        risk_zones = self.config.get('risk_zones', {
            'green': 80,
            'yellow': 60,
            'orange': 40
        })
        
        if overall_coalition >= risk_zones.get('green', 80):
            risk_zone = "GREEN"
            risk_emoji = "🟢"
        elif overall_coalition >= risk_zones.get('yellow', 60):
            risk_zone = "YELLOW"
            risk_emoji = "🟡"
        elif overall_coalition >= risk_zones.get('orange', 40):
            risk_zone = "ORANGE"
            risk_emoji = "🟠"
        else:
            risk_zone = "RED"
            risk_emoji = "🔴"
        
        print(f"\nRisk Zone: {risk_emoji} {risk_zone}")
        print()
        
        return {
            "scan_timestamp": datetime.now().isoformat(),
            "scan_window_hours": hours_back,
            "attorneys": attorney_status,
            "coalition_strength": overall_coalition,
            "risk_zone": risk_zone,
            "attorney_count": attorney_count
        }
    
    def save_report(self, report: Dict, filename: str = None):
        """Save coalition health report to JSON"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"coalition_health_gmail_{timestamp}.json"
        
        report_path = Path.home() / filename
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"✓ Report saved to: {report_path}")
        return report_path


def main():
    """Run Gmail attorney monitoring with optimizations"""
    print("="*70)
    print("GMAIL ATTORNEY MONITOR - OPTIMIZED VERSION")
    print("="*70)
    print()
    
    if not GMAIL_AVAILABLE:
        print("⚠️  Gmail API libraries not installed")
        print("   Install with: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
        return 1
    
    try:
        monitor = GmailAttorneyMonitor(enable_cache=True)
        report = monitor.generate_coalition_health_report(hours_back=72)
        monitor.save_report(report, "COALITION_HEALTH_GMAIL_REPORT.json")
        
        print("\n" + "="*70)
        print("DEPLOYMENT COMPLETE")
        print("="*70)
        print(f"\nConfiguration file: {monitor.config_path}")
        print(f"Cache file: {monitor.cache_path}")
        print("\nTo update attorney contacts, edit the configuration file.")
        
        return 0
        
    except FileNotFoundError as e:
        print(f"\n❌ ERROR: {e}")
        print("\nSetup Required:")
        print("1. Go to: https://console.cloud.google.com/apis/credentials")
        print("2. Create OAuth 2.0 Client ID (Desktop application)")
        print("3. Download credentials.json")
        print("4. Save to: ~/environments/api-credentials-vault/gmail-credentials.json")
        return 1
    
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
