FROM debian:stable-slim

RUN apt-get update \
  && apt-get install -y \
  curl \
  gnupg \
  libatomic1 \
  ca-certificates \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV MISE_DATA_DIR=/mise
ENV MISE_CONFIG_DIR=/mise
ENV MISE_CACHE_DIR=/mise/cache
ENV MISE_INSTALL_PATH=/usr/local/bin/mise
ENV PATH=/mise/shims:$PATH

RUN curl https://mise.run | sh

WORKDIR /app
COPY mise.toml package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN mise trust mise.toml && mise install
RUN pnpm install --frozen-lockfile

COPY prisma/ ./prisma/
COPY src/ ./src/
COPY tsconfig.json .
RUN pnpm exec prisma generate --schema=prisma/schema.prisma
RUN pnpm run build

ENV PORT=8888
EXPOSE 8888

ENV DATABASE_URL=file:/data/meal-log.db
VOLUME /data

COPY dockerStart.sh .

ENTRYPOINT ["./dockerStart.sh"]
