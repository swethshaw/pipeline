# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
# 🔧 FIXED: Removed 'frontend/' because files are in the root folder
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# (Optional) Keeping your manual ajv install if it solves a specific dependency conflict
RUN npm install ajv@^8.12.0 ajv-keywords@^5.1.0

COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]