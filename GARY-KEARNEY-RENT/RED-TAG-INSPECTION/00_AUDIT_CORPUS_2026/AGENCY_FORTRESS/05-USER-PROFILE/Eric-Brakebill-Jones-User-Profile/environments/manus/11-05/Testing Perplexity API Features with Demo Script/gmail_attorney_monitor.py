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
