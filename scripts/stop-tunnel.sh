#!/bin/bash
# Stop VS Code Tunnel for Compass Outlaw
# Version: 1.0
# Usage: ./stop-tunnel.sh [tunnel-name]

set -e

# Configuration
DEFAULT_TUNNEL_NAME="compass-outlaw-$(hostname)"
TUNNEL_NAME="${1:-$DEFAULT_TUNNEL_NAME}"
LOG_DIR="${HOME}/.vscode-tunnel"
PID_FILE="${LOG_DIR}/tunnel-${TUNNEL_NAME}.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping tunnel: $TUNNEL_NAME${NC}"

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${RED}ERROR: PID file not found: $PID_FILE${NC}"
    echo "Tunnel may not be running or was started manually."
    echo ""
    echo "Checking for running tunnel processes..."
    
    # Try to find and kill any code tunnel processes
    if pgrep -f "code tunnel" > /dev/null; then
        echo "Found tunnel process(es):"
        pgrep -af "code tunnel"
        read -p "Kill all tunnel processes? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pkill -f "code tunnel"
            echo -e "${GREEN}✓ All tunnel processes stopped${NC}"
        fi
    else
        echo "No tunnel processes found."
    fi
    exit 0
fi

# Read PID
PID=$(cat "$PID_FILE")

# Check if process is running
if ! ps -p "$PID" > /dev/null 2>&1; then
    echo -e "${YELLOW}WARNING: Process not running (PID: $PID)${NC}"
    rm -f "$PID_FILE"
    exit 0
fi

# Stop the process
echo "Stopping process (PID: $PID)..."
kill "$PID" 2>/dev/null || true

# Wait for process to stop
for i in {1..10}; do
    if ! ps -p "$PID" > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Force kill if still running
if ps -p "$PID" > /dev/null 2>&1; then
    echo "Force stopping..."
    kill -9 "$PID" 2>/dev/null || true
fi

# Clean up PID file
rm -f "$PID_FILE"

echo -e "${GREEN}✓ Tunnel stopped successfully${NC}"
