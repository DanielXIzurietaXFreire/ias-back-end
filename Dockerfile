# Builder
FROM node:20-slim AS builder
WORKDIR /app

# Install build deps
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client early
COPY prisma ./prisma/
RUN npm run prisma:generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runner
FROM node:20-slim AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package files (dependencies were installed in builder)
COPY package*.json ./

# Copy built app and prisma artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Use non-root user
USER node

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npm run migrate:deploy && npm run start:prod"]
