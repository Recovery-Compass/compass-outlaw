#!/usr/bin/env python3
"""
Gmail Attorney Monitor - Phase 2 Critical Priority
Eliminates temporal misalignment through Gmail API integration
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False
    print("⚠️  Gmail API libraries not installed. Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")


class GmailAttorneyMonitor:
    """
    Monitors Gmail for attorney communications
    PRIMARY source for attorney engagement verification (filesystem is SECONDARY)
    """
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
    
    def __init__(self, credentials_path: Optional[str] = None):
        """
        Initialize Gmail monitor with OAuth credentials
        
        Args:
            credentials_path: Path to credentials.json from Google Cloud Console
        """
        if not GMAIL_AVAILABLE:
            raise RuntimeError("Gmail API libraries not installed")
        
        self.credentials_path = credentials_path or self._find_credentials()
        self.token_path = Path.home() / '.gmail_token.json'
        self.creds = None
        self.service = None
        
        # Attorney contact mapping
        self.attorney_contacts = {
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
        }
        
        self.authenticate()
    
    def _find_credentials(self) -> str:
        """Find Gmail credentials in common locations"""
        search_paths = [
            Path.home() / "environments/api-credentials-vault/gmail-credentials.json",
            Path.home() / "environments/api-credentials-vault/credentials.json",
            Path.home() / ".credentials/gmail-credentials.json",
            Path.home() / "credentials.json"
        ]
        
        for path in search_paths:
            if path.exists():
                return str(path)
        
        raise FileNotFoundError(
            "Gmail credentials not found. Download from Google Cloud Console:\n"
            "https://console.cloud.google.com/apis/credentials"
        )
    
    def authenticate(self):
        """Authenticate with Gmail API using OAuth"""
        # Load existing token
        if self.token_path.exists():
            self.creds = Credentials.from_authorized_user_file(
                str(self.token_path), 
                self.SCOPES
            )
        
        # Refresh or get new credentials
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, 
                    self.SCOPES
                )
                self.creds = flow.run_local_server(port=0)
            
            # Save token
            with open(self.token_path, 'w') as token:
                token.write(self.creds.to_json())
        
        self.service = build('gmail', 'v1', credentials=self.creds)
        print("✓ Gmail API authenticated")
    
    def scan_attorney_communications(self, hours_back: int = 48) -> Dict:
        """
        Scan Gmail for attorney communications
        PRIMARY source for engagement verification
        
        Args:
            hours_back: How many hours back to scan
            
        Returns:
            Dictionary with attorney engagement status
        """
        print(f"\n{'='*70}")
        print(f"GMAIL ATTORNEY COMMUNICATIONS SCAN")
        print(f"{'='*70}")
        print(f"Scan Window: Last {hours_back} hours")
        print()
        
        results = {}
        
        for attorney_name, config in self.attorney_contacts.items():
            print(f"Scanning: {attorney_name.replace('_', ' ').title()}")
            print(f"  Case: {config['case']}")
            print(f"  Email addresses: {', '.join(config['emails'])}")
            
            attorney_emails = []
            
            for email_addr in config['emails']:
                # Build Gmail query
                query = f"(to:{email_addr} OR from:{email_addr}) newer_than:{hours_back}h"
                
                try:
                    messages_result = self.service.users().messages().list(
                        userId='me',
                        q=query,
                        maxResults=50
                    ).execute()
                    
                    messages = messages_result.get('messages', [])
                    
                    for message in messages:
                        msg_data = self.service.users().messages().get(
                            userId='me',
                            id=message['id'],
                            format='full'
                        ).execute()
                        
                        parsed_email = self.parse_email(msg_data)
                        attorney_emails.append(parsed_email)
                    
                except Exception as e:
                    print(f"  ⚠️  Error scanning {email_addr}: {e}")
            
            # Sort by date (most recent first)
            attorney_emails.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Calculate engagement level
            engagement = self.calculate_engagement_level(attorney_emails, hours_back)
            
            results[attorney_name] = {
                "status": engagement['status'],
                "email_count": len(attorney_emails),
                "most_recent": attorney_emails[0] if attorney_emails else None,
                "engagement_level": engagement['level'],
                "confidence": engagement['confidence'],
                "case": config['case'],
                "case_id": config['case_id'],
                "emails": attorney_emails[:5]  # Keep 5 most recent
            }
            
            # Print status
            if engagement['status'] == 'ENGAGED':
                print(f"  ✓ STATUS: ENGAGED")
                print(f"  ✓ Most recent: {attorney_emails[0]['date']}")
                print(f"  ✓ Hours since contact: {engagement['hours_since']:.1f}")
                print(f"  ✓ Confidence: {engagement['confidence']}%")
            else:
                print(f"  ✗ STATUS: NO RECENT CONTACT")
                print(f"  ✗ Last contact: {engagement['hours_since']:.1f} hours ago" if engagement['hours_since'] else "Never")
            
            print()
        
        return results
    
    def parse_email(self, msg_data: Dict) -> Dict:
        """Parse Gmail message data into structured format"""
        headers = {h['name']: h['value'] for h in msg_data['payload']['headers']}
        
        # Get internal date (Gmail's timestamp)
        internal_date = int(msg_data['internalDate']) / 1000
        timestamp = datetime.fromtimestamp(internal_date)
        
        # Extract body snippet
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
            'hours_ago': (datetime.now() - timestamp).total_seconds() / 3600
        }
    
    def calculate_engagement_level(self, emails: List[Dict], window_hours: int) -> Dict:
        """
        Calculate attorney engagement level from email patterns
        
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
        
        # Engagement scoring
        if hours_since <= 24:
            status = 'ENGAGED'
            level = 95
            confidence = 90
        elif hours_since <= 48:
            status = 'ENGAGED'
            level = 85
            confidence = 85
        elif hours_since <= 72:
            status = 'ENGAGED'
            level = 75
            confidence = 80
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
        
        overall_coalition = round(total_confidence / attorney_count)
        
        print(f"{'='*70}")
        print(f"OVERALL COALITION STRENGTH: {overall_coalition}%")
        print(f"{'='*70}")
        
        # Determine risk zone
        if overall_coalition >= 80:
            risk_zone = "GREEN"
            risk_emoji = "🟢"
        elif overall_coalition >= 60:
            risk_zone = "YELLOW"
            risk_emoji = "🟡"
        elif overall_coalition >= 40:
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
    """Run Gmail attorney monitoring"""
    print("="*70)
    print("GMAIL ATTORNEY MONITOR - PHASE 2 DEPLOYMENT")
    print("="*70)
    print()
    
    if not GMAIL_AVAILABLE:
        print("⚠️  Gmail API libraries not installed")
        print("   Install with: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
        return 1
    
    try:
        monitor = GmailAttorneyMonitor()
        report = monitor.generate_coalition_health_report(hours_back=72)
        monitor.save_report(report, "COALITION_HEALTH_GMAIL_REPORT.json")
        
        print("\n" + "="*70)
        print("DEPLOYMENT COMPLETE")
        print("="*70)
        
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
