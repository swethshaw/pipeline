# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Reach into the frontend folder to get package files
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --legacy-peer-deps

# Reach into the frontend folder to get the source code
COPY frontend/ .
RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Grab nginx.conf from the ROOT directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]