#!/bin/bash

echo "🔍 Claude Desktop MCP Server Status Check"
echo "=========================================="
echo ""

# Check if Claude is running
if pgrep -x "Claude" > /dev/null; then
    echo "✅ Claude Desktop is running"
else
    echo "⚠️  Claude Desktop is not running"
    echo "   Start it with: open -a Claude"
fi

echo ""
echo "📋 Configuration File:"
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ Config file exists"
    echo "   Location: $CONFIG_FILE"
    echo ""
    echo "🔌 Configured MCP Servers:"
    cat "$CONFIG_FILE" | grep -o '"[^"]*":' | grep -v 'mcpServers\|command\|args\|env' | sed 's/://g' | sed 's/"//g' | awk '{print "   - " $0}'
else
    echo "❌ Config file not found"
fi

echo ""
echo "📝 Recent MCP Logs:"
LOG_DIR="$HOME/Library/Logs/Claude"

if [ -d "$LOG_DIR" ]; then
    echo ""
    echo "GitHub MCP Server:"
    if [ -f "$LOG_DIR/mcp-server-github.log" ]; then
        ERRORS=$(grep -i "error\|failed" "$LOG_DIR/mcp-server-github.log" | tail -3)
        if [ -z "$ERRORS" ]; then
            echo "   ✅ No recent errors"
        else
            echo "   ⚠️  Recent errors found:"
            echo "$ERRORS" | sed 's/^/      /'
        fi
    else
        echo "   📄 No log file yet (will be created on first use)"
    fi
    
    echo ""
    echo "Cloudflare MCP Server:"
    if [ -f "$LOG_DIR/mcp-server-cloudflare.log" ]; then
        ERRORS=$(grep -i "error\|failed" "$LOG_DIR/mcp-server-cloudflare.log" | tail -3)
        if [ -z "$ERRORS" ]; then
            echo "   ✅ No recent errors"
        else
            echo "   ⚠️  Recent errors found:"
            echo "$ERRORS" | sed 's/^/      /'
        fi
    else
        echo "   📄 No log file yet"
    fi
    
    echo ""
    echo "Filesystem MCP Server:"
    if [ -f "$LOG_DIR/mcp-server-filesystem.log" ]; then
        ERRORS=$(grep -i "error\|failed" "$LOG_DIR/mcp-server-filesystem.log" | tail -3)
        if [ -z "$ERRORS" ]; then
            echo "   ✅ No recent errors"
        else
            echo "   ⚠️  Recent errors found:"
            echo "$ERRORS" | sed 's/^/      /'
        fi
    else
        echo "   📄 No log file yet"
    fi
fi

echo ""
echo "🔑 GitHub Authentication:"
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI installed"
    if gh auth status &> /dev/null; then
        ACCOUNT=$(gh auth status 2>&1 | grep "Logged in" | sed 's/.*account //' | sed 's/ .*//')
        echo "✅ Authenticated as: $ACCOUNT"
    else
        echo "⚠️  Not authenticated with GitHub CLI"
    fi
else
    echo "⚠️  GitHub CLI not installed"
fi

echo ""
echo "🌐 GitHub App Status:"
echo "   Check: https://github.com/settings/installations"
echo "   Install: https://github.com/apps/claude-for-github/installations/new"

echo ""
echo "=========================================="
echo "📚 Documentation: ~/CLAUDE_GITHUB_APP_SETUP.md"
echo "🔄 Restart Claude: killall Claude && open -a Claude"
echo ""
