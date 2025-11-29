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
