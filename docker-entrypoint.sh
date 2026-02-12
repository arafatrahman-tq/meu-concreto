#!/bin/sh
set -e

# ==========================================
# ENTRYPOINT - MEU CONCRETO OS
# ==========================================

# Gerar AUTH_SECRET automaticamente se não estiver definido
if [ -z "$AUTH_SECRET" ]; then
    echo "⚠️  AUTH_SECRET não definido. Gerando automaticamente..."
    # Usar /dev/urandom para gerar uma string base64 de 32 bytes
    export AUTH_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '=+/')
    echo "✅ AUTH_SECRET gerado com sucesso!"
    echo "   Salve esta chave para futuras implantações:"
    echo "   $AUTH_SECRET"
fi

# Verificar se estamos no modo db-init
if [ "$1" = "db-init" ]; then
    echo "🗄️  Inicializando banco de dados..."
    
    # Aguardar um pouco para garantir que o volume está montado
    sleep 2
    
    if [ ! -f "$DB_FILE_NAME" ]; then
        echo "📦 Banco de dados não encontrado. Criando..."
        bunx drizzle-kit push
        echo "🌱 Executando seed inicial..."
        bun server/database/seed-minimal.ts
        echo "✅ Banco de dados inicializado com sucesso!"
    else
        echo "📝 Banco de dados existente encontrado. Executando migrations..."
        bunx drizzle-kit push
        echo "✅ Migrations aplicadas!"
    fi
    
    exit 0
fi

# Modo aplicação (padrão)
echo "🚀 Iniciando Meu Concreto OS..."
echo "   Environment: $NODE_ENV"
echo "   Database: $DB_FILE_NAME"
echo "   Port: $PORT"

# Executar o comando passado (ou o padrão)
exec "$@"
