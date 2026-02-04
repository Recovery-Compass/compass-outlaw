#!/bin/bash
TYPE=${1:-"info"}
MESSAGE=${2:-"Notification from Claude"}

# macOS notification
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "display notification \"$MESSAGE\" with title \"Claude Code\" subtitle \"$TYPE\""
fi

# Log to file
echo "[$(date)] [$TYPE] $MESSAGE" >> ~/.claude/notifications/alerts.log
