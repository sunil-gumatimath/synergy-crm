# ===================================================
# Synergy Employee Management System - Dockerfile
# Multi-stage build using Bun for optimized production
# ===================================================

# Stage 1: Build Stage
FROM oven/bun:1.3.9-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables (passed from .env file at build time)
# Note: VITE_SUPABASE_ANON_KEY is a public client-side key, safe for frontend
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set environment variables for build
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build the application
RUN bun run build

# Stage 2: Production Stage
FROM nginx:alpine AS production

# Install wget for health check
RUN apk add --no-cache wget

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
