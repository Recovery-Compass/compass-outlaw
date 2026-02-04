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
