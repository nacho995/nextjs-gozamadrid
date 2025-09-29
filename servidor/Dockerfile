# Multi-stage Dockerfile para servidor Express

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8081
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 8081
CMD ["node", "server.js"]



