#!/usr/bin/env python3
"""
Google Calendar API Integration for Daily Briefing System
Deadline tracking and meeting coordination
"""

import os
import pickle
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

# Calendar read-only scope
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

class CalendarIntelligence:
    """Real-time Google Calendar scanning for deadlines and meetings"""
    
    def __init__(self, credentials_path='/Users/ericjones/Infrastructure/daily-briefing-system/calendar-credentials.json'):
        self.credentials_path = credentials_path
        self.token_path = '/Users/ericjones/Infrastructure/daily-briefing-system/calendar-token.pickle'
        self.service = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with Google Calendar API"""
        creds = None
        
        if os.path.exists(self.token_path):
            with open(self.token_path, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(self.token_path, 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('calendar', 'v3', credentials=creds)
    
    def get_upcoming_events(self, days=30, max_results=50):
        """Get upcoming calendar events"""
        try:
            now = datetime.utcnow().isoformat() + 'Z'
            time_max = (datetime.utcnow() + timedelta(days=days)).isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=now,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return [self._parse_event(event) for event in events]
        
        except HttpError as error:
            print(f'Calendar API error: {error}')
            return []
    
    def _parse_event(self, event):
        """Parse calendar event into structured data"""
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))
        
        return {
            'id': event['id'],
            'summary': event.get('summary', 'No Title'),
            'description': event.get('description', ''),
            'location': event.get('location', ''),
            'start': start,
            'end': end,
            'attendees': [a['email'] for a in event.get('attendees', [])],
            'organizer': event.get('organizer', {}).get('email', ''),
            'meeting_link': self._extract_meeting_link(event)
        }
    
    def _extract_meeting_link(self, event):
        """Extract meeting link from event"""
        # Check for Google Meet
        if 'conferenceData' in event:
            entry_points = event['conferenceData'].get('entryPoints', [])
            for entry in entry_points:
                if entry['entryPointType'] == 'video':
                    return entry['uri']
        
        # Check description for Teams/Zoom links
        description = event.get('description', '')
        if 'teams.microsoft.com' in description:
            import re
            match = re.search(r'https://teams\.microsoft\.com/[^\s]+', description)
            if match:
                return match.group(0)
        
        if 'zoom.us' in description:
            import re
            match = re.search(r'https://[^\s]*zoom\.us/[^\s]+', description)
            if match:
                return match.group(0)
        
        return None
    
    def get_critical_deadlines(self, days=30):
        """Filter events that are case deadlines"""
        events = self.get_upcoming_events(days)
        
        deadline_keywords = [
            'deadline', 'hearing', 'filing', 'court', 'due date',
            'expiration', 'trial', 'motion', 'response due',
            'shellpoint', 'dec 3', 'nov 19', 'petition'
        ]
        
        deadlines = [
            event for event in events
            if any(keyword in event['summary'].lower() or 
                   keyword in event['description'].lower()
                   for keyword in deadline_keywords)
        ]
        
        return deadlines
    
    def get_attorney_meetings(self, days=14):
        """Filter events that are attorney meetings"""
        events = self.get_upcoming_events(days)
        
        attorney_emails = [
            'sara@hbuilaw.com',
            'melody@hbuilaw.com',
            'anuar@sevenhillslaw.com',
            'jonelle@jonellebeck.com'
        ]
        
        meetings = [
            event for event in events
            if any(atty in event['attendees'] or atty == event['organizer']
                   for atty in attorney_emails)
        ]
        
        return meetings
    
    def get_partnership_meetings(self, days=14):
        """Filter WFD and partnership meetings"""
        events = self.get_upcoming_events(days)
        
        partnership_domains = [
            'whittierfirstday.org',
            'donnagallup.com'
        ]
        
        meetings = [
            event for event in events
            if any(domain in event['organizer'] or 
                   any(domain in attendee for attendee in event['attendees'])
                   for domain in partnership_domains)
        ]
        
        return meetings
    
    def calculate_days_until(self, event_date_str):
        """Calculate days until event"""
        event_date = datetime.fromisoformat(event_date_str.replace('Z', '+00:00'))
        now = datetime.now(event_date.tzinfo)
        delta = event_date - now
        return delta.days
    
    def export_to_briefing_format(self, events):
        """Export events in daily briefing markdown format"""
        output = []
        
        for event in events:
            days_until = self.calculate_days_until(event['start'])
            start_time = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
            
            urgency = "🔴 CRITICAL" if days_until <= 3 else "🟡 UPCOMING" if days_until <= 7 else "🟢"
            
            output.append(f"{urgency} **{event['summary']}**")
            output.append(f"- **Date:** {start_time.strftime('%a, %b %d, %Y %I:%M %p')}")
            output.append(f"- **Days Until:** {days_until} days")
            
            if event['location']:
                output.append(f"- **Location:** {event['location']}")
            
            if event['meeting_link']:
                output.append(f"- **Meeting Link:** {event['meeting_link']}")
            
            if event['attendees']:
                output.append(f"- **Attendees:** {', '.join(event['attendees'][:3])}")
            
            if event['description']:
                preview = event['description'][:150].replace('\n', ' ')
                output.append(f"- **Notes:** {preview}...")
            
            output.append("")
        
        return "\n".join(output)


def main():
    """Test Calendar intelligence gathering"""
    print("📅 Initializing Calendar Intelligence System...")
    
    calendar = CalendarIntelligence()
    
    print("\n⚖️ Fetching critical deadlines (next 30 days)...")
    deadlines = calendar.get_critical_deadlines(days=30)
    print(f"Found {len(deadlines)} critical deadlines")
    
    print("\n👔 Fetching attorney meetings (next 14 days)...")
    attorney_meetings = calendar.get_attorney_meetings(days=14)
    print(f"Found {len(attorney_meetings)} attorney meetings")
    
    print("\n🤝 Fetching partnership meetings (next 14 days)...")
    partnership_meetings = calendar.get_partnership_meetings(days=14)
    print(f"Found {len(partnership_meetings)} partnership meetings")
    
    # Export to daily briefing format
    output_path = '/Users/ericjones/Infrastructure/daily-briefing-system/calendar-intelligence-latest.md'
    
    with open(output_path, 'w') as f:
        f.write("# Calendar Intelligence Report\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %I:%M %p PT')}\n\n")
        
        f.write("## Critical Deadlines (Next 30 Days)\n\n")
        f.write(calendar.export_to_briefing_format(deadlines))
        
        f.write("\n\n## Attorney Meetings (Next 14 Days)\n\n")
        f.write(calendar.export_to_briefing_format(attorney_meetings))
        
        f.write("\n\n## Partnership Meetings (Next 14 Days)\n\n")
        f.write(calendar.export_to_briefing_format(partnership_meetings))
    
    print(f"\n✅ Calendar intelligence saved to: {output_path}")


if __name__ == '__main__':
    main()
