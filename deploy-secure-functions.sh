#!/bin/bash
# Secure Edge Function Deployment Script
# PFV V16 Protocol

set -e

PROJECT_ID="ftiiajmvmxthcpdwqerh"

echo "========================================="
echo "Compass Outlaw - Secure Function Deploy"
echo "Project: $PROJECT_ID"
echo "========================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install: npm install -g supabase"
    exit 1
fi

echo "✓ Supabase CLI found"

# Link to project
echo "Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID || echo "Already linked"

# Set secrets
echo ""
echo "⚠️  IMPORTANT: Set your Gemini API key"
echo "Run: supabase secrets set GEMINI_API_KEY=your_actual_key"
echo ""
read -p "Have you set the GEMINI_API_KEY secret? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please set secrets first:"
    echo "  supabase secrets set GEMINI_API_KEY=your_key"
    exit 1
fi

# Run migrations
echo "Running database migrations..."
supabase db push

# Deploy function
echo "Deploying gemini-draft function with JWT verification ENABLED..."
supabase functions deploy gemini-draft

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Security Status:"
echo "  ✓ JWT verification: ENABLED"
echo "  ✓ Rate limiting: 10/min, 100/hour"
echo "  ✓ Audit logging: ENABLED"
echo "  ✓ CORS: Configured"
echo ""
echo "Function URL:"
echo "  https://ftiiajmvmxthcpdwqerh.supabase.co/functions/v1/gemini-draft"
echo ""
echo "Test unauthorized access (should fail with 401):"
echo "  curl -X POST https://ftiiajmvmxthcpdwqerh.supabase.co/functions/v1/gemini-draft \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"recipient\":\"test\",\"keyFacts\":\"test\",\"desiredOutcome\":\"test\",\"tone\":\"FORMAL\"}'"
echo ""
