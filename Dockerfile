# ============================================
# Stage 1: Frontend Build
# ============================================
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files first for better caching
COPY frontend/package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# ============================================
# Stage 2: Backend Production Image
# ============================================
FROM node:24-alpine AS production

# Add labels for the image
LABEL org.opencontainers.image.title="Change-Number-System"
LABEL org.opencontainers.image.description="Auto number system with SQLite backend"
LABEL org.opencontainers.image.source="https://github.com/ider-zh/Change-Number-System"

# Set working directory
WORKDIR /app

# Install necessary system packages for better-sqlite3
RUN apk add --no-cache python3 make g++

# Create a non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source code
COPY backend/ ./

# Copy frontend build output from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./public

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Switch to non-root user
USER appuser

# Start the application
CMD ["node", "server.js"]
