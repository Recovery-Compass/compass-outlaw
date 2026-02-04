#!/usr/bin/env python3
"""
Gmail Attorney Monitor - Interactive Setup Wizard
Automates credential validation and initial configuration
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Optional, List


class SetupWizard:
    """Interactive setup wizard for Gmail Attorney Monitor"""
    
    def __init__(self):
        self.config = {}
        self.credentials_path = None
        self.config_path = Path.home() / '.gmail_attorney_monitor_config.json'
    
    def print_header(self, text: str):
        """Print formatted header"""
        print("\n" + "=" * 70)
        print(f"  {text}")
        print("=" * 70 + "\n")
    
    def print_step(self, step: int, total: int, text: str):
        """Print step indicator"""
        print(f"\n[Step {step}/{total}] {text}")
        print("-" * 70)
    
    def check_python_version(self) -> bool:
        """Verify Python version is 3.7+"""
        version = sys.version_info
        if version.major >= 3 and version.minor >= 7:
            print(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")
            return True
        else:
            print(f"✗ Python {version.major}.{version.minor} detected")
            print("  Gmail Monitor requires Python 3.7 or higher")
            return False
    
    def check_dependencies(self) -> bool:
        """Check if required packages are installed"""
        required_packages = [
            'google.auth',
            'google_auth_oauthlib',
            'googleapiclient'
        ]
        
        missing = []
        for package in required_packages:
            try:
                __import__(package.replace('.', '_'))
                print(f"✓ {package} installed")
            except ImportError:
                print(f"✗ {package} not found")
                missing.append(package)
        
        if missing:
            print("\n⚠️  Missing packages detected")
            print("   Install with:")
            print("   pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
            
            response = input("\nInstall now? (y/n): ").strip().lower()
            if response == 'y':
                return self.install_dependencies()
            return False
        
        return True
    
    def install_dependencies(self) -> bool:
        """Install required packages"""
        print("\nInstalling dependencies...")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install',
                'google-auth', 'google-auth-oauthlib',
                'google-auth-httplib2', 'google-api-python-client'
            ])
            print("✓ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Installation failed: {e}")
            return False
    
    def find_credentials(self) -> Optional[str]:
        """Search for Gmail credentials"""
        search_paths = [
            Path.home() / "environments/api-credentials-vault/gmail-credentials.json",
            Path.home() / "environments/api-credentials-vault/credentials.json",
            Path.home() / ".credentials/gmail-credentials.json",
            Path.home() / "credentials.json",
            Path.cwd() / "gmail-credentials.json",
            Path.cwd() / "credentials.json"
        ]
        
        print("\nSearching for Gmail credentials...")
        for path in search_paths:
            if path.exists():
                print(f"✓ Found credentials at: {path}")
                return str(path)
        
        print("✗ No credentials found in standard locations")
        return None
    
    def validate_credentials(self, path: str) -> bool:
        """Validate credentials file format"""
        try:
            with open(path, 'r') as f:
                creds = json.load(f)
            
            # Check for required fields
            if 'installed' in creds or 'web' in creds:
                print("✓ Credentials file format valid")
                return True
            else:
                print("✗ Invalid credentials format")
                return False
        except json.JSONDecodeError:
            print("✗ Credentials file is not valid JSON")
            return False
        except Exception as e:
            print(f"✗ Error reading credentials: {e}")
            return False
    
    def setup_credentials(self) -> bool:
        """Guide user through credential setup"""
        self.credentials_path = self.find_credentials()
        
        if self.credentials_path:
            if self.validate_credentials(self.credentials_path):
                return True
        
        print("\n" + "=" * 70)
        print("CREDENTIALS SETUP REQUIRED")
        print("=" * 70)
        print("\nYou need to create OAuth 2.0 credentials from Google Cloud Console.")
        print("\nFollow these steps:")
        print("1. Go to: https://console.cloud.google.com/apis/credentials")
        print("2. Create a new project or select existing one")
        print("3. Enable Gmail API")
        print("4. Create OAuth 2.0 Client ID (Desktop application)")
        print("5. Download the credentials JSON file")
        print("6. Save it to one of these locations:")
        print("   - ~/environments/api-credentials-vault/gmail-credentials.json")
        print("   - ~/credentials.json")
        
        input("\nPress Enter when you've downloaded the credentials file...")
        
        # Ask for file location
        path = input("\nEnter path to credentials file (or press Enter to search again): ").strip()
        
        if path:
            if Path(path).exists():
                if self.validate_credentials(path):
                    self.credentials_path = path
                    return True
            else:
                print(f"✗ File not found: {path}")
        
        # Search again
        self.credentials_path = self.find_credentials()
        if self.credentials_path:
            return self.validate_credentials(self.credentials_path)
        
        return False
    
    def configure_attorneys(self) -> bool:
        """Interactive attorney configuration"""
        print("\nConfigure attorney contacts for monitoring.")
        print("You can add attorneys now or edit the config file later.")
        
        use_defaults = input("\nUse default attorney contacts? (y/n): ").strip().lower()
        
        if use_defaults == 'y':
            self.config['attorney_contacts'] = {
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
            print("✓ Using default attorney contacts")
            return True
        
        # Custom configuration
        attorneys = {}
        while True:
            print("\n" + "-" * 70)
            attorney_id = input("Attorney identifier (e.g., 'john_smith', or 'done' to finish): ").strip()
            
            if attorney_id.lower() == 'done':
                break
            
            if not attorney_id:
                continue
            
            emails_input = input("Email addresses (comma-separated): ").strip()
            emails = [e.strip() for e in emails_input.split(',') if e.strip()]
            
            case = input("Case description: ").strip()
            case_id = input("Case ID: ").strip()
            
            attorneys[attorney_id] = {
                "emails": emails,
                "case": case,
                "case_id": case_id
            }
            
            print(f"✓ Added {attorney_id}")
        
        if attorneys:
            self.config['attorney_contacts'] = attorneys
            return True
        else:
            print("⚠️  No attorneys configured")
            return False
    
    def configure_thresholds(self) -> bool:
        """Configure engagement thresholds"""
        print("\nConfigure engagement thresholds (in hours).")
        
        use_defaults = input("Use default thresholds? (y/n): ").strip().lower()
        
        if use_defaults == 'y':
            self.config['engagement_thresholds'] = {
                "highly_engaged": 24,
                "engaged": 48,
                "moderately_engaged": 72,
                "low_engagement": 168
            }
            self.config['risk_zones'] = {
                "green": 80,
                "yellow": 60,
                "orange": 40
            }
            print("✓ Using default thresholds")
            return True
        
        # Custom thresholds
        try:
            highly_engaged = int(input("Highly engaged threshold (hours, default 24): ") or "24")
            engaged = int(input("Engaged threshold (hours, default 48): ") or "48")
            moderately_engaged = int(input("Moderately engaged threshold (hours, default 72): ") or "72")
            low_engagement = int(input("Low engagement threshold (hours, default 168): ") or "168")
            
            self.config['engagement_thresholds'] = {
                "highly_engaged": highly_engaged,
                "engaged": engaged,
                "moderately_engaged": moderately_engaged,
                "low_engagement": low_engagement
            }
            
            green = int(input("Green zone threshold (%, default 80): ") or "80")
            yellow = int(input("Yellow zone threshold (%, default 60): ") or "60")
            orange = int(input("Orange zone threshold (%, default 40): ") or "40")
            
            self.config['risk_zones'] = {
                "green": green,
                "yellow": yellow,
                "orange": orange
            }
            
            print("✓ Custom thresholds configured")
            return True
            
        except ValueError:
            print("✗ Invalid input, using defaults")
            self.config['engagement_thresholds'] = {
                "highly_engaged": 24,
                "engaged": 48,
                "moderately_engaged": 72,
                "low_engagement": 168
            }
            self.config['risk_zones'] = {
                "green": 80,
                "yellow": 60,
                "orange": 40
            }
            return True
    
    def save_configuration(self) -> bool:
        """Save configuration to file"""
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
            print(f"✓ Configuration saved to: {self.config_path}")
            return True
        except Exception as e:
            print(f"✗ Failed to save configuration: {e}")
            return False
    
    def test_connection(self) -> bool:
        """Test Gmail API connection"""
        print("\nTesting Gmail API connection...")
        print("A browser window will open for OAuth authorization.")
        print("Click 'Allow' to grant read-only Gmail access.")
        
        input("\nPress Enter to continue...")
        
        try:
            # Import and test
            from gmail_attorney_monitor_optimized import GmailAttorneyMonitor
            
            monitor = GmailAttorneyMonitor(
                credentials_path=self.credentials_path,
                config_path=str(self.config_path)
            )
            
            print("✓ Gmail API connection successful")
            return True
            
        except Exception as e:
            print(f"✗ Connection test failed: {e}")
            return False
    
    def run(self):
        """Run the complete setup wizard"""
        self.print_header("GMAIL ATTORNEY MONITOR - SETUP WIZARD")
        
        print("This wizard will guide you through setting up the Gmail Attorney Monitor.")
        print("The process takes approximately 5-10 minutes.")
        
        input("\nPress Enter to begin...")
        
        # Step 1: Check Python version
        self.print_step(1, 6, "Checking Python Version")
        if not self.check_python_version():
            print("\n✗ Setup failed: Python version too old")
            return False
        
        # Step 2: Check dependencies
        self.print_step(2, 6, "Checking Dependencies")
        if not self.check_dependencies():
            print("\n✗ Setup failed: Missing dependencies")
            return False
        
        # Step 3: Setup credentials
        self.print_step(3, 6, "Setting Up Gmail Credentials")
        if not self.setup_credentials():
            print("\n✗ Setup failed: Credentials not configured")
            return False
        
        # Step 4: Configure attorneys
        self.print_step(4, 6, "Configuring Attorney Contacts")
        if not self.configure_attorneys():
            print("\n✗ Setup failed: No attorneys configured")
            return False
        
        # Step 5: Configure thresholds
        self.print_step(5, 6, "Configuring Engagement Thresholds")
        self.configure_thresholds()
        
        # Save configuration
        if not self.save_configuration():
            print("\n✗ Setup failed: Could not save configuration")
            return False
        
        # Step 6: Test connection
        self.print_step(6, 6, "Testing Gmail API Connection")
        if not self.test_connection():
            print("\n⚠️  Setup complete but connection test failed")
            print("   You may need to authorize the application manually")
        
        # Success
        self.print_header("SETUP COMPLETE")
        print("Gmail Attorney Monitor is ready to use!")
        print(f"\nConfiguration file: {self.config_path}")
        print(f"Credentials file: {self.credentials_path}")
        print("\nTo run the monitor:")
        print("  python3 gmail_attorney_monitor_optimized.py")
        print("\nTo update configuration:")
        print(f"  nano {self.config_path}")
        
        return True


def main():
    """Main entry point"""
    wizard = SetupWizard()
    success = wizard.run()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
