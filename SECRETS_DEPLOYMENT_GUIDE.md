# Secrets Deployment Guide - Compass Outlaw

**Last Updated:** December 4, 2025  
**Project ID:** ftiiajmvmxthcpdwqerh  
**Status:** ✅ All API keys configured

---

## ⚠️ SECURITY WARNING

**CRITICAL:** Never commit the following files to git:
- `.env.production`
- `.env.local`
- `deploy-secrets.sh`
- Any file containing API keys

These files are now in `.gitignore` and protected.

---

## Available API Keys

### AI Services (8 keys)
- ✅ Google Gemini (Compass Outlaw)
- ✅ Anthropic Claude (5 variants: Main, 5-Bird, Admin, MCP, RC)
- ✅ OpenAI (3 variants: Project, Admin, Service)
- ✅ Perplexity (2 keys: Main, 5-Bird)

### Legal Research (4 keys)
- ✅ CourtListener
- ✅ Manus AI (4 variants: Primary, Secondary, MCP, RC)
- ✅ Context7
- ✅ Brave Search

### Development (4 keys)
- ✅ GitHub (3 tokens: Fine-grained PAT, Standard PAT, MCP PAT)
- ✅ Docker Hub
- ✅ Vercel

### Media & Assets (6 keys)
- ✅ Firecrawl (web scraping)
- ✅ Cloudinary (image/video storage)
- ✅ HeyGen (video generation)
- ✅ Hugging Face (2 keys)

### Infrastructure (6 keys)
- ✅ Cloudflare (3 API keys + Access credentials)
- ✅ Supabase (2 variants: anon key, publishable key)

### Data & Communication (4 keys)
- ✅ Airtable
- ✅ Resend (email)
- ✅ Digital Inspiration
- ✅ Doppler (2 tokens: RO, RW)

### Monitoring & Testing (2 keys)
- ✅ Postman
- ✅ OpenAI Agent Kit

**Total:** 34+ API keys configured

---

## Deployment Options

### Option 1: Automated Deployment (Recommended)

```bash
# Deploy all secrets to Supabase
./deploy-secrets.sh
```

This script:
- Links to Supabase project (ftiiajmvmxthcpdwqerh)
- Deploys critical API keys for edge functions
- Verifies deployment
- Shows verification commands

### Option 2: Manual Deployment

```bash
# Link to project
supabase link --project-ref ftiiajmvmxthcpdwqerh

# Set secrets individually
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set ANTHROPIC_API_KEY=your_key
# ... etc

# List all secrets
supabase secrets list

# Verify specific secret
supabase secrets get GEMINI_API_KEY
```

### Option 3: Environment Variables (Local Development)

Copy `.env.production` to `.env.local`:
```bash
cp .env.production .env.local
```

The app will load from `.env.local` automatically (Next.js/Vite convention).

---

## Required Secrets for Edge Functions

### gemini-draft Function
**Required:**
- `GEMINI_API_KEY` - For AI text generation
- `SUPABASE_URL` - Auto-injected
- `SUPABASE_ANON_KEY` - Auto-injected

**Optional:**
- `ANTHROPIC_API_KEY` - Fallback AI service
- `OPENAI_API_KEY` - Alternative AI service

### Future Functions

**intelligence-report:**
- `GEMINI_API_KEY`
- `BRAVE_API_KEY`
- `CONTEXT7_API_KEY`

**legal-research:**
- `COURTLISTENER_API_KEY`
- `MANUS_API_KEY`
- `CONTEXT7_API_KEY`

**document-processing:**
- `FIRECRAWL_API_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## Verification Commands

### Check Deployed Secrets
```bash
# List all secrets
supabase secrets list

# Get specific secret (value hidden)
supabase secrets get GEMINI_API_KEY
```

### Test Edge Function with Secret
```bash
# Deploy function
supabase functions deploy gemini-draft

# Test (should work with auth)
curl -X POST https://ftiiajmvmxthcpdwqerh.supabase.co/functions/v1/gemini-draft \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"Attorney","keyFacts":"Test","desiredOutcome":"Test","tone":"FORMAL"}'
```

### Check Function Logs
```bash
# View logs for debugging
supabase functions logs gemini-draft --tail

