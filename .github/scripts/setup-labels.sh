#!/bin/bash
# GitHub Labels Setup Script
# Requires: gh CLI installed and authenticated

set -e

echo "Setting up GitHub labels for Epic/Issue workflow..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it with: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

REPO="Recovery-Compass/compass-outlaw"

echo "Creating labels for repository: $REPO"

# Epic label
gh label create "epic" \
    --description "Major initiative or feature set" \
    --color "8B4789" \
    --repo "$REPO" 2>/dev/null || echo "Label 'epic' already exists"

# Priority labels
gh label create "priority:critical" \
    --description "Must be done immediately" \
    --color "D73A4A" \
    --repo "$REPO" 2>/dev/null || echo "Label 'priority:critical' already exists"

gh label create "priority:high" \
    --description "Important, do soon" \
    --color "F97583" \
    --repo "$REPO" 2>/dev/null || echo "Label 'priority:high' already exists"

gh label create "priority:medium" \
    --description "Normal priority" \
    --color "FBCA04" \
    --repo "$REPO" 2>/dev/null || echo "Label 'priority:medium' already exists"

gh label create "priority:low" \
    --description "Nice to have" \
    --color "D4C5F9" \
    --repo "$REPO" 2>/dev/null || echo "Label 'priority:low' already exists"

# Type labels (ensure they exist with proper descriptions)
gh label create "enhancement" \
    --description "New feature or request" \
    --color "A2EEEF" \
    --repo "$REPO" 2>/dev/null || echo "Label 'enhancement' already exists"

gh label create "bug" \
    --description "Something isn't working" \
    --color "D73A4A" \
    --repo "$REPO" 2>/dev/null || echo "Label 'bug' already exists"

gh label create "documentation" \
    --description "Improvements or additions to documentation" \
    --color "0075CA" \
    --repo "$REPO" 2>/dev/null || echo "Label 'documentation' already exists"

gh label create "infrastructure" \
    --description "Infrastructure or tooling changes" \
    --color "BFD4F2" \
    --repo "$REPO" 2>/dev/null || echo "Label 'infrastructure' already exists"

echo ""
echo "✓ Label setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Epic #1 using the Epic template"
echo "2. Create related Issues with 'Refers to Epic #1'"
echo "3. Apply appropriate labels to Issues"
