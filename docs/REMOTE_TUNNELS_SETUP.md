# VS Code Remote Tunnels Setup for Compass Outlaw

**Version:** 1.0  
**Last Updated:** December 12, 2025  
**Repository:** Recovery-Compass/compass-outlaw

---

## Overview

This guide configures VS Code Remote Tunnels to provide secure remote access to the Compass Outlaw development environment across multiple cloud platforms without requiring SSH or VPN configuration.

### Supported Platforms

- **Firebase Studio** - Firebase hosting and functions
- **Antigravity IDE** - Cloud development environment
- **Google Cloud Platform** - Vertex AI, Cloud Run, Edge Functions
- **Vertex AI Workbench** - ML model training and deployment
- **GitHub Codespaces** - compass-outlaw repository

---

## Architecture

```
Local VS Code Client
    ↓ (Secure Tunnel via GitHub Auth)
    ├─→ Firebase Studio Environment
    ├─→ Antigravity IDE Instance
    ├─→ GCP Vertex AI Workbench
    ├─→ Cloud Run Development Container
    └─→ GitHub Codespaces (compass-outlaw)
```

---

## Prerequisites

- VS Code installed locally
- GitHub account with access to Recovery-Compass organization
- GCP project: `agency-fortress-core-479708`
- Active Firebase project
- Remote Tunnels extension

---

## Installation

### 1. Install VS Code Remote Tunnels Extension

**Local Machine:**
```bash
code --install-extension ms-vscode.remote-server
```

Or install via VS Code Marketplace:
- Open VS Code
- Press `Cmd+Shift+X` (Extensions)
- Search for "Remote - Tunnels"
- Click Install

### 2. Install Code CLI on Remote Machines

**For GCP Compute Engine / Vertex AI Workbench:**
```bash
# Download standalone code CLI
curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' \
  --output vscode_cli.tar.gz

# Extract
tar -xf vscode_cli.tar.gz

# Move to PATH
sudo mv code /usr/local/bin/

# Verify
code --version
```

**For Firebase/Antigravity (Cloud Shell):**
```bash
# Use gcloud to SSH and install
gcloud compute ssh [INSTANCE_NAME] --zone=[ZONE] --command="
  curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' \
    --output vscode_cli.tar.gz && \
  tar -xf vscode_cli.tar.gz && \
  sudo mv code /usr/local/bin/ && \
  code --version
"
```

---

## Configuration

### 1. Create Tunnel on Remote Machines

**GCP Vertex AI Workbench:**
```bash
# Start tunnel with descriptive name
code tunnel --name compass-outlaw-vertex-ai --accept-server-license-terms

# Follow GitHub OAuth flow in browser
# Copy the tunnel URL displayed
```

**Firebase Studio Environment:**
```bash
# Connect to Firebase environment
firebase login
firebase projects:list

# Start tunnel
code tunnel --name compass-outlaw-firebase --accept-server-license-terms
```

**Antigravity IDE:**
```bash
# From Antigravity terminal
code tunnel --name compass-outlaw-antigravity --accept-server-license-terms
```

**GCP Cloud Run Development Container:**
```bash
# Deploy persistent development container
gcloud run deploy compass-outlaw-dev \
  --image gcr.io/agency-fortress-core-479708/compass-outlaw-dev:latest \
  --platform managed \
  --region us-west2 \
  --port 8080 \
  --allow-unauthenticated

# SSH into container and start tunnel
gcloud run services proxy compass-outlaw-dev --port=8080
code tunnel --name compass-outlaw-cloud-run --accept-server-license-terms
```

### 2. Connect from Local VS Code

**Method 1: Command Palette**
1. Press `F1` or `Cmd+Shift+P`
2. Type: `Remote-Tunnels: Connect to Tunnel`
3. Select tunnel from list:
   - `compass-outlaw-vertex-ai`
   - `compass-outlaw-firebase`
   - `compass-outlaw-antigravity`
   - `compass-outlaw-cloud-run`

**Method 2: Remote Explorer**
1. Click Remote indicator (bottom-left corner)
2. Select "Connect to Tunnel..."
3. Choose tunnel from dropdown

**Method 3: Direct URL**
```bash
# Open specific tunnel
code --remote tunnel+compass-outlaw-vertex-ai
```

---

## Tunnel Management

### List Active Tunnels

```bash
# From any machine with code CLI
code tunnel status
```

### Stop a Tunnel

```bash
# On the remote machine
code tunnel kill
```

### Auto-Start Tunnel on Boot

**Create systemd service (Linux/GCP):**

```bash
sudo tee /etc/systemd/system/vscode-tunnel.service > /dev/null <<EOF
[Unit]
Description=VS Code Tunnel for Compass Outlaw
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/code tunnel --name compass-outlaw-$(hostname) --accept-server-license-terms
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable vscode-tunnel
sudo systemctl start vscode-tunnel

# Check status
sudo systemctl status vscode-tunnel
```

---

## Security Configuration

### 1. GitHub Authentication

All tunnels use GitHub OAuth for authentication. Ensure:
- GitHub account has 2FA enabled
- Access limited to Recovery-Compass organization members
- Personal Access Tokens (PATs) rotated regularly

### 2. Firewall Rules (GCP)

```bash
# Allow tunnel traffic (if needed)
gcloud compute firewall-rules create allow-vscode-tunnel \
  --project=agency-fortress-core-479708 \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:8000-8100 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=vscode-tunnel
```

### 3. IAM Permissions

Ensure service account has required permissions:

