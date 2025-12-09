# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build the application
RUN npm run build

# Production Stage (with font support for V15.2 Forensic Foundry)
FROM nginx:alpine

# === LAST MILE FIX #1: Install Microsoft Core Fonts ===
# CRITICAL: Required for pixel-perfect Times New Roman rendering
# Without this, XeLaTeX silently falls back to generic serif fonts
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    wget \
    ca-certificates && \
    mkdir -p /usr/share/fonts/truetype/msttcorefonts && \
    # Download Times New Roman family from msttcorefonts mirror
    wget -q -O /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf \
      "https://github.com/AdrienPoupa/msttcorefonts/raw/master/fonts/times.ttf" && \
    wget -q -O /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold.ttf \
      "https://github.com/AdrienPoupa/msttcorefonts/raw/master/fonts/timesbd.ttf" && \
    wget -q -O /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Italic.ttf \
      "https://github.com/AdrienPoupa/msttcorefonts/raw/master/fonts/timesi.ttf" && \
    wget -q -O /usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold_Italic.ttf \
      "https://github.com/AdrienPoupa/msttcorefonts/raw/master/fonts/timesbi.ttf" && \
    # Rebuild font cache (CRITICAL for fontspec detection)
    fc-cache -f -v && \
    # Cleanup wget (keep fontconfig for runtime)
    apk del wget

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config to handle client-side routing and port 8080 (Cloud Run default)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
