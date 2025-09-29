# Multi-stage Dockerfile para Next.js (output standalone)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias (con cache eficiente)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Construir la app
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Ejecutar la app standalone
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# No utilizar root en producción
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copiar los artefactos standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]