```bash
# Grant tunnel access to service account
gcloud projects add-iam-policy-binding agency-fortress-core-479708 \
  --member="serviceAccount:compass-outlaw@agency-fortress-core-479708.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"
```

---

## Integration with Compass Outlaw Workflow

### Environment Variables

Create `.env.tunnel` in repository root:

```bash
# Tunnel Configuration
VSCODE_TUNNEL_NAME=compass-outlaw-${HOSTNAME}
VSCODE_TUNNEL_ENABLED=true

# GCP Configuration
GCP_PROJECT_ID=agency-fortress-core-479708
GCP_REGION=us-west2

# Vertex AI Configuration
VERTEX_AI_LOCATION=us-west2
VERTEX_AI_ENDPOINT=${VERTEX_AI_ENDPOINT}

# Firebase Configuration
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}

# GitHub Configuration
GITHUB_ORG=Recovery-Compass
GITHUB_REPO=compass-outlaw
```

### Workspace Settings

Create `.vscode/settings.json` for tunnel-specific configuration:

```json
{
  "remote.tunnels.access": {
    "organizationId": "Recovery-Compass",
    "requireOrganizationAccess": true
  },
  "remote.tunnels.accountPreference": "github",
  "security.workspace.trust.enabled": true,
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.cwd": "/workspace/compass-outlaw",
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.venv/**": true
  }
}
```

---

## Platform-Specific Configuration

### Firebase Studio

```bash
# Initialize Firebase in tunnel environment
firebase login
firebase use agency-fortress-core-479708

# Start local emulators
firebase emulators:start --only functions,firestore

# Tunnel will expose localhost:5000, :8080, etc.
```

### Antigravity IDE

```bash
# Antigravity-specific setup
export ANTIGRAVITY_PROJECT=compass-outlaw
export ANTIGRAVITY_WORKSPACE=/workspace/compass-outlaw

# Sync with GitHub
git config --global user.name "Compass Outlaw Bot"
git config --global user.email "bot@recovery-compass.dev"
```

### Vertex AI Workbench

```bash
# Install Vertex AI SDK
pip install google-cloud-aiplatform

# Configure credentials
gcloud auth application-default login

# Test connection
python -c "from google.cloud import aiplatform; aiplatform.init(project='agency-fortress-core-479708')"
```

---

## Troubleshooting

### Tunnel Won't Start

```bash
# Check if port is in use
netstat -tulpn | grep :8000

# Kill existing process
pkill -f "code tunnel"

# Restart with verbose logging
code tunnel --name compass-outlaw-debug --verbose --accept-server-license-terms
```

### Authentication Failed

```bash
# Clear GitHub credentials
code tunnel user logout

# Re-authenticate
code tunnel user login --provider github
```

### Connection Timeout

```bash
# Check tunnel status
code tunnel status

# Test network connectivity
curl -I https://global.rel.tunnels.api.visualstudio.com

# Check GCP firewall rules
gcloud compute firewall-rules list --project=agency-fortress-core-479708
```

---

## Automation Scripts

### Quick Start Script

Create `scripts/start-tunnel.sh`:

```bash
#!/bin/bash
# Start VS Code Tunnel for Compass Outlaw

set -e

TUNNEL_NAME="compass-outlaw-$(hostname)"
LOG_FILE="/var/log/vscode-tunnel.log"

echo "Starting VS Code Tunnel: $TUNNEL_NAME"
echo "Logs: $LOG_FILE"

# Check if tunnel already running
if pgrep -f "code tunnel" > /dev/null; then
    echo "Tunnel already running. Stopping..."
    pkill -f "code tunnel"
    sleep 2
fi

# Start tunnel in background
nohup code tunnel \
    --name "$TUNNEL_NAME" \
    --accept-server-license-terms \
    --verbose \
    > "$LOG_FILE" 2>&1 &

echo "Tunnel started: $TUNNEL_NAME"
echo "View logs: tail -f $LOG_FILE"
```

### Health Check Script

Create `scripts/tunnel-health-check.sh`:

```bash
#!/bin/bash
# Check VS Code Tunnel Health

TUNNEL_NAME="compass-outlaw-$(hostname)"

# Check if process is running
if ! pgrep -f "code tunnel" > /dev/null; then
    echo "ERROR: Tunnel process not running"
    exit 1
fi

# Check tunnel status
if ! code tunnel status | grep -q "$TUNNEL_NAME"; then
    echo "ERROR: Tunnel not registered"
    exit 1
fi

echo "OK: Tunnel healthy"
exit 0
```

---

## Monitoring

### Prometheus Metrics

Expose tunnel metrics for monitoring:

```bash
# Install Prometheus node exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz
tar -xvf node_exporter-1.7.0.linux-amd64.tar.gz
sudo mv node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter

[Service]
User=node_exporter
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

---

## Related Documentation

- [Epic/Issue Workflow](./epic-issue-workflow.md)
- [WARP Rules](../rules/WARP_RULES.md)
- [Agent Context](./AGENT_CONTEXT.yaml)
- [Antigravity Quick Start](../ANTIGRAVITY_QUICK_START.md)
- [GCP Build Guide](../gcp%20build.txt)

---

## Support

For issues or questions:
1. Check tunnel logs: `tail -f /var/log/vscode-tunnel.log`
2. Review [VS Code Remote Tunnels Documentation](https://code.visualstudio.com/docs/remote/tunnels)
3. Open issue in compass-outlaw repository

---

**Document Owner:** Recovery Compass Team  
**Compliance:** M-014, M-016 (Security)  
**Review Cadence:** Monthly
