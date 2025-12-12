# VS Code Remote Tunnels - Quick Start

**Project:** Compass Outlaw  
**Repository:** Recovery-Compass/compass-outlaw  
**Date:** December 12, 2025

---

## 5-Minute Setup

### Local Machine (Your Computer)

1. **Install Remote Tunnels Extension**
   ```bash
   # Open VS Code, then:
   # Press Cmd+Shift+X → Search "Remote - Tunnels" → Install
   ```

### Remote Machines (Firebase/GCP/Antigravity)

2. **Install Code CLI**
   ```bash
   # Download and install
   curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' \
     --output vscode_cli.tar.gz
   tar -xf vscode_cli.tar.gz
   sudo mv code /usr/local/bin/
   code --version
   ```

3. **Start Tunnel**
   ```bash
   # Using our script (recommended)
   cd /path/to/Fortress
   ./scripts/start-tunnel.sh compass-outlaw-firebase
   
   # Or manually
   code tunnel --name compass-outlaw-firebase --accept-server-license-terms
   ```

4. **Authenticate**
   - Follow the GitHub OAuth prompt
   - Login with Recovery-Compass organization account
   - Copy the confirmation code

### Connect from Local VS Code

5. **Connect to Tunnel**
   - Press `F1`
   - Type: `Remote-Tunnels: Connect to Tunnel`
   - Select your tunnel (e.g., `compass-outlaw-firebase`)
   - VS Code window reloads → you're connected!

---

## Platform-Specific Instructions

### Firebase Studio

```bash
# SSH into Firebase environment
gcloud compute ssh firebase-dev --zone=us-west2-a

# Install code CLI (if not installed)
curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' -o vscode_cli.tar.gz
tar -xf vscode_cli.tar.gz && sudo mv code /usr/local/bin/

# Start tunnel
code tunnel --name compass-outlaw-firebase --accept-server-license-terms

# Keep terminal open or run in background
```

### Antigravity IDE

```bash
# From Antigravity web terminal
cd /workspace/compass-outlaw

# Install code CLI
wget https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64 -O vscode_cli.tar.gz
tar -xf vscode_cli.tar.gz && sudo mv code /usr/local/bin/

# Start tunnel
code tunnel --name compass-outlaw-antigravity --accept-server-license-terms
```

### GCP Vertex AI Workbench

```bash
# Open JupyterLab terminal
# Install code CLI
curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' -o vscode_cli.tar.gz
tar -xf vscode_cli.tar.gz && sudo mv code /usr/local/bin/

# Start tunnel
code tunnel --name compass-outlaw-vertex-ai --accept-server-license-terms
```

### GCP Cloud Run (Development Container)

```bash
# Deploy dev container with tunnel support
gcloud run deploy compass-outlaw-dev \
  --image gcr.io/agency-fortress-core-479708/compass-outlaw-dev:latest \
  --platform managed \
  --region us-west2 \
  --allow-unauthenticated

# Connect and start tunnel
gcloud run services proxy compass-outlaw-dev --port=8080
code tunnel --name compass-outlaw-cloud-run --accept-server-license-terms
```

---

## Management Commands

### Check Tunnel Status
```bash
code tunnel status
```

### Stop Tunnel
```bash
# Using our script
./scripts/stop-tunnel.sh compass-outlaw-firebase

# Or manually
pkill -f "code tunnel"
```

### Health Check
```bash
./scripts/tunnel-health-check.sh compass-outlaw-firebase
```

### View Logs
```bash
tail -f ~/.vscode-tunnel/tunnel-compass-outlaw-firebase.log
```

---

## Troubleshooting

### Tunnel Won't Start
```bash
# Check if code CLI is installed
which code
code --version

# Check for port conflicts
netstat -tulpn | grep :8000

# Restart tunnel
pkill -f "code tunnel"
./scripts/start-tunnel.sh
```

### Can't Connect from VS Code
1. Check tunnel is running: `code tunnel status`
2. Verify GitHub authentication
3. Check VS Code extension is installed
4. Try: `F1` → `Remote-Tunnels: Reload Window`

### Authentication Failed
```bash
# Logout and re-authenticate
code tunnel user logout
code tunnel user login --provider github
```

---

## Security Notes

- **M-014 Compliance:** Never commit `.env.tunnel` file
- All tunnels use GitHub OAuth (2FA required)
- Access limited to Recovery-Compass organization
- Tunnels auto-expire after 7 days of inactivity

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `./scripts/start-tunnel.sh [name]` | Start tunnel |
| `./scripts/stop-tunnel.sh [name]` | Stop tunnel |
| `./scripts/tunnel-health-check.sh [name]` | Check health |
| `code tunnel status` | Show tunnel status |
| `code tunnel --help` | Show all options |

---

## Next Steps

1. ✅ Start tunnel on remote machine
2. ✅ Connect from local VS Code
3. ✅ Verify workspace loaded correctly
4. ⏭️ Configure workspace settings (`.vscode/settings.json`)
5. ⏭️ Setup auto-start (systemd service)

**Full Documentation:** [docs/REMOTE_TUNNELS_SETUP.md](./docs/REMOTE_TUNNELS_SETUP.md)

---

**Status:** Ready for deployment  
**Tested Platforms:** Firebase Studio, GCP Vertex AI, Antigravity IDE  
**Security:** M-014, M-016 Compliant
