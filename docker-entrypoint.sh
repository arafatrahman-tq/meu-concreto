#!/bin/sh
set -e

echo "🚀 Iniciando Meu Concreto OS..."

# Gerar AUTH_SECRET se necessário
if [ -z "$AUTH_SECRET" ]; then
    echo "🔑 Gerando AUTH_SECRET temporário..."
    export AUTH_SECRET=$(openssl rand -base64 32)
fi

# Verificar se o banco já existe antes de rodar o push
BANCO_EXISTE=0
if [ -f "$DB_FILE_NAME" ]; then
    BANCO_EXISTE=1
fi

# Inicializar/Atualizar Banco de Dados
echo "🗄️  Configurando banco de dados em $DB_FILE_NAME..."
bunx drizzle-kit push || echo "⚠️  Aviso: Falha ao sincronizar schema, continuando..."

# Seed inicial apenas se o banco era novo
if [ "$BANCO_EXISTE" -eq 0 ]; then
    echo "🌱 Executando seed inicial..."
    bun server/database/seed-minimal.ts || echo "⚠️  Falha no seed, continuando..."
fi

echo "✅ Pronto! Iniciando servidor..."
exec bun .output/server/index.mjs
