# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build the application
RUN npm run build

# Production Stage
FROM nginx:alpine

# Install DejaVu fonts (reliable fallback, available in Alpine repos)
RUN apk add --no-cache fontconfig ttf-dejavu && fc-cache -f

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config to handle client-side routing and port 8080 (Cloud Run default)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
