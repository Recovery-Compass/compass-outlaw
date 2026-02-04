#!/bin/bash
# Brave Search MCP Server Runner

# Set the Brave API key from environment
if [ -z "$BRAVE_API_KEY" ]; then
    echo "Error: BRAVE_API_KEY not set" >&2
    exit 1
fi

# Run the Brave Search MCP server using npx
exec npx -y @modelcontextprotocol/server-brave-search
