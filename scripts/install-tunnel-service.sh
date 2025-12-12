#!/bin/bash
# Install VS Code Tunnel as a systemd service
# Usage: sudo ./install-tunnel-service.sh [username]

set -e

USER_NAME="${1:-$USER}"
SERVICE_FILE="vscode-tunnel.service"
SERVICE_PATH="/etc/systemd/system/$SERVICE_FILE"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Installing VS Code Tunnel Service${NC}"
echo "User: $USER_NAME"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: Must run as root${NC}"
    echo "Usage: sudo ./install-tunnel-service.sh [username]"
    exit 1
fi

# Check if code CLI is installed
if ! command -v code &> /dev/null; then
    echo -e "${RED}ERROR: code CLI not found${NC}"
    echo "Install from: https://code.visualstudio.com/#alt-downloads"
    exit 1
fi

# Check if user exists
if ! id "$USER_NAME" &>/dev/null; then
    echo -e "${RED}ERROR: User $USER_NAME does not exist${NC}"
    exit 1
fi

# Copy service file
if [ -f "$SCRIPT_DIR/$SERVICE_FILE" ]; then
    echo "Copying service file..."
    cp "$SCRIPT_DIR/$SERVICE_FILE" "$SERVICE_PATH"
    
    # Replace %i with actual username
    sed -i "s/%i/$USER_NAME/g" "$SERVICE_PATH"
    
    echo -e "${GREEN}✓ Service file installed${NC}"
else
    echo -e "${RED}ERROR: Service file not found: $SCRIPT_DIR/$SERVICE_FILE${NC}"
    exit 1
fi

# Reload systemd
echo "Reloading systemd..."
systemctl daemon-reload

# Enable service
echo "Enabling service..."
systemctl enable vscode-tunnel

# Start service
echo "Starting service..."
systemctl start vscode-tunnel

# Check status
sleep 2
echo ""
echo "Service Status:"
systemctl status vscode-tunnel --no-pager

echo ""
echo -e "${GREEN}✓ Installation complete${NC}"
echo ""
echo "Commands:"
echo "  Status:  sudo systemctl status vscode-tunnel"
echo "  Stop:    sudo systemctl stop vscode-tunnel"
echo "  Start:   sudo systemctl start vscode-tunnel"
echo "  Restart: sudo systemctl restart vscode-tunnel"
echo "  Logs:    sudo journalctl -u vscode-tunnel -f"
echo "  Disable: sudo systemctl disable vscode-tunnel"
