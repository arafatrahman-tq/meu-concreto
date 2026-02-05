# Usar a imagem oficial do Bun
FROM oven/bun:latest as base
WORKDIR /app

# Instalar dependências
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Build da aplicação
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
# Nuxt 4 build
RUN bun run build

# Imagem de produção
FROM base AS release
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

# Incluindo arquivos necessários para o seed minimal e push do schema
COPY --from=build /app/server/database ./server/database
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/node_modules ./node_modules

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_FILE_NAME=/app/data/database.sqlite

# Criar diretório para o banco de dados
RUN mkdir -p /app/data

EXPOSE 3000

# Comando para iniciar o servidor Nuxt (output do nitro)
CMD ["bun", ".output/server/index.mjs"]
