#!/bin/bash

# Claude Code Power User Setup Script
# Implements high-signal patterns in one command

set -e

echo "🚀 Claude Code Power User Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create base directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p ~/.claude/{sub-agents,templates,notifications}
mkdir -p ~/bin
mkdir -p ~/mcp/servers

# 1. Output Modes
echo -e "${BLUE}🎛️  Setting up output modes...${NC}"
cat > ~/.claude/output_modes.json << 'EOF'
{
  "modes": {
    "minimal": {
      "description": "Terse responses, code only",
      "max_response_length": 500
    },
    "standard": {
      "description": "Balanced responses with context",
      "max_response_length": 2000
    },
    "detailed": {
      "description": "Comprehensive responses",
      "max_response_length": 5000
    },
    "teaching": {
      "description": "Educational with examples",
      "max_response_length": 10000
    }
  },
  "default_mode": "standard"
}
EOF

# 2. Sub-Agent Configuration
echo -e "${BLUE}🤖 Configuring sub-agents...${NC}"
cat > ~/.claude/sub-agents/config.json << 'EOF'
{
  "agents": {
    "wfd-specialist": {
      "role": "WFD Compliance Dashboard Expert",
      "context": [
        "~/Projects/recovery-compass/wfd-compliance",
        "~/Projects/recovery-compass/wfd-insight-hub"
      ],
      "focus": ["React", "Vite", "TypeScript", "Lovable.dev"]
    },
    "security-ops": {
      "role": "Cloudflare Security & Docker Scout Specialist",
      "focus": ["WAF", "Security Rules", "Docker", "Container Security"]
    },
    "lovable-automation": {
      "role": "Lovable.dev Workflow Optimizer",
      "context": ["~/lovable-*.py", "~/LOVABLE_*.md"]
    }
  }
}
EOF

# 3. Decision Checkpoints
echo -e "${BLUE}⚠️  Setting up decision checkpoints...${NC}"
cat > ~/.claude/decision_checkpoints.json << 'EOF'
{
  "checkpoints": {
    "architecture_changes": {
      "trigger": ["refactor", "restructure", "migrate"],
      "require_approval": true
    },
    "deployment_actions": {
      "trigger": ["deploy", "publish", "push to production"],
      "require_approval": true
    },
    "security_changes": {
      "trigger": ["WAF", "firewall", "security rule"],
      "require_approval": true
    },
    "data_operations": {
      "trigger": ["delete", "drop", "truncate"],
      "require_approval": true,
      "confirmation_word": "CONFIRM"
    }
  },
  "settings": {
    "enable_checkpoints": true,
    "log_decisions": "~/.claude/decision_log.json"
  }
}
EOF

# 4. Notification System
echo -e "${BLUE}🔔 Setting up notifications...${NC}"
cat > ~/.claude/notifications/config.json << 'EOF'
{
  "channels": {
    "terminal": {
      "enabled": true
    },
    "macos": {
      "enabled": true
    }
  },
  "alert_types": {
    "critical_error": {
      "priority": "high",
      "sound": true
    },
    "deployment_complete": {
      "priority": "normal"
    },
    "security_event": {
      "priority": "high"
    }
  }
}
EOF

cat > ~/bin/claude-notify.sh << 'EOF'
#!/bin/bash
TYPE=${1:-"info"}
MESSAGE=${2:-"Notification from Claude"}

# macOS notification
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" subtitle \"$TYPE\""
fi

# Log to file
echo "[$(date)] [$TYPE] $MESSAGE" >> ~/.claude/notifications/alerts.log
EOF

chmod +x ~/bin/claude-notify.sh

# 5. Token Monitoring (optional, requires npm package)
echo -e "${BLUE}💰 Token monitoring setup...${NC}"
if command -v npm &> /dev/null; then
  echo "   Install ccusage globally with: npm install -g @iannuttall/ccusage"
else
  echo "   ⚠️  npm not found, skipping ccusage installation"
