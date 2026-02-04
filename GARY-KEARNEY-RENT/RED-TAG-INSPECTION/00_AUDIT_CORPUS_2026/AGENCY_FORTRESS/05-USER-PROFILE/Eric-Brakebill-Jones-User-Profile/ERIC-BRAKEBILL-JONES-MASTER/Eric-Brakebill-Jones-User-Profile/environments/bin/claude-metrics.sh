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
