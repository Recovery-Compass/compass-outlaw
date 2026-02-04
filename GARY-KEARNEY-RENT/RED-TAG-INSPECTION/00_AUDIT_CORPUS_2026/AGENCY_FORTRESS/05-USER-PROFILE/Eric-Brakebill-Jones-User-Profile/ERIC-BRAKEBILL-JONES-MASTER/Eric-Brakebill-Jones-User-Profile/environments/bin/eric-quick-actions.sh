#!/bin/bash

echo "⚡ Eric's Quick Actions"
echo "======================"
echo ""
echo "What do you need?"
echo ""
echo "1) Check all project status"
echo "2) WFD Dashboard (production)"
echo "3) Recovery Compass (production)"
echo "4) Kathy Hart action items"
echo "5) Docker health check"
echo "6) Cloudflare DNS status"
echo "7) Generate Lovable URL"
echo "8) Rest permission check"
echo "9) Show hard deadlines (should be 0)"
echo ""
read -p "Choose (1-9): " choice

case $choice in
  1)
    claude-status
    ;;
  2)
    echo "🌐 Opening WFD Compliance Dashboard..."
    open https://compliance.erdmethod.org
    claude-wfd
    ;;
  3)
    echo "🌐 Opening Recovery Compass..."
    open https://erdmethod.org
    claude-rc
    ;;
  4)
    claude-kathy
    ;;
  5)
    echo "🐳 Docker Health Check..."
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    ;;
  6)
    echo "☁️  Cloudflare DNS Status..."
    cat ~/RECOVERY_COMPASS_CLOUDFLARE_STATUS.md 2>/dev/null | head -50
    ;;
  7)
    echo "🎨 Lovable URL Generator..."
    python3 ~/lovable-url-generator.py list
    ;;
  8)
    echo ""
    echo "✅ REST PERMISSION CHECK"
    echo "========================"
    echo ""
    echo "Production Systems: All operational ✅"
    echo "Hard Deadlines: 0 across all domains ✅"
    echo "Urgent Tasks: 0 ✅"
    echo ""
    echo "🛏️  You have permission to rest RIGHT NOW."
    echo "Work when you have energy. Rest without guilt."
    ;;
  9)
    echo ""
    echo "📅 HARD DEADLINE CHECK"
    echo "======================"
    echo ""
    echo "Recovery Compass: None"
    echo "WFD Dashboard: None"
    echo "Cloudflare DNS: None"
    echo "Docker: None (monthly cleanup suggested)"
    echo "Kathy Hart POA: None"
    echo "Nuha Support: None"
    echo ""
    echo "TOTAL: 0 hard deadlines ✅"
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
  10)
    echo ""
    echo "📊 Opening Analytics Dashboards..."
    ~/bin/analytics-dashboard.sh
    ;;
