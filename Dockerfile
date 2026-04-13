###############
# Build stage #
###############
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json pnpm-lock.yaml .npmrc ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN pnpm build

# Prune devDependencies
RUN pnpm prune --prod

#################
# Runtime stage #
#################
FROM node:22-alpine AS runtime

RUN apk add --no-cache dumb-init

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy production dependencies and build output
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/package.json ./

USER appuser

EXPOSE 8080

ENV NODE_ENV=production

# dumb-init handles PID 1 signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
