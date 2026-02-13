# Usar a imagem oficial do Bun (versão completa para build)
FROM oven/bun:1.2.4 AS base
WORKDIR /app

# Instalar dependências (cacheable)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copiar código e gerar build
COPY . .
RUN bun --bun nuxt prepare
RUN bun run build

# Imagem final (slim para produção)
FROM oven/bun:1.2.4-slim AS release
WORKDIR /app

# Instalar utilitários necessários
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Copiar artefatos da build
COPY --from=base /app/.output ./.output
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/server/database ./server/database
COPY --from=base /app/shared ./shared
COPY --from=base /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=base /app/docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Configurações de ambiente
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_FILE_NAME=/app/data/database.sqlite

# Criar pasta de dados para o SQLite persistente
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
