FROM node:25.4-slim

WORKDIR /app

# openssl + dumb-init for the runtime; autossh + openssh-client to tunnel to the entrepôt
# database through MIN's bastion (see entrypoint.sh). Cleaned up to keep the image small.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl dumb-init autossh openssh-client \
 && rm -rf /var/lib/apt/lists/*

ENV PORT 8080
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV HOSTNAME "0.0.0.0"

# Copy Build
# Build directory as same structure than monorepo
COPY apps/web/.next/standalone .

# Copy public assets
COPY apps/web/public ./apps/web/public

# Copy static server files not imported by bundler (csv, json, etc...)
COPY apps/web/private-static ./apps/web/private-static

# Copy static built assets (js and css)
COPY apps/web/.next/static ./apps/web/.next/static

EXPOSE $PORT

# Entrypoint opens the entrepôt SSH tunnel (when configured) before exec-ing the CMD below.
COPY docker/web/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["dumb-init", "--", "/app/entrypoint.sh"]

CMD ["node", "./apps/web/server.js"]