fi

# 6. Project Templates
echo -e "${BLUE}📋 Creating project templates...${NC}"
cat > ~/.claude/templates/wfd-dashboard.json << 'EOF'
{
  "name": "WFD Compliance Dashboard",
  "description": "Recovery Compass compliance tracking dashboard",
  "stack": ["React", "Vite", "TypeScript", "Tailwind", "Recharts"],
  "boilerplate": "~/Projects/recovery-compass/wfd-insight-hub"
}
EOF

cat > ~/.claude/templates/lovable-project.json << 'EOF'
{
  "name": "Lovable.dev Project",
  "description": "AI-powered web app with Lovable.dev",
  "stack": ["React", "Vite", "TypeScript", "Tailwind", "Shadcn/ui"],
  "setup_commands": [
    "python3 ~/lovable-url-generator.py wfd-dashboard"
  ]
}
EOF

# 7. Enhanced Aliases
echo -e "${BLUE}🔗 Adding power-user aliases...${NC}"
cat >> ~/.zshrc << 'EOF'

# ============================================
# Claude Code Power User Aliases (Auto-Added)
# ============================================

# Output mode controls
alias claude-minimal='export CLAUDE_OUTPUT_MODE=minimal'
alias claude-standard='export CLAUDE_OUTPUT_MODE=standard'
alias claude-detailed='export CLAUDE_OUTPUT_MODE=detailed'
alias claude-teach='export CLAUDE_OUTPUT_MODE=teaching'
claude-mode() {
  echo "Current mode: ${CLAUDE_OUTPUT_MODE:-standard}"
}

# Quick project access
alias wfd-dev='cd ~/Projects/recovery-compass/wfd-insight-hub'
alias wfd-compliance='cd ~/Projects/recovery-compass/wfd-compliance'
alias rc-main='cd ~/Projects/recovery-compass/recovery-compass-main'

# Lovable shortcuts
alias lovable-gen='python3 ~/lovable-url-generator.py'
alias lovable-list='python3 ~/lovable-url-generator.py list'

# Status dashboards
alias status='cat ~/WFD_NEXT_ACTIONS.md | head -50'
alias lovable-index='cat ~/LOVABLE_MASTER_INDEX.md | head -100'

# Notifications
alias notify='~/bin/claude-notify.sh'

# Token monitoring (if installed)
alias tokens='ccusage --show 2>/dev/null || echo "Install ccusage: npm i -g @iannuttall/ccusage"'

EOF

# 8. Metrics Tracker
echo -e "${BLUE}📊 Creating metrics tracker...${NC}"
cat > ~/bin/claude-metrics.sh << 'EOF'
#!/bin/bash

echo "📊 Claude Code Power User Metrics"
echo "=================================="
echo ""

# Token usage
if command -v ccusage &> /dev/null; then
  echo "💰 Token Usage:"
  ccusage --show 2>/dev/null || echo "  No data yet"
  echo ""
fi

# Deployments today
if [ -f ~/.claude/notifications/alerts.log ]; then
  TODAY=$(date +%Y-%m-%d)
  DEPLOYS=$(grep "$TODAY.*deployment" ~/.claude/notifications/alerts.log 2>/dev/null | wc -l | tr -d ' ')
  echo "🚀 Deployments Today: $DEPLOYS"
  echo ""
fi

# Active projects
echo "📁 Active Projects:"
for repo in ~/Projects/recovery-compass/wfd-*; do
  if [ -d "$repo/.git" ]; then
    name=$(basename "$repo")
    commits=$(git -C "$repo" log --since="today" --oneline 2>/dev/null | wc -l | tr -d ' ')
    if [ "$commits" -gt 0 ]; then
      echo "  - $name: $commits commits"
    fi
  fi
done

echo ""
EOF

chmod +x ~/bin/claude-metrics.sh

# 9. Template Instantiation Script
echo -e "${BLUE}🎨 Creating template script...${NC}"
cat > ~/bin/claude-template.sh << 'EOF'
#!/bin/bash

