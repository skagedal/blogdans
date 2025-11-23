FROM node:25.2.1-slim AS base

FROM base AS build

WORKDIR /build

# UPGRADE_POINT
RUN npm install -g pnpm@10.12.1

COPY ./package.json ./
COPY ./pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY ./eslint.config.mjs \
    ./next.config.ts \
    ./postcss.config.mjs \
    ./tsconfig.json \
    ./
COPY ./public/ ./public/
COPY ./src/ ./src/
COPY ./content/ ./content/

RUN DATABASE_PASSWORD=dummy pnpm run build

FROM base AS app

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /build/public ./public
COPY --from=build /build/.next/standalone ./
COPY --from=build /build/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]