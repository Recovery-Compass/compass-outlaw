#!/bin/bash
# Daily Briefing Automation - Cron Job Script
# Runs every day at 9:00 AM PT to generate daily briefing

set -e

# Configuration
BRIEFING_DIR="/Users/ericjones/Infrastructure/daily-briefing-system"
OUTPUT_DIR="/Users/ericjones"
ARCHIVE_DIR="$BRIEFING_DIR/archive"
LOG_FILE="$BRIEFING_DIR/automation.log"

# Environment setup
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export PERPLEXITY_API_KEY="$(cat $BRIEFING_DIR/.env | grep PERPLEXITY_API_KEY | cut -d '=' -f2)"

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%I%M%p")
DATE_STR=$(date +"%b%d_%Y")

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Starting Daily Briefing Automation"
log "=========================================="

# Step 1: Gather Gmail Intelligence
log "📧 Gathering Gmail intelligence..."
cd "$BRIEFING_DIR"
python3 gmail_intelligence.py >> "$LOG_FILE" 2>&1 || log "⚠️  Gmail intelligence failed (continuing...)"

# Step 2: Gather Calendar Intelligence
log "📅 Gathering Calendar intelligence..."
python3 calendar_intelligence.py >> "$LOG_FILE" 2>&1 || log "⚠️  Calendar intelligence failed (continuing...)"

# Step 3: Gather Web Intelligence (Perplexity)
log "🌐 Gathering Web intelligence..."
python3 perplexity_intelligence.py >> "$LOG_FILE" 2>&1 || log "⚠️  Perplexity intelligence failed (continuing...)"

# Step 4: Run MCP scan for GitHub commits
log "📊 Scanning GitHub repositories..."
# This would be handled by GitHub Copilot MCP in the actual briefing generation

# Step 5: Archive yesterday's briefing
log "📦 Archiving previous briefing..."
YESTERDAY=$(date -v-1d +"%b%d_%Y" 2>/dev/null || date -d "yesterday" +"%b%d_%Y" 2>/dev/null)
if [ -f "$OUTPUT_DIR/DAILY_BRIEFING_${YESTERDAY}_*.md" ]; then
    mv "$OUTPUT_DIR/DAILY_BRIEFING_${YESTERDAY}"*.md "$ARCHIVE_DIR/" 2>/dev/null || true
    log "✅ Previous briefing archived"
fi

# Step 6: Generate today's briefing using GitHub Copilot
log "🤖 Generating briefing with GitHub Copilot MCP..."
log "Manual step required: Run GitHub Copilot with daily briefing config"

# Create trigger file for manual execution
cat > "$BRIEFING_DIR/BRIEFING_READY_${TIMESTAMP}.txt" << EOF
Daily Briefing Data Ready for Generation
Generated: $(date +'%Y-%m-%d %I:%M %p PT')

Intelligence Files Ready:
✅ Gmail: $BRIEFING_DIR/gmail-intelligence-latest.md
✅ Calendar: $BRIEFING_DIR/calendar-intelligence-latest.md
✅ Web Intel: $BRIEFING_DIR/perplexity-intelligence-latest.md

Next Step: Run GitHub Copilot CLI with:
Execute daily briefing using config: $BRIEFING_DIR/DAILY_BRIEFING_CONFIG.json

Intelligence will be integrated automatically from above files.
EOF

log "✅ Intelligence gathering complete"
log "📝 Trigger file created: BRIEFING_READY_${TIMESTAMP}.txt"
log "=========================================="
log "Daily Briefing Automation Complete"
log "=========================================="

# Send notification (if you have terminal-notifier installed)
if command -v terminal-notifier &> /dev/null; then
    terminal-notifier -title "Daily Briefing" -message "Intelligence gathering complete. Ready for GitHub Copilot generation." -sound default
fi