TEMPLATE=$1

if [ -z "$TEMPLATE" ]; then
  echo "Usage: claude-template.sh <template>"
  echo ""
  echo "Available templates:"
  ls -1 ~/.claude/templates/*.json 2>/dev/null | xargs -n1 basename | sed 's/.json//' | sed 's/^/  - /'
  exit 1
fi

TEMPLATE_FILE=~/.claude/templates/$TEMPLATE.json

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "❌ Template not found: $TEMPLATE"
  exit 1
fi

echo "📦 Template: $TEMPLATE"
cat "$TEMPLATE_FILE" | jq -r '
  "Name: \(.name)\n" +
  "Description: \(.description)\n" +
  "Stack: \(.stack | join(", "))"
'
EOF

chmod +x ~/bin/claude-template.sh

# 10. Quick Setup Verification
echo -e "${BLUE}✅ Creating verification script...${NC}"
cat > ~/bin/claude-verify-setup.sh << 'EOF'
#!/bin/bash

echo "🔍 Claude Code Power User Setup Verification"
echo "============================================="
echo ""

checks=0
passed=0

# Check directories
echo "📁 Directories:"
for dir in ~/.claude ~/.claude/sub-agents ~/.claude/templates ~/.claude/notifications ~/bin; do
  checks=$((checks + 1))
  if [ -d "$dir" ]; then
    echo "  ✅ $dir"
    passed=$((passed + 1))
  else
    echo "  ❌ $dir (missing)"
  fi
done
echo ""

# Check config files
echo "📄 Configuration Files:"
for file in \
  ~/.claude/output_modes.json \
  ~/.claude/sub-agents/config.json \
  ~/.claude/decision_checkpoints.json \
  ~/.claude/notifications/config.json; do
  checks=$((checks + 1))
  if [ -f "$file" ]; then
    echo "  ✅ $(basename $file)"
    passed=$((passed + 1))
  else
    echo "  ❌ $(basename $file) (missing)"
  fi
done
echo ""

# Check scripts
echo "🔧 Helper Scripts:"
for script in \
  ~/bin/claude-notify.sh \
  ~/bin/claude-metrics.sh \
  ~/bin/claude-template.sh; do
  checks=$((checks + 1))
  if [ -x "$script" ]; then
    echo "  ✅ $(basename $script)"
    passed=$((passed + 1))
  else
    echo "  ❌ $(basename $script) (missing or not executable)"
  fi
done
echo ""

# Check aliases (in current shell)
echo "🔗 Aliases:"
if grep -q "Claude Code Power User Aliases" ~/.zshrc 2>/dev/null; then
  echo "  ✅ Aliases added to ~/.zshrc"
  passed=$((passed + 1))
else
  echo "  ⚠️  Aliases not found in ~/.zshrc"
fi
checks=$((checks + 1))
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary: $passed/$checks checks passed"
echo ""

if [ $passed -eq $checks ]; then
  echo "✅ Setup complete! Run 'source ~/.zshrc' to activate aliases."
else
  echo "⚠️  Some checks failed. Review output above."
fi
EOF

chmod +x ~/bin/claude-verify-setup.sh

# Final summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Claude Code Power User Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Activate new aliases:"
echo "   source ~/.zshrc"
echo ""
echo "2. Verify installation:"
echo "   ~/bin/claude-verify-setup.sh"
echo ""
echo "3. View metrics:"
echo "   ~/bin/claude-metrics.sh"
echo ""
echo "4. List templates:"
echo "   claude-template.sh"
echo ""
echo "5. Set output mode:"
echo "   claude-detailed"
echo ""
echo "6. Optional - Install token monitoring:"
echo "   npm install -g @iannuttall/ccusage"
echo ""
echo -e "${YELLOW}📖 Full documentation: ~/CLAUDE_CODE_POWER_USER_SYSTEM.md${NC}"
echo ""
