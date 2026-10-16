# =========================================================================
# AI Gurukul Web Client (Next.js) - Production Multi-Stage Dockerfile
# =========================================================================

# Stage 1: Base Environment
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Stage 2: Dependencies & Production Build
FROM base AS builder
WORKDIR /app

# Copy root configurations and manifests
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Clean install
RUN npm ci

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile dependent types, validation, and Next.js web application
RUN npm run build --workspace=@ai-gurukul/types \
    --workspace=@ai-gurukul/validation \
    --workspace=@ai-gurukul/web

# Stage 3: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Hardened security: run as non-root standard node user
USER node

# Copy compiled files, packages, and node_modules
COPY --chown=node:node --from=builder /app/package.json /app/package-lock.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/apps/web ./apps/web

EXPOSE 3000

# Automated container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Launch Next.js production server
CMD ["npm", "run", "start", "--workspace=@ai-gurukul/web"]
