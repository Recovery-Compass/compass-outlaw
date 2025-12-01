# COMPASS OUTLAW

> **"Justice is no longer for sale"**

Pro Per litigation command center for asymmetric legal warfare.

---

## Quick Start

```bash
# 1. Clone & Install
git clone https://github.com/Recovery-Compass/compass-outlaw.git
cd compass-outlaw
npm install

# 2. Set API Key
echo "GEMINI_API_KEY=your-key-here" > .env.local

# 3. Run
npm run dev
```

**Access:** http://localhost:8080

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMPASS OUTLAW                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ LandingPage │───▶│  Dashboard   │───▶│ IntelligencePanel │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│                     ┌──────────────────┐                        │
│                     │ AutoLexArchitect │                        │
│                     │  • Drafting      │                        │
│                     │  • State Bar     │                        │
│                     └──────────────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│  SERVICES                                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ geminiService.ts → Gemini 2.5 Flash + Google Search       │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  DEPLOYMENT: Google Cloud Run (Port 8080)                       │
│  HEALTH: /health (nginx) | /health.json (static fallback)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google AI Studio API key |
| `NODE_ENV` | ⚡ Recommended | Set to `production` for deploys |

---

## Deployment

### Cloud Run (Automatic)

Push to `main` triggers auto-deployment via `cloudbuild.yaml`:

```bash
git push origin main
# → Cloud Build builds Docker image
# → Pushes to Container Registry
# → Deploys to Cloud Run
```

### Cloud Run (Manual)

```bash
# Build & Push
docker build -t gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest .
docker push gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest

# Deploy
gcloud run deploy compass-outlaw \
  --image gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your-key-here"
```

### Verify Deployment

```bash
# Get URL
gcloud run services describe compass-outlaw \
  --region us-central1 \
  --format="value(status.url)"

# Test health
curl https://YOUR-URL/health
# → {"status":"healthy","service":"compass-outlaw"}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Logo not showing** | Check `public/compass-outlaw-logo-bg-removed.png` exists; `invert` class applied |
| **Port mismatch** | Must be `8080` for Cloud Run |
| **API errors** | Verify `GEMINI_API_KEY` in `.env.local` or Cloud Run env vars |
| **Health check fails** | Check `/health` endpoint in nginx.conf |
| **Cloud Shell loop** | Run: `mkdir -p ~/compass-outlaw && cd ~/compass-outlaw` |

### Clean Install

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS (Zen-Industrial theme) |
| AI | Google Gemini 2.5 Flash via @google/genai |
| Markdown | react-markdown v10 |
| Icons | lucide-react |
| Container | Docker + nginx |
| Deployment | Google Cloud Run |

---

## Active Cases

| Status | Case | Number | Venue | Workflow |
|--------|------|--------|-------|----------|
| 🔴 CRITICAL | Sayegh v. Sayegh | 25PDFL01441 | LA Superior - Pasadena | glass-house-v1 |
| 🟢 ACTIVE | Judy Jones Trust | TBD-MONTEREY | Monterey Superior | standard |
| 🟡 PENDING | Elder Abuse | PENDING | Civil Division | standard |
| 🟣 FILING | State Bar v. Kolodji | BAR-327031 | State Bar of CA | standard |

---

## Glass House Package – Sayegh v. Sayegh

Specialized hearing prep workflow for Case ID 1 (Jan 6, 2026 hearing).

| Document | Purpose | Filename |
|----------|---------|----------|
| RFO | Request for immediate support | sayegh_rfo.pdf |
| Declaration | Substance narrative inversion | sayegh_declaration.pdf |
| Exhibit A-1 | Financial impeachment chart | sayegh_exhibit_a1.pdf |
| Exhibit List | Complete evidence index | sayegh_exhibit_list.pdf |

**Key Leverage Points:**
- FL-150 Golden Hammer: $22,083/mo declared → $0 paid
- P01 Smoking Gun: Third-party income confirmation
- Clean Test 10/09: Negative drug test inverts narrative

**Access:** Dashboard → Glass House Panel → Launch AutoLex

---

## Links

- **AI Studio App:** https://ai.studio/apps/drive/1wvTUBlYohG2QutgSgT0PZDLixVYgA4M0
- **State Bar Portal:** https://apps.calbar.ca.gov/attorney/Licensee/ComplaintForm
- **LA Superior Court:** https://my.lacourt.org/

---

## License

Proprietary - Recovery Compass © 2025
