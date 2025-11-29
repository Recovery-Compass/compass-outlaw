<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wvTUBlYohG2QutgSgT0PZDLixVYgA4M0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Troubleshooting

### Cloud Shell Loop Issue (Directory Mismatch)

If you're experiencing a loop in Google Cloud Shell with errors like `cd command failed...` or the CLI cannot find the project directory, use this **Rescue Protocol**:

```bash
# 1. Create the expected project directory
mkdir -p ~/compass-outlaw

# 2. Clone the repo into it (if not already cloned)
cd ~/compass-outlaw
git clone https://github.com/Recovery-Compass/compass-outlaw.git . 2>/dev/null || git pull origin main

# 3. Verify you're in the correct directory
pwd  # Should output: /home/[username]/compass-outlaw

# 4. Install dependencies and run
npm install
npm run dev
```

### Port Configuration (Cloud Run)

This project is configured to run on **port 8080** to align with Google Cloud Run's default expectation. If deploying elsewhere, update `vite.config.ts`:

```typescript
server: {
  host: "::",
  port: 8080,  // Change this for different environments
}
```

### Logo Not Displaying

If the Cowboy Outlaw logo doesn't appear:
1. Verify `public/compass-outlaw-logo-bg-removed.png` exists
2. The `invert` CSS class is applied (converts black logo to white on dark backgrounds)
3. SVG fallback automatically activates if PNG fails to load

### Build Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Development build
npm run dev

# Production build
npm run build
```

---

## Deploy to Google Cloud Run

### Prerequisites

- Google Cloud CLI (`gcloud`) installed and authenticated
- Docker installed (for local builds)
- A Google Cloud project with billing enabled

### Environment Variables

Set environment variables in Cloud Run via the Console or CLI:

#### Via Google Cloud Console:
1. Navigate to **Cloud Run** → Select your service (`compass-outlaw`)
2. Click **Edit & Deploy New Revision**
3. Expand **Variables & Secrets**
4. Add your environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google AI Studio API key | Yes |
| `NODE_ENV` | Set to `production` | Recommended |

#### Via gcloud CLI:

```bash
# Set environment variables during deployment
gcloud run deploy compass-outlaw \
  --image gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your-api-key-here,NODE_ENV=production"
```

### Manual Deployment

```bash
# 1. Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest

# 3. Deploy to Cloud Run
gcloud run deploy compass-outlaw \
  --image gcr.io/YOUR_PROJECT_ID/compass-outlaw:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### Automatic Deployment (Cloud Build)

This repo includes `cloudbuild.yaml` for automatic deployments. Push to `main` branch to trigger:

```bash
git add .
git commit -m "Deploy to Cloud Run"
git push origin main
```

Cloud Build will automatically:
1. Build the Docker image
2. Push to Container Registry
3. Deploy to Cloud Run

### Verify Deployment

```bash
# Get your service URL
gcloud run services describe compass-outlaw --region us-central1 --format="value(status.url)"

# Test the endpoint
curl $(gcloud run services describe compass-outlaw --region us-central1 --format="value(status.url)")
```
