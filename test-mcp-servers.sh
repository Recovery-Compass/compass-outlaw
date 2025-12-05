#!/bin/bash
# Test MCP Servers for Compass Outlaw
# PFV V16 Protocol

echo "========================================="
echo "Testing MCP Servers - Compass Outlaw"
echo "========================================="
echo ""

test_count=0
pass_count=0

test_server() {
    local name=$1
    local command=$2
    test_count=$((test_count + 1))
    
    echo "Testing $name..."
    if eval "$command" &> /dev/null; then
        echo "  ✅ $name: OK"
        pass_count=$((pass_count + 1))
    else
        echo "  ❌ $name: FAILED"
    fi
}

# Test npm-based servers
test_server "Playwright" "npx -y @executeautomation/playwright-mcp-server --version"
test_server "Manus" "command -v npx"
test_server "Cerebra Legal" "command -v npx"
test_server "GitHub" "npx -y @modelcontextprotocol/server-github --version"
test_server "Context7" "npx -y @context7/mcp-server --version"
test_server "Brave Search" "npx -y @modelcontextprotocol/server-brave-search --version"
test_server "Firecrawl" "npx -y firecrawl-mcp --version"
test_server "Doc Ops" "npx -y doc-ops-mcp --version"

# Test Python servers
test_server "Supabase (uvx)" "command -v uvx"
test_server "Word Server (uvx)" "uvx --version"

# Test filesystem access
test_server "Fortress Access" "test -d /Users/ericjones/Fortress"

echo ""
echo "========================================="
echo "Results: $pass_count/$test_count tests passed"
echo "========================================="

if [ $pass_count -eq $test_count ]; then
    echo "✅ All servers ready"
    exit 0
else
    echo "⚠️  Some servers need attention"
    exit 1
fi
