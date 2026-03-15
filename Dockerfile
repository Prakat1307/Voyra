# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ============================================================
# Stage 2: Build the Next.js application
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments — NEXT_PUBLIC_* are inlined at build time,
# server-side vars are needed for page data collection during build
ARG NEXT_PUBLIC_URL=http://localhost:3000
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_KEY
ARG GOOGLE_API_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG QSTASH_URL
ARG QSTASH_TOKEN
ARG QSTASH_CURRENT_SIGNING_KEY
ARG QSTASH_NEXT_SIGNING_KEY
ARG UNSPLASH_ACCESS_KEY
ARG UNSPLASH_SECRET_KEY
ARG OPENWEATHER_API_KEY
ARG EXCHANGERATE_API_KEY
ARG AMADEUS_API_KEY
ARG AMADEUS_API_SECRET
ARG FOURSQUARE_API_KEY

ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL:-http://localhost:3000}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-http://localhost:8000}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-dummy}
ENV NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=${NEXT_PUBLIC_UNSPLASH_ACCESS_KEY:-dummy}
ENV NEXT_PUBLIC_GOOGLE_MAPS_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_KEY:-dummy}
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY:-dummy}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-dummy}
ENV QSTASH_URL=${QSTASH_URL:-https://dummy}
ENV QSTASH_TOKEN=${QSTASH_TOKEN:-dummy}
ENV QSTASH_CURRENT_SIGNING_KEY=${QSTASH_CURRENT_SIGNING_KEY:-dummy}
ENV QSTASH_NEXT_SIGNING_KEY=${QSTASH_NEXT_SIGNING_KEY:-dummy}
ENV UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY:-dummy}
ENV UNSPLASH_SECRET_KEY=${UNSPLASH_SECRET_KEY:-dummy}
ENV OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY:-dummy}
ENV EXCHANGERATE_API_KEY=${EXCHANGERATE_API_KEY:-dummy}
ENV AMADEUS_API_KEY=${AMADEUS_API_KEY:-dummy}
ENV AMADEUS_API_SECRET=${AMADEUS_API_SECRET:-dummy}
ENV FOURSQUARE_API_KEY=${FOURSQUARE_API_KEY:-dummy}

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 3: Production runner
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
