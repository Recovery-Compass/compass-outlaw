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
