#!/usr/bin/env python3
"""
Action Completion Monitor
Prevents 20-hour temporal misalignment by verifying actions before recommending
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
import re

class ActionCompletionMonitor:
    def __init__(self):
        self.action_log = Path.home() / "FINANCIAL_RISK_ACTION_LOG.json"
        self.scan_directories = [
            Path.home() / "Cases/SVS",
            Path.home() / "Cases/Judy-Trust",
            Path.home() / "Cases/Kathy-Hart-POA",
            Path.home() / "Library/CloudStorage/GoogleDrive-eric@recovery-compass.org/My Drive"
        ]
        
        if not self.action_log.exists():
            self.initialize_log()
    
    def initialize_log(self):
        """Create initial action log"""
        initial_data = {
            "created": datetime.now().isoformat(),
            "actions": [],
            "version": "1.0"
        }
        
        with open(self.action_log, 'w') as f:
            json.dump(initial_data, f, indent=2)
        
        print(f"✓ Action log initialized: {self.action_log}")
    
    def extract_keywords(self, action_description: str) -> list:
        """Extract keywords from action description"""
        # Remove common words
        stop_words = {'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'at', 'send', 'email'}
        
        words = re.findall(r'\b\w+\b', action_description.lower())
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        
        return keywords[:5]  # Top 5 keywords
    
    def search_recent_files(self, directory: Path, days_back: int = 7) -> list:
        """Find files modified in last N days"""
        if not directory.exists():
            return []
        
        cutoff_time = datetime.now() - timedelta(days=days_back)
        recent_files = []
        
        for file_path in directory.rglob('*'):
            if not file_path.is_file():
                continue
            
            # Skip hidden files and certain types
            if file_path.name.startswith('.') or file_path.suffix in ['.DS_Store']:
                continue
            
            try:
                mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                if mtime > cutoff_time:
                    recent_files.append(file_path)
            except (OSError, PermissionError):
                continue
        
        return recent_files
    
    def file_contains_keywords(self, file_path: Path, keywords: list) -> bool:
        """Check if file contains action keywords"""
        # Only scan text-based files
        text_extensions = {'.txt', '.md', '.pdf', '.doc', '.docx'}
        
        if file_path.suffix.lower() not in text_extensions:
            return False
        
        # For PDF, just check filename
        if file_path.suffix.lower() == '.pdf':
            filename_lower = file_path.name.lower()
            return any(keyword in filename_lower for keyword in keywords)
        
        # For text files, search content
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore').lower()
            return any(keyword in content for keyword in keywords)
        except (OSError, PermissionError, UnicodeDecodeError):
            return False
    
    def get_file_timestamp(self, file_path: Path) -> str:
        """Get file modification timestamp"""
        mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
        return mtime.isoformat()
    
    def calculate_staleness(self, file_path: Path) -> float:
        """Calculate hours since file modification"""
        mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
        age = datetime.now() - mtime
        return age.total_seconds() / 3600
    
    def verify_action_completion(self, action_description: str) -> dict:
        """
        Search for evidence that action was completed
        Prevents 20-hour obsolescence errors
        """
        print(f"\n🔍 Verifying: {action_description}")
        
        keywords = self.extract_keywords(action_description)
        print(f"   Keywords: {', '.join(keywords)}")
        
        for directory in self.scan_directories:
            if not directory.exists():
                print(f"   ⚠️  Directory not found: {directory}")
                continue
            
            print(f"   Scanning: {directory}")
            files = self.search_recent_files(directory, days_back=7)
            print(f"   Found {len(files)} recent files")
            
            for file_path in files:
                if self.file_contains_keywords(file_path, keywords):
                    obsolescence_hours = self.calculate_staleness(file_path)
                    
                    result = {
                        "status": "COMPLETED",
                        "evidence": str(file_path),
                        "timestamp": self.get_file_timestamp(file_path),
                        "obsolescence_hours": round(obsolescence_hours, 1),
                        "action_description": action_description
                    }
                    
                    print(f"   ✓ COMPLETED: {file_path.name}")
                    print(f"   ✓ Timestamp: {result['timestamp']}")
                    print(f"   ⚠️  Obsolescence: {obsolescence_hours:.1f} hours")
                    
                    return result
        
        print(f"   ✗ NOT FOUND: Action appears pending")
        return {
            "status": "PENDING",
            "evidence": None,
            "action_description": action_description
        }
    
    def test_h_bui_email_detection(self):
        """Test case: Detect Nov 4 H Bui coordination email"""
        print("\n" + "="*70)
        print("TEST: H Bui Coordination Email Detection")
        print("="*70)
        
        result = self.verify_action_completion(
            "Send H Bui coordination email with evidence package"
        )
        
        if result['status'] == 'COMPLETED':
            print(f"\n✓ TEST PASSED")
            print(f"  Evidence found: {Path(result['evidence']).name}")
            print(f"  Obsolescence: {result['obsolescence_hours']} hours")
            
            if result['obsolescence_hours'] > 20:
                print(f"  ⚠️  WARNING: Would have recommended obsolete action!")
        else:
            print(f"\n✗ TEST FAILED: Email not detected")
        
        return result


def main():
    """Run action completion monitor demonstration"""
    print("="*70)
    print("ACTION COMPLETION MONITOR - PHASE 1 DEPLOYMENT")
    print("="*70)
    
    monitor = ActionCompletionMonitor()
    
    # Test with H Bui email case
    result = monitor.test_h_bui_email_detection()
    
    # Save result to log
    if monitor.action_log.exists():
        with open(monitor.action_log, 'r') as f:
            log_data = json.load(f)
        
        log_data['actions'].append({
            "timestamp": datetime.now().isoformat(),
            "test": "h_bui_coordination_email",
            "result": result
        })
        
        with open(monitor.action_log, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        print(f"\n✓ Results saved to: {monitor.action_log}")
    
    print("\n" + "="*70)
    print("DEPLOYMENT COMPLETE")
    print("="*70)


if __name__ == "__main__":
    main()
