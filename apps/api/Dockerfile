# =========================================================================
# AI Gurukul Core API Service - Production Multi-Stage Dockerfile
# =========================================================================

# Stage 1: Base Environment
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Stage 2: Dependencies & Build
FROM base AS builder
WORKDIR /app

# Copy root configurations and manifests
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all workspace dependencies cleanly
RUN npm ci

# Compile TypeScript packages and API service
RUN npm run build --workspace=@ai-gurukul/config \
    --workspace=@ai-gurukul/types \
    --workspace=@ai-gurukul/logging \
    --workspace=@ai-gurukul/validation \
    --workspace=@ai-gurukul/database \
    --workspace=@ai-gurukul/storage \
    --workspace=@ai-gurukul/embeddings \
    --workspace=@ai-gurukul/vector-store \
    --workspace=@ai-gurukul/ai \
    --workspace=@ai-gurukul/api

# Stage 3: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Hardened security: run as non-root standard node user
USER node

# Copy compiled files, packages, and node_modules
COPY --chown=node:node --from=builder /app/package.json /app/package-lock.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/apps/api ./apps/api

EXPOSE 5000

# Automated container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health/live || exit 1

# Launch production server
CMD ["node", "apps/api/dist/server.js"]
