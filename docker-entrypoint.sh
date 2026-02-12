#!/bin/sh
set -e

echo "🔧 Inicializando Meu Concreto OS..."

# Gerar AUTH_SECRET automaticamente se não estiver definido
if [ -z "$AUTH_SECRET" ]; then
    echo "⚠️  AUTH_SECRET não definido. Gerando..."
    export AUTH_SECRET=$(openssl rand -base64 32 | tr -d '=+/')
    echo "✅ AUTH_SECRET gerado: ${AUTH_SECRET:0:10}..."
    echo "   💡 Salve esta chave nas variáveis de ambiente!"
fi

# Inicializar banco de dados se necessário
echo "🗄️  Verificando banco de dados..."
if [ ! -f "$DB_FILE_NAME" ]; then
    echo "📦 Banco não encontrado. Criando..."
    bunx drizzle-kit push
    bun server/database/seed-minimal.ts
else
    echo "📝 Banco existente. Aplicando migrations..."
    bunx drizzle-kit push
fi

echo "🚀 Iniciando aplicação..."
exec bun .output/server/index.mjs
