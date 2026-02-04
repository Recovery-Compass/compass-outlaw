#!/usr/bin/env python3
"""
Evidence Freshness Validator
Detects stale data (Wells Fargo 11-day staleness) and generates freshness reports
"""

from datetime import datetime, timedelta
from pathlib import Path
import json

class EvidenceFreshnessValidator:
    def __init__(self):
        self.freshness_thresholds = {
            "attorney_communications": timedelta(hours=48),
            "banking_data": timedelta(hours=24),
            "court_filing_status": timedelta(hours=6),
            "case_documents": timedelta(days=7),
            "property_records": timedelta(days=30)
        }
        
        self.evidence_sources = {
            "wells_fargo": {
                "path": Path.home() / "Income/wells-fargo-statements",
                "type": "banking_data",
                "pattern": "*.pdf",
                "priority": "CRITICAL"
            },
            "h_bui_emails": {
                "path": Path.home() / "Cases/SVS/11-04/emails",
                "type": "attorney_communications",
                "pattern": "*.pdf",
                "priority": "HIGH"
            },
            "jonelle_beck": {
                "path": Path.home() / "Cases/Judy-Trust",
                "type": "attorney_communications",
                "pattern": "*Jonelle*.pdf",
                "priority": "HIGH"
            },
            "svs_case_docs": {
                "path": Path.home() / "Cases/SVS",
                "type": "case_documents",
                "pattern": "*.md",
                "priority": "MEDIUM"
            }
        }
    
    def check_source_freshness(self, config: dict) -> dict:
        """Check freshness of specific evidence source"""
        path = config["path"]
        evidence_type = config["type"]
        priority = config.get("priority", "MEDIUM")
        
        if not path.exists():
            return {
                "status": "MISSING",
                "error": f"Path not found: {path}",
                "priority": priority,
                "action_required": True
            }
        
        # Find all matching files
        try:
            files = list(path.rglob(config["pattern"]))
        except (OSError, PermissionError) as e:
            return {
                "status": "ERROR",
                "error": str(e),
                "priority": priority
            }
        
        if not files:
            return {
                "status": "MISSING",
                "error": "No files found matching pattern",
                "pattern": config["pattern"],
                "priority": priority,
                "action_required": True
            }
        
        # Find most recent file
        most_recent = max(files, key=lambda f: f.stat().st_mtime)
        file_time = datetime.fromtimestamp(most_recent.stat().st_mtime)
        age = datetime.now() - file_time
        
        threshold = self.freshness_thresholds[evidence_type]
        age_hours = age.total_seconds() / 3600
        threshold_hours = threshold.total_seconds() / 3600
        
        if age > threshold:
            severity = "CRITICAL" if age > threshold * 10 else "HIGH" if age > threshold * 2 else "MODERATE"
            
            return {
                "status": "EXPIRED",
                "file": str(most_recent.name),
                "full_path": str(most_recent),
                "age_hours": round(age_hours, 1),
                "age_days": round(age_hours / 24, 1),
                "threshold_hours": round(threshold_hours, 1),
                "threshold_days": round(threshold_hours / 24, 1),
                "severity": severity,
                "priority": priority,
                "action_required": True,
                "last_modified": file_time.strftime('%Y-%m-%d %H:%M:%S')
            }
        
        return {
            "status": "FRESH",
            "file": str(most_recent.name),
            "age_hours": round(age_hours, 1),
            "threshold_hours": round(threshold_hours, 1),
            "priority": priority,
            "last_modified": file_time.strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def generate_freshness_report(self) -> dict:
        """
        Scan all evidence sources and generate comprehensive report
        """
        report = {
            "scan_timestamp": datetime.now().isoformat(),
            "scan_time": datetime.now().strftime('%Y-%m-%d %I:%M:%S %p %Z'),
            "sources": {},
            "summary": {
                "total_sources": len(self.evidence_sources),
                "fresh": 0,
                "expired": 0,
                "missing": 0,
                "errors": 0
            }
        }
        
        print("\n" + "="*70)
        print("EVIDENCE FRESHNESS VALIDATION REPORT")
        print("="*70)
        print(f"Scan Time: {report['scan_time']}")
        print()
        
        for source_name, config in self.evidence_sources.items():
            status = self.check_source_freshness(config)
            report["sources"][source_name] = status
            
            # Update summary
            if status["status"] == "FRESH":
                report["summary"]["fresh"] += 1
            elif status["status"] == "EXPIRED":
                report["summary"]["expired"] += 1
            elif status["status"] == "MISSING":
                report["summary"]["missing"] += 1
            elif status["status"] == "ERROR":
                report["summary"]["errors"] += 1
            
            # Print source status
            self.print_source_status(source_name, status)
        
        # Print summary
        self.print_summary(report["summary"])
        
        return report
    
    def print_source_status(self, source_name: str, status: dict):
        """Print formatted source status"""
        print(f"{source_name.upper().replace('_', ' ')}:")
        
        if status["status"] == "FRESH":
            print(f"  Status: ✓ FRESH")
            print(f"  File: {status['file']}")
            print(f"  Age: {status['age_hours']:.1f} hours")
            print(f"  Threshold: {status['threshold_hours']:.1f} hours")
            print(f"  Priority: {status['priority']}")
        
        elif status["status"] == "EXPIRED":
            print(f"  Status: ⚠️  EXPIRED")
            print(f"  File: {status['file']}")
            print(f"  Age: {status['age_hours']:.1f} hours ({status['age_days']:.1f} days)")
            print(f"  Threshold: {status['threshold_hours']:.1f} hours ({status['threshold_days']:.1f} days)")
            print(f"  Severity: {status['severity']}")
            print(f"  Priority: {status['priority']}")
            print(f"  Last Modified: {status['last_modified']}")
            print(f"  ⚠️  ACTION REQUIRED: Update {source_name}")
        
        elif status["status"] == "MISSING":
            print(f"  Status: ❌ MISSING")
            print(f"  Error: {status['error']}")
            print(f"  Priority: {status['priority']}")
            print(f"  ⚠️  ACTION REQUIRED: Locate evidence")
        
        elif status["status"] == "ERROR":
            print(f"  Status: ❌ ERROR")
            print(f"  Error: {status['error']}")
        
        print()
    
    def print_summary(self, summary: dict):
        """Print report summary"""
        print("="*70)
        print("SUMMARY")
        print("="*70)
        print(f"Total Sources: {summary['total_sources']}")
        print(f"  ✓ Fresh: {summary['fresh']}")
        print(f"  ⚠️  Expired: {summary['expired']}")
        print(f"  ❌ Missing: {summary['missing']}")
        print(f"  ❌ Errors: {summary['errors']}")
        print()
        
        if summary['expired'] > 0 or summary['missing'] > 0:
            print("⚠️  ACTION REQUIRED: Update expired/missing evidence sources")
        else:
            print("✓ All evidence sources are fresh")
        
        print("="*70)
    
    def save_report(self, report: dict, filename: str = None):
        """Save report to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"evidence_freshness_report_{timestamp}.json"
        
        report_path = Path.home() / filename
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n✓ Report saved to: {report_path}")
        return report_path


def main():
    """Run evidence freshness validation"""
    print("="*70)
    print("EVIDENCE FRESHNESS VALIDATOR - PHASE 1 DEPLOYMENT")
    print("="*70)
    
    validator = EvidenceFreshnessValidator()
    report = validator.generate_freshness_report()
    
    # Save report
    validator.save_report(report, "EVIDENCE_FRESHNESS_REPORT.json")
    
    print("\n" + "="*70)
    print("DEPLOYMENT COMPLETE")
    print("="*70)
    
    # Return status code based on report
    if report["summary"]["expired"] > 0:
        print("\n⚠️  WARNING: Expired evidence detected")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
