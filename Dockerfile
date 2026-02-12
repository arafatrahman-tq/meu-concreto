# Usar a imagem oficial do Bun com versão específica para reprodutibilidade
FROM oven/bun:1.2.4 AS base
WORKDIR /app

# Instalar dependências
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Build da aplicação
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Imagem de produção
FROM base AS release

# Instalar curl para healthcheck e openssl para geração de secrets
RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server/database ./server/database
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/node_modules ./node_modules

# Copiar e configurar entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Criar diretório para o banco de dados e ajustar permissões
RUN mkdir -p /app/data && chown -R appuser:appgroup /app

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_FILE_NAME=/app/data/database.sqlite

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Usar entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
