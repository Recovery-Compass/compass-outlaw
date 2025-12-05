# Quick Deployment Guide - Security Fix

## 🚨 CRITICAL: Deploy This Fix Immediately

**Issue Fixed:** JWT verification was disabled on gemini-draft function  
**Risk:** Unauthorized AI credit consumption  
**Status:** ✅ Code ready, pending deployment

---

## Prerequisites

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Verify installation
supabase --version
```

---

## Deploy in 3 Steps

### Step 1: Set Secrets

```bash
# Set Gemini API key
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 2: Run Deployment Script

```bash
# Make script executable (if needed)
chmod +x deploy-secure-functions.sh

# Run deployment
./deploy-secure-functions.sh
```

**Or manually:**

```bash
# Link to project
supabase link --project-ref ftiiajmvmxthcpdwqerh

# Push database migrations
supabase db push

# Deploy function
supabase functions deploy gemini-draft
```

### Step 3: Verify Security

```bash
# Test unauthorized access (should return 401)
curl -X POST https://ftiiajmvmxthcpdwqerh.supabase.co/functions/v1/gemini-draft \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test","keyFacts":"test","desiredOutcome":"test","tone":"FORMAL"}'
```

**Expected Response:**
```json
{"error": "Missing authorization header"}
```
**Status Code:** 401 ✅

---

## What Changed

✅ **JWT Verification:** Enabled (`verify_jwt = true`)  
✅ **Rate Limiting:** 10/min, 100/hour per user  
✅ **Audit Logging:** All calls tracked in `function_usage_logs`  
✅ **Input Validation:** Required fields enforced  
✅ **CORS:** Properly configured  

---

## Files Deployed

```
supabase/
├── config.toml (JWT enabled)
├── functions/
│   ├── gemini-draft/
│   │   └── index.ts (secure version)
│   ├── _shared/
│   │   └── cors.ts
│   └── import_map.json
└── migrations/
    └── 20251204_create_usage_logs.sql
```

---

## Post-Deployment

1. **Monitor Usage:**
   ```sql
   SELECT * FROM function_usage_logs 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

2. **Check Metrics:**
   - Dashboard: https://supabase.com/dashboard/project/ftiiajmvmxthcpdwqerh
   - Functions: https://supabase.com/dashboard/project/ftiiajmvmxthcpdwqerh/functions

3. **Update Client Code:**
   - Ensure all function calls include authentication
   - See `docs/SECURITY_FIX_DEC4_2025.md` for examples

---

## Rollback (If Needed)

```bash
# Rollback database migration
supabase db reset

# Revert to previous function version
git checkout HEAD~1 supabase/
supabase functions deploy gemini-draft
```

---

## Support

**Issues?** Check logs:
```bash
supabase functions logs gemini-draft
```

**Questions?** Review:
- `docs/SECURITY_FIX_DEC4_2025.md`
- `supabase/functions/README.md`
- `SECURITY_STATUS.md`

---

**🔴 URGENT:** Deploy this fix before any public launch to prevent unauthorized API usage.

*Last Updated: December 4, 2025*
