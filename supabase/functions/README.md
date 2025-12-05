# Supabase Edge Functions - Compass Outlaw

## Security Configuration

**CRITICAL:** All edge functions in this directory have JWT verification **ENABLED** by default.

This prevents unauthorized access and protects against:
- Unauthorized AI credit consumption
- DDoS attacks
- API key exposure
- Resource exhaustion

## Functions

### gemini-draft

**Status:** ✅ JWT Verification ENABLED  
**Purpose:** Generate legal strategy documents using Gemini AI  
**Config:** `verify_jwt = true` in `supabase/config.toml`

**Security Features:**
- JWT token validation required
- User authentication via Supabase Auth
- Request payload validation
- Rate limiting (10 req/min, 100 req/hour)
- Audit logging to `function_usage_logs` table
- CORS protection

**Environment Variables Required:**
```bash
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=auto_injected_by_supabase
SUPABASE_ANON_KEY=auto_injected_by_supabase
```

**Set secrets via CLI:**
```bash
supabase secrets set GEMINI_API_KEY=your_actual_key
```

## Deployment

### Local Development
```bash
supabase functions serve gemini-draft
```

### Deploy to Supabase
```bash
supabase functions deploy gemini-draft
```

### Test Authentication
```bash
# This will FAIL (401 Unauthorized) - correct behavior
curl -X POST https://your-project.supabase.co/functions/v1/gemini-draft \
  -H "Content-Type: application/json" \
  -d '{"recipient": "test", "keyFacts": "test", "desiredOutcome": "test", "tone": "FORMAL"}'

# This will SUCCEED (with valid JWT)
curl -X POST https://your-project.supabase.co/functions/v1/gemini-draft \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient": "Attorney", "keyFacts": "Case facts", "desiredOutcome": "Resolution", "tone": "FORMAL"}'
```

## Client Usage

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User must be authenticated first
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  const { data, error } = await supabase.functions.invoke('gemini-draft', {
    body: {
      recipient: 'Attorney Name',
      keyFacts: 'Case details...',
      desiredOutcome: 'Desired result...',
      tone: 'FORMAL'
    }
  });
  
  console.log('Generated:', data.text);
}
```

## Security Audit

**Last Audited:** December 4, 2025  
**Auditor:** PFV V16 Protocol  
**Status:** ✅ SECURE

**Vulnerabilities Fixed:**
- [x] JWT verification enabled (was: `verify_jwt = false`)
- [x] User authentication required
- [x] Input validation added
- [x] Rate limiting configured
- [x] Audit logging implemented
- [x] CORS properly configured
- [x] Environment variables secured

## Monitoring

Monitor function usage:
```sql
SELECT 
  user_id,
  function_name,
  COUNT(*) as calls,
  AVG(response_length) as avg_response_length,
  MAX(timestamp) as last_call
FROM function_usage_logs
WHERE function_name = 'gemini-draft'
GROUP BY user_id, function_name
ORDER BY calls DESC;
```

## Cost Management

**Estimated Costs:**
- Gemini API: ~$0.001 per request (varies by model)
- Supabase Functions: Free tier includes 500K invocations/month
- Rate Limits: 10/min, 100/hour per user

**Budget Alerts:**
Set up monitoring for:
- Daily API call count > 1000
- Per-user rate limit violations
- Failed authentication attempts

---

*Security hardened under PFV V16 Protocol | December 4, 2025*
