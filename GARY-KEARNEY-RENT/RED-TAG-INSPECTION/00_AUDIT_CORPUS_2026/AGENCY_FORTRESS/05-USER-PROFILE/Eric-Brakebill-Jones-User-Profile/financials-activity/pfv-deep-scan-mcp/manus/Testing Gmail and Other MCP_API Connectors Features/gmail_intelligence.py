#!/usr/bin/env python3
"""
Gmail API Integration for Daily Briefing System
Replaces CloudHQ filesystem scanning with real-time Gmail API access
"""

import os
import pickle
import base64
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json
from pathlib import Path

# If modifying these scopes, delete the file token.pickle
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailIntelligence:
    """Real-time Gmail scanning for daily briefing system"""
    
    def __init__(self, credentials_path='/Users/ericjones/Infrastructure/daily-briefing-system/gmail-credentials.json'):
        self.credentials_path = credentials_path
        self.token_path = '/Users/ericjones/Infrastructure/daily-briefing-system/gmail-token.pickle'
        self.service = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with Gmail API"""
        creds = None
        
        # Token file stores user's access and refresh tokens
        if os.path.exists(self.token_path):
            with open(self.token_path, 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, let user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open(self.token_path, 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('gmail', 'v1', credentials=creds)
    
    def get_emails_last_n_hours(self, hours=48, max_results=100):
        """Get emails from last N hours"""
        try:
            # Calculate timestamp for N hours ago
            time_threshold = datetime.now() - timedelta(hours=hours)
            query = f'after:{int(time_threshold.timestamp())}'
            
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            email_data = []
            for message in messages:
                msg = self.service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()
                
                email_data.append(self._parse_message(msg))
            
            return email_data
        
        except HttpError as error:
            print(f'Gmail API error: {error}')
            return []
    
    def _parse_message(self, msg):
        """Parse Gmail message into structured data"""
        headers = msg['payload']['headers']
        
        # Extract key headers
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
        from_email = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
        to_email = next((h['value'] for h in headers if h['name'] == 'To'), 'Unknown')
        date = next((h['value'] for h in headers if h['name'] == 'Date'), 'Unknown')
        
        # Extract body
        body = self._get_message_body(msg['payload'])
        
        # Extract attachments info
        attachments = self._get_attachments_info(msg['payload'])
        
        return {
            'id': msg['id'],
            'thread_id': msg['threadId'],
            'subject': subject,
            'from': from_email,
            'to': to_email,
            'date': date,
            'timestamp': int(msg['internalDate']) / 1000,  # Convert to seconds
            'body': body,
            'attachments': attachments,
            'labels': msg.get('labelIds', [])
        }
    
    def _get_message_body(self, payload):
        """Extract message body from payload"""
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
        elif 'body' in payload and 'data' in payload['body']:
            return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        
        return ''
    
    def _get_attachments_info(self, payload):
        """Get attachment metadata"""
        attachments = []
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part.get('filename'):
                    attachments.append({
                        'filename': part['filename'],
                        'mime_type': part['mimeType'],
                        'size': part['body'].get('size', 0)
                    })
        
        return attachments
    
    def get_attorney_communications(self, hours=48):
        """Filter emails from known attorneys"""
        attorneys = [
            'sara@hbuilaw.com',
            'melody@hbuilaw.com',
            'anuar@sevenhillslaw.com',
            'jonelle@jonellebeck.com',
            'ramey@rameyflock.com'
        ]
        
        all_emails = self.get_emails_last_n_hours(hours)
        
        attorney_emails = [
            email for email in all_emails
            if any(atty in email['from'].lower() for atty in attorneys)
        ]
        
        return attorney_emails
    
    def get_case_related_emails(self, case_keywords, hours=48):
        """Filter emails by case-related keywords"""
        all_emails = self.get_emails_last_n_hours(hours)
        
        case_emails = [
            email for email in all_emails
            if any(keyword.lower() in email['subject'].lower() or 
                   keyword.lower() in email['body'].lower()
                   for keyword in case_keywords)
        ]
        
        return case_emails
    
    def get_partnership_emails(self, hours=168):  # 7 days default
        """Get WFD and other partnership emails"""
        partnership_domains = [
            'whittierfirstday.org',
            'donnagallup.com'
        ]
        
        all_emails = self.get_emails_last_n_hours(hours)
        
        partnership_emails = [
            email for email in all_emails
            if any(domain in email['from'].lower() for domain in partnership_domains)
        ]
        
        return partnership_emails
    
    def export_to_briefing_format(self, emails):
        """Export emails in daily briefing markdown format"""
        output = []
        
        for email in sorted(emails, key=lambda x: x['timestamp'], reverse=True):
            timestamp = datetime.fromtimestamp(email['timestamp'])
            output.append(f"**{timestamp.strftime('%b %d, %I:%M %p PT')}:** {email['from']}")
            output.append(f"**Subject:** {email['subject']}")
            if email['attachments']:
                output.append(f"**Attachments:** {len(email['attachments'])} files")
            output.append(f"**Preview:** {email['body'][:200]}...")
            output.append("")
        
        return "\n".join(output)


def main():
    """Test Gmail intelligence gathering"""
    print("🔍 Initializing Gmail Intelligence System...")
    
    gmail = GmailIntelligence()
    
    print("\n📧 Fetching attorney communications (last 48 hours)...")
    attorney_emails = gmail.get_attorney_communications(hours=48)
    print(f"Found {len(attorney_emails)} attorney emails")
    
    print("\n🤝 Fetching partnership emails (last 7 days)...")
    partnership_emails = gmail.get_partnership_emails(hours=168)
    print(f"Found {len(partnership_emails)} partnership emails")
    
    print("\n⚖️ Fetching SVS case emails...")
    svs_emails = gmail.get_case_related_emails(['25PDFL01441', 'Sayegh', 'DVRO', 'FL-311'], hours=48)
    print(f"Found {len(svs_emails)} SVS-related emails")
    
    print("\n📊 Fetching JJ Trust emails...")
    jj_emails = gmail.get_case_related_emails(['Judy Jones', 'Trust', 'Shellpoint', 'Probate', 'DE111'], hours=48)
    print(f"Found {len(jj_emails)} JJ Trust emails")
    
    # Export to daily briefing format
    output_path = '/Users/ericjones/Infrastructure/daily-briefing-system/gmail-intelligence-latest.md'
    
    with open(output_path, 'w') as f:
        f.write("# Gmail Intelligence Report\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %I:%M %p PT')}\n\n")
        
        f.write("## Attorney Communications\n\n")
        f.write(gmail.export_to_briefing_format(attorney_emails))
        
        f.write("\n\n## Partnership Emails\n\n")
        f.write(gmail.export_to_briefing_format(partnership_emails))
        
        f.write("\n\n## SVS DVRO Case\n\n")
        f.write(gmail.export_to_briefing_format(svs_emails))
        
        f.write("\n\n## JJ Trust Case\n\n")
        f.write(gmail.export_to_briefing_format(jj_emails))
    
    print(f"\n✅ Intelligence report saved to: {output_path}")


if __name__ == '__main__':
    main()
