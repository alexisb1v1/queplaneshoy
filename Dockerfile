# -------------------------
# 1) Dependencies
# -------------------------
FROM node:20.18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# -------------------------
# 2) Build
# -------------------------
FROM node:20.18-alpine AS builder
WORKDIR /app

# Inyección de variables públicas en tiempo de build
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# -------------------------
# 3) Runner
# -------------------------
FROM node:20.18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]