# View specific time range
supabase functions logs gemini-draft --since="2025-12-04 18:00:00"
```

---

## Security Best Practices

### ✅ DO

1. **Rotate keys every 90 days**
   - Set calendar reminders
   - Document rotation dates
   - Test after rotation

2. **Use environment-specific keys**
   - Development keys for local
   - Staging keys for testing
   - Production keys for live

3. **Monitor usage**
   - Set up cost alerts
   - Review API logs weekly
   - Track unusual patterns

4. **Enable 2FA**
   - All service accounts
   - GitHub
   - Supabase dashboard
   - Cloud providers

5. **Use secrets management**
   - Doppler for production
   - Supabase secrets for functions
   - Never hardcode in code

### ❌ DON'T

1. **Never commit secrets to git**
   - Check `.gitignore`
   - Use git-secrets tool
   - Scan commits

2. **Don't share keys via**
   - Email
   - Slack
   - SMS
   - Unencrypted chat

3. **Don't use production keys in**
   - Local development
   - CI/CD logs
   - Public demos
   - Screenshots

4. **Don't store keys in**
   - Source code
   - Frontend JavaScript
   - Public repositories
   - Browser localStorage

---

## API Key Management

### Key Rotation Schedule

| Service | Last Rotated | Next Rotation | Frequency |
|---------|--------------|---------------|-----------|
| Gemini | 2025-11-30 | 2026-02-28 | 90 days |
| Claude | 2025-11-12 | 2026-02-10 | 90 days |
| GitHub | 2025-11-29 | 2026-02-27 | 90 days |
| OpenAI | 2025-10-30 | 2026-01-28 | 90 days |
| All Others | TBD | TBD | 90 days |

### Usage Monitoring

**Daily Checks:**
```bash
# Check function call counts
supabase functions logs --tail | grep "gemini-draft"

# Check for errors
supabase functions logs --tail | grep "error"
```

**Weekly Reviews:**
- API usage costs per service
- Failed authentication attempts
- Rate limit violations
- Unusual access patterns

**Monthly Audits:**
- Review all active keys
- Disable unused keys
- Update documentation
- Test disaster recovery

---

## Troubleshooting

### Secret Not Found
```bash
# Verify secret is set
supabase secrets list

# Re-set if missing
supabase secrets set KEY_NAME=value

# Redeploy function
supabase functions deploy function-name
```

### Function Returns 500 Error
```bash
# Check logs
supabase functions logs function-name --tail

# Common issues:
# - Secret name typo
# - Secret not deployed
# - API key expired
# - API key invalid
```

### API Key Invalid
1. Verify key in service dashboard
2. Check key hasn't expired
3. Confirm key has correct permissions
4. Test key with curl/Postman
5. Rotate key if compromised

---

## Emergency Procedures

### If Keys Are Compromised

1. **Immediate:**
   ```bash
   # Revoke compromised key in service dashboard
   # Generate new key
   # Deploy new key to Supabase
   supabase secrets set COMPROMISED_KEY=new_value
   ```

2. **Within 1 Hour:**
   - Review access logs
   - Identify unauthorized usage
   - Update documentation
   - Notify team

3. **Within 24 Hours:**
   - Rotate all related keys
   - Review security policies
   - Update incident log
   - Implement additional protections

### If Deployment Fails

1. Check Supabase CLI is logged in
2. Verify project ID is correct
3. Check network connectivity
4. Review Supabase dashboard for issues
5. Contact Supabase support if needed

---

## Cost Monitoring

### Expected Monthly Costs

| Service | Free Tier | Estimated Usage | Cost |
|---------|-----------|-----------------|------|
| Gemini | 1500 requests/day | ~500/day | $0 |
| Claude | 5M tokens/month | ~1M/month | $0 |
| OpenAI | $5 credit | Backup only | <$5 |
| Supabase | 500K invocations | ~10K/month | $0 |
| Cloudflare | 100K requests | ~50K/month | $0 |
| **Total** | - | - | **$0-10/month** |

### Set Up Alerts

1. **Supabase:**
   - Dashboard → Settings → Billing
   - Set monthly limit: $50
   - Email alerts at 50%, 80%, 100%

2. **Google Cloud (Gemini):**
   - Cloud Console → Billing → Budgets
   - Set budget: $25/month
   - Alerts at 50%, 90%, 100%

3. **OpenAI:**
   - Platform → Usage → Limits
   - Set hard limit: $25/month
   - Email alerts enabled

---

## References

**Documentation:**
- Supabase Secrets: https://supabase.com/docs/guides/functions/secrets
- Environment Variables: `.env.production` (this repo)
- API Keys Source: `/Users/ericjones/Fortress/04-ASSETS/api-mcp-credentials`

**Tools:**
- Supabase CLI: `npm install -g supabase`
- Doppler CLI: `brew install doppler`
- git-secrets: `brew install git-secrets`

---

**Status:** ✅ All 34+ API keys documented and ready for deployment  
**Security:** 🟢 Protected by .gitignore, never committed to git  
**Protocol:** PFV V16 Security Hardened

*Last Updated: December 4, 2025*
