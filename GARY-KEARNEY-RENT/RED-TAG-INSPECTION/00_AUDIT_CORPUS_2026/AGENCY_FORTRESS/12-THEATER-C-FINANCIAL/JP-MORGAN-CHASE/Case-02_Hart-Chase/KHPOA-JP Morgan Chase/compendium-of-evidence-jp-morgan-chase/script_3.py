# Install required dependencies and build the compendium
import subprocess
import sys

# Install dependencies
try:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab", "PyPDF2"])
    print("Dependencies installed successfully")
except subprocess.CalledProcessError as e:
    print(f"Error installing dependencies: {e}")

# List available files to confirm we have all exhibits
import os
files = [f for f in os.listdir('.') if f.endswith(('.pdf', '.md'))]
print("\nAvailable files:")
for f in files:
    print(f"  - {f}")

# Define exhibit files in order
exhibit_files = [
    "Evidence-of-Systemic-Misconduct-by-JPMorgan-Chase-Bank.pdf",  # Exhibit A
    "JP-Morgan-Chase_Systemic-Pattern-Analysis.md",                # Exhibit B  
    "CHRONOLOGY_EXHIBIT_C.md",                                     # Exhibit C
    "DECLARATION_EXHIBIT_D.md",                                    # Exhibit D
    "DECLARATION_EXHIBIT_E.md"                                     # Exhibit E
]

# Check that all exhibit files exist
missing_files = []
for f in exhibit_files:
    if not os.path.exists(f):
        missing_files.append(f)

if missing_files:
    print(f"\nMissing files: {missing_files}")
else:
    print("\nAll exhibit files found ✓")

# Build the compendium
output_file = "Compendium-of-Evidence-Complaint-Regarding-Kathleen-A-Hart.pdf"
subject = "JP Morgan Chase Bank, N.A."
date = "September 23, 2025"

try:
    cmd = [
        sys.executable, "build_compendium_improved.py"
    ] + exhibit_files + [
        output_file,
        "--subject", subject,
        "--date", date
    ]
    
    print(f"\nRunning: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Compendium built successfully!")
        print(result.stdout)
    else:
        print("❌ Error building compendium:")
        print(result.stderr)
        
except Exception as e:
    print(f"Exception occurred: {e}")