# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10 --force

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── Stage 2: Production runtime ──────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV APP_RELEASE="supabase-pooler-uolzadol-2026-04-27"
ENV DATABASE_URL="postgresql://postgres.uolzadolzwgiznyuzcqc:pXeCR5BQnAhvXKMY@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
ENV JWT_SECRET="51685c51d315bce06249035bb4ddaba890a6911af7c2b5afb9a24c410dd33588"

RUN npm install -g pnpm@10 --force

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

CMD ["node", "dist/index.js"]
