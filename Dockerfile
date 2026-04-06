# ── Stage 1: Base ──
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.6.3 --activate
WORKDIR /app

# ── Stage 2: Dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/shared/package.json          packages/core/shared/package.json
COPY packages/core/event-store/package.json     packages/core/event-store/package.json
COPY packages/core/projection-engine/package.json packages/core/projection-engine/package.json
COPY packages/core/messaging/package.json       packages/core/messaging/package.json
COPY packages/contexts/accounts/package.json    packages/contexts/accounts/package.json
COPY packages/server/api/package.json           packages/server/api/package.json
RUN pnpm install --frozen-lockfile --prod=false

# ── Stage 3: Build ──
FROM deps AS build
COPY tsconfig.base.json turbo.json ./
COPY packages/ packages/
RUN pnpm build

# ── Stage 4: Production ──
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/core/shared/node_modules          packages/core/shared/node_modules
COPY --from=deps /app/packages/core/event-store/node_modules     packages/core/event-store/node_modules
COPY --from=deps /app/packages/core/projection-engine/node_modules packages/core/projection-engine/node_modules
COPY --from=deps /app/packages/core/messaging/node_modules       packages/core/messaging/node_modules
COPY --from=deps /app/packages/contexts/accounts/node_modules    packages/contexts/accounts/node_modules
COPY --from=deps /app/packages/server/api/node_modules           packages/server/api/node_modules
COPY --from=build /app/packages/ packages/
COPY --from=build /app/tsconfig.base.json ./
COPY package.json pnpm-workspace.yaml ./

# Drizzle migrations
COPY packages/core/event-store/drizzle/     packages/core/event-store/drizzle/
COPY packages/core/projection-engine/drizzle/ packages/core/projection-engine/drizzle/
COPY packages/core/messaging/drizzle/       packages/core/messaging/drizzle/

EXPOSE 3000

USER node

CMD ["node", "--import", "@swc-node/register/esm-register", "packages/server/api/src/server.ts"]
