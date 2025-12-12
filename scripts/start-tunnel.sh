#!/bin/bash
# Start VS Code Tunnel for Compass Outlaw
# Version: 1.0
# Usage: ./start-tunnel.sh [tunnel-name]

set -e

# Configuration
DEFAULT_TUNNEL_NAME="compass-outlaw-$(hostname)"
TUNNEL_NAME="${1:-$DEFAULT_TUNNEL_NAME}"
LOG_DIR="${HOME}/.vscode-tunnel"
LOG_FILE="${LOG_DIR}/tunnel-${TUNNEL_NAME}.log"
PID_FILE="${LOG_DIR}/tunnel-${TUNNEL_NAME}.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p "$LOG_DIR"

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          VS Code Tunnel - Compass Outlaw                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if code CLI is installed
if ! command -v code &> /dev/null; then
    echo -e "${RED}ERROR: code CLI not found${NC}"
    echo "Install from: https://code.visualstudio.com/#alt-downloads"
    exit 1
fi

echo "Tunnel Name: $TUNNEL_NAME"
echo "Log File: $LOG_FILE"
echo "PID File: $PID_FILE"
echo ""

# Check if tunnel already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}WARNING: Tunnel already running (PID: $OLD_PID)${NC}"
        read -p "Stop existing tunnel? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Stopping tunnel (PID: $OLD_PID)..."
            kill "$OLD_PID" 2>/dev/null || true
            sleep 2
            rm -f "$PID_FILE"
        else
            echo "Exiting..."
            exit 0
        fi
    else
        # Stale PID file
        rm -f "$PID_FILE"
    fi
fi

# Start tunnel
echo -e "${GREEN}Starting tunnel...${NC}"
echo ""

# Run in foreground first to capture authentication
code tunnel \
    --name "$TUNNEL_NAME" \
    --accept-server-license-terms \
    --cli-data-dir "${HOME}/.vscode-tunnel/cli" \
    2>&1 | tee "$LOG_FILE" &

TUNNEL_PID=$!
echo $TUNNEL_PID > "$PID_FILE"

echo ""
echo -e "${GREEN}✓ Tunnel started successfully${NC}"
echo "  PID: $TUNNEL_PID"
echo "  Name: $TUNNEL_NAME"
echo "  Logs: tail -f $LOG_FILE"
echo ""
echo "To connect:"
echo "  1. Open VS Code on your local machine"
echo "  2. Press F1 → 'Remote-Tunnels: Connect to Tunnel'"
echo "  3. Select: $TUNNEL_NAME"
echo ""
echo "To stop:"
echo "  kill $TUNNEL_PID"
echo "  or run: ./stop-tunnel.sh $TUNNEL_NAME"
echo ""
