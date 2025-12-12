#!/bin/bash
# Health Check for VS Code Tunnel
# Version: 1.0
# Usage: ./tunnel-health-check.sh [tunnel-name]

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

echo "Checking tunnel health: $TUNNEL_NAME"
echo ""

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${RED}✗ PID file not found${NC}"
    exit 1
fi

# Read and check PID
PID=$(cat "$PID_FILE")
if ! ps -p "$PID" > /dev/null 2>&1; then
    echo -e "${RED}✗ Process not running (PID: $PID)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Process running (PID: $PID)${NC}"

# Check if code CLI is available
if ! command -v code &> /dev/null; then
    echo -e "${YELLOW}⚠ code CLI not in PATH (can't check tunnel status)${NC}"
    exit 0
fi

# Check tunnel status
echo ""
echo "Tunnel Status:"
code tunnel status 2>&1 || echo -e "${YELLOW}⚠ Could not retrieve tunnel status${NC}"

echo ""
echo -e "${GREEN}✓ Tunnel healthy${NC}"
exit 0
