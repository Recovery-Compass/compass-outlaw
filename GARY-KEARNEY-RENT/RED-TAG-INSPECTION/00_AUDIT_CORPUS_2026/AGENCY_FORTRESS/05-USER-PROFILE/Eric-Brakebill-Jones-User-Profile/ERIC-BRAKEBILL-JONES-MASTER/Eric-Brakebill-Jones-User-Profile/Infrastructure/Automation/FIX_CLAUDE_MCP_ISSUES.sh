#!/bin/bash
# Fix Claude Desktop MCP Issues
# October 31, 2025

set -e

CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
BACKUP_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.backup.$(date +%Y%m%d_%H%M%S).json"

echo "═══════════════════════════════════════════════════"
echo "Claude Desktop MCP Fix Script"
echo "═══════════════════════════════════════════════════"
echo ""

# Step 1: Backup current config
echo "📦 Step 1: Backing up current configuration..."
cp "$CONFIG_PATH" "$BACKUP_PATH"
echo "✓ Backup saved to: $BACKUP_PATH"
echo ""

# Step 2: Show current filesystem config
echo "🔍 Step 2: Current filesystem configuration:"
jq '.mcpServers.filesystem' "$CONFIG_PATH"
echo ""

# Step 3: Prompt for fixes
echo "═══════════════════════════════════════════════════"
echo "REQUIRED FIXES:"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Issue 1: Filesystem paths need updating"
echo "  Current: Only subdirectories allowed"
echo "  Needed: Full /Users/ericjones access"
echo ""
echo "Issue 2: Notion API token is invalid (401)"
echo "  Current: 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"
echo "  Needed: New token from https://www.notion.so/my-integrations"
echo ""

# Step 4: Fix filesystem paths
read -p "Fix filesystem paths? (y/n): " fix_fs
if [ "$fix_fs" = "y" ]; then
    echo "📝 Updating filesystem configuration..."
    
    # Create temp file with updated config
    jq '.mcpServers.filesystem.args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/ericjones", "/Users/ericjones/Library/CloudStorage/GoogleDrive-eric@recovery-compass.org"]' "$CONFIG_PATH" > "$CONFIG_PATH.tmp"
    
    mv "$CONFIG_PATH.tmp" "$CONFIG_PATH"
    echo "✓ Filesystem paths updated"
    echo ""
fi

# Step 5: Fix Notion API token
echo "═══════════════════════════════════════════════════"
echo "Notion API Token Update"
echo "═══════════════════════════════════════════════════"
echo ""
echo "To get a new Notion API token:"
echo "1. Open: https://www.notion.so/my-integrations"
echo "2. Find 'Claude MCP Integration' (or create new)"
echo "3. Click 'Secrets' tab → 'Regenerate secret'"
echo "4. Copy the new token"
echo "5. Make sure integration has access to your pages"
echo ""
read -p "Do you have a new Notion API token? (y/n): " has_token

if [ "$has_token" = "y" ]; then
    read -p "Enter new Notion API token: " notion_token
    
    if [ -n "$notion_token" ]; then
        echo "📝 Updating Notion configuration..."
        
        # Update Notion token
        jq --arg token "$notion_token" '.mcpServers.notion.env.NOTION_API_KEY = $token' "$CONFIG_PATH" > "$CONFIG_PATH.tmp"
        
        mv "$CONFIG_PATH.tmp" "$CONFIG_PATH"
        echo "✓ Notion API token updated"
        echo ""
    fi
else
    echo "⚠️  Skipping Notion token update - you'll need to update manually"
    echo ""
fi

# Step 6: Show updated config
echo "═══════════════════════════════════════════════════"
echo "Updated Configuration:"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Filesystem:"
jq '.mcpServers.filesystem' "$CONFIG_PATH"
echo ""
echo "Notion API Key (masked):"
jq '.mcpServers.notion.env.NOTION_API_KEY' "$CONFIG_PATH" | sed 's/\(.\{8\}\).*/\1.../'
echo ""

# Step 7: Restart Claude Desktop
echo "═══════════════════════════════════════════════════"
echo "Restart Required"
echo "═══════════════════════════════════════════════════"
echo ""
read -p "Restart Claude Desktop now? (y/n): " restart

if [ "$restart" = "y" ]; then
    echo "🔄 Restarting Claude Desktop..."
    
    # Quit Claude Desktop
    osascript -e 'quit app "Claude"' 2>/dev/null || true
    sleep 2
    
    # Start Claude Desktop
    open -a Claude
    
    echo "✓ Claude Desktop restarted"
    echo ""
    echo "⏳ Wait 10 seconds for MCP servers to initialize..."
    sleep 10
fi

# Step 8: Verification
echo "═══════════════════════════════════════════════════"
echo "Verification"
echo "═══════════════════════════════════════════════════"
echo ""
echo "To verify fixes worked:"
echo ""
echo "1. Check filesystem access:"
echo "   Ask Claude: 'Read /Users/ericjones/NOTION_STATUS_UPDATE_OCT31_2025.md'"
echo ""
echo "2. Check Notion access:"
echo "   Ask Claude: 'Get page 09a4eba1ae5746699b4fcd4d5ee7cc19'"
echo ""
echo "3. Check logs:"
echo "   tail -20 ~/Library/Logs/Claude/mcp-server-filesystem.log"
echo "   tail -20 ~/Library/Logs/Claude/mcp-server-notion.log"
echo ""
echo "═══════════════════════════════════════════════════"
echo "✓ Fix script complete"
echo "═══════════════════════════════════════════════════"

