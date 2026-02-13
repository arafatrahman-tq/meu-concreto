#!/bin/sh
set -e

echo "🚀 Iniciando Meu Concreto OS..."

# Garantir que a pasta de dados existe
mkdir -p $(dirname "$DB_FILE_NAME")

# Gerar AUTH_SECRET se necessário
if [ -z "$AUTH_SECRET" ]; then
    echo "🔑 Gerando AUTH_SECRET temporário..."
    export AUTH_SECRET=$(openssl rand -base64 32)
fi

# Verificar se o banco já existe
BANCO_EXISTE=0
if [ -f "$DB_FILE_NAME" ]; then
    BANCO_EXISTE=1
    echo "📂 Banco de dados detectado em $DB_FILE_NAME"
else
    echo "📂 Banco de dados não encontrado, será criado em $DB_FILE_NAME"
fi

# Inicializar/Atualizar Banco de Dados
echo "🗄️  Sincronizando schema com o banco..."
# Usamos bun diretamente para garantir que as dependências do node_modules sejam encontradas
bun x drizzle-kit push || {
    echo "❌ Erro crítico ao sincronizar schema!"
    # Em produção, talvez queiramos parar se o schema não sincronizar
    # Mas por enquanto vamos apenas avisar
    echo "⚠️  Tentando continuar mesmo com erro no push..."
}

# Seed inicial apenas se o banco era novo
if [ "$BANCO_EXISTE" -eq 0 ]; then
    echo "🌱 Executando seed inicial..."
    bun server/database/seed-minimal.ts || echo "⚠️  Falha no seed, continuando..."
fi

echo "✅ Sistema pronto! Iniciando servidor Nuxt..."
exec bun .output/server/index.mjs
