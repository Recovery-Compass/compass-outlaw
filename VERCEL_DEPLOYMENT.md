# Vercel Deployment Guide - Compass Outlaw

## Optimizations Implemented

### 1. Core Configuration (`vercel.json`)
- **Framework Detection**: Explicit Vite framework configuration
- **Build Command**: Optimized `npm run build` with proper output directory
- **Environment Variables**: Secure env var references using Vercel secrets
- **Caching Strategy**: Aggressive caching for static assets (1 year immutable)
- **Security Headers**: XSS protection, frame options, content type protection
- **SPA Routing**: Proper rewrites for React Router/client-side routing
- **Regional Deployment**: Configured for `iad1` (US East) - adjust as needed

### 2. Build Optimizations (`vite.config.ts`)
- **Code Splitting**: Manual chunks for React, Google GenAI, and markdown vendors
- **Minification**: ESBuild minification enabled
- **Source Maps**: Disabled in production for smaller bundle size
- **CSS Minification**: Enabled
- **Chunk Size Warning**: Increased limit to 1000kb

### 3. Package Configuration (`package.json`)
- **Node Version**: Enforced v20+ for optimal performance
- **Vercel Build Script**: Added `vercel-build` command
- **Engine Requirements**: Explicit Node and npm version requirements

### 4. Ignore Configuration (`.vercelignore`)
- Excludes unnecessary files from deployment
- Reduces upload time and deployment size
- Excludes documentation, build artifacts, and development tools

## Environment Variables Setup

Set these in your Vercel project settings:

```bash
# Method 1: Via Vercel CLI
vercel env add VITE_SUPABASE_PROJECT_ID production
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
vercel env add VITE_SUPABASE_URL production

# Method 2: Via Vercel Dashboard
# Go to: Project Settings > Environment Variables
# Add each variable for Production, Preview, and Development environments
```

### Required Variables
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable API key
- `VITE_SUPABASE_URL`: Your Supabase project URL

## Deployment Commands

```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview (development)
vercel

# Deploy to production
vercel --prod

# Link existing project
vercel link
```

## Performance Features

### Caching Strategy
- **Static Assets**: 1 year cache with immutable flag
- **HTML**: No cache (always fresh)
- **Build Optimization**: Code splitting reduces initial load

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Build Performance
- **Parallel Processing**: Vite's fast HMR and build times
- **Incremental Builds**: Only rebuilds changed files
- **Tree Shaking**: Dead code elimination enabled

## Custom Domain Setup

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Vercel automatically provisions SSL certificate

## Monitoring & Analytics

Access deployment metrics at:
- Dashboard: https://vercel.com/dashboard
- Analytics: Project > Analytics tab
- Logs: Project > Deployments > [specific deployment] > Logs

## Troubleshooting

### Build Failures
```bash
# Check build locally first
npm run build

# Test preview locally
npm run preview
```

### Environment Variables Not Loading
- Ensure variables are prefixed with `VITE_`
- Verify variables are set for correct environment (production/preview)
- Redeploy after adding/changing env vars

### 404 on Routes
- Verify `vercel.json` rewrites configuration
- Check that `dist/index.html` exists after build
- Ensure SPA routing is properly configured

### Large Bundle Size
- Review chunk splitting in `vite.config.ts`
- Analyze bundle with `npm run build -- --sourcemap`
- Consider lazy loading heavy components

## Current Deployment Info

**Repository**: Recovery-Compass/compass-outlaw
**Current Domains**:
- compass-outlaw-lac.vercel.app
- compass-outlaw-git-main-ej-rcs-projects.vercel.app
- compass-outlaw-9g4sicfdm-ej-rcs-projects.vercel.app

**Latest Deployment**: 
- Commit: 3037073 - "Align logo left on auth"
- Status: Ready (Production)
- Duration: 17s
- Deployed: 18 days ago

## Next Steps

1. ✅ Commit configuration files
2. ✅ Push to GitHub repository
3. ⏳ Set environment variables in Vercel Dashboard
4. ⏳ Trigger new deployment
5. ⏳ Verify production deployment
6. ⏳ Test all routes and functionality
7. ⏳ Monitor performance metrics

## Contact & Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- Project Issues: https://github.com/Recovery-Compass/compass-outlaw/issues
