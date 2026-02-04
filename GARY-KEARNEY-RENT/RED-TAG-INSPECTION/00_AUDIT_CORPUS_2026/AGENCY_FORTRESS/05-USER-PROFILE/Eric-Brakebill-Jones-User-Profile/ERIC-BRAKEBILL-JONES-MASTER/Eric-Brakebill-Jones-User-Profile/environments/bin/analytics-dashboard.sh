#!/bin/bash

# Quick Analytics Dashboard Access
# Opens all your analytics platforms

echo "🚀 Opening Analytics Dashboards..."
echo ""

# Google Analytics Real-Time
echo "Opening GA4 Real-Time..."
open "https://analytics.google.com/analytics/web/#/realtime"

# Cloudflare Analytics - Recovery Compass
echo "Opening Cloudflare Analytics (erdmethod.org)..."
open "https://dash.cloudflare.com/876573804668414b6f7d352de8d35816/erdmethod.org/analytics"

# Cloudflare Analytics - WFD Compliance
echo "Opening Cloudflare Analytics (compliance.erdmethod.org)..."
open "https://dash.cloudflare.com/876573804668414b6f7d352de8d35816/compliance.erdmethod.org/analytics"

echo ""
echo "✅ All dashboards opened in your browser"
echo ""
echo "What to check:"
echo "  GA4: Active users, engagement, growth"
echo "  Cloudflare: Performance, security, bandwidth"
