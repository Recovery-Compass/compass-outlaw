#!/bin/bash
# CM-015 PDF Assembly Runner
# Handles environment setup automatically

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Set Python path for cryptography module
export PYTHONPATH=/usr/local/lib/python3.11/dist-packages:$PYTHONPATH

# Check for required input file
if [ ! -f "CM-015_BLANK_DEEP_THINK.pdf" ]; then
    echo "ERROR: Missing input file: CM-015_BLANK_DEEP_THINK.pdf"
    echo "Please upload the file to: $SCRIPT_DIR/"
    exit 1
fi

# Check for assembly script
if [ ! -f "cm015_grid_final.py" ]; then
    echo "ERROR: Missing assembly script: cm015_grid_final.py"
    echo "Please upload the script to: $SCRIPT_DIR/"
    exit 1
fi

echo "Running CM-015 Grid Assembly..."
python3 cm015_grid_final.py

echo "Assembly complete!"
if [ -f "CM-015_GRID_CALIBRATED.pdf" ]; then
    echo "Output: $SCRIPT_DIR/CM-015_GRID_CALIBRATED.pdf"
    ls -la CM-015_GRID_CALIBRATED.pdf
fi
