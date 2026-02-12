# 🚀 Guia de Deploy - Meu Concreto OS

## Deploy no Coolify (Recomendado)

O Coolify é a forma mais simples de fazer deploy desta aplicação. Ele gerencia automaticamente builds, SSL, variáveis de ambiente e muito mais.

### Passo a Passo

1. **Adicione o repositório no Coolify**
   - Acesse seu painel Coolify
   - Clique em "New Resource" → "Application"
   - Selecione seu repositório Git

2. **Configuração de Build**
   - **Build Pack**: `Docker Compose`
   - O Coolify detectará automaticamente o `docker-compose.yml`

3. **⚠️ Configuração Importante - NODE_ENV**
   
   O Coolify pode mostrar um warning sobre `NODE_ENV=production`. **Ignore este warning** ou configure:
   - Vá em "Environment Variables" 
   - Encontre `NODE_ENV`
   - **Desmarque** a opção "Available at Buildtime" (deixe apenas "Available at Runtime")
   
   Isso é necessário porque usamos multi-stage build no Dockerfile.

4. **Variáveis de Ambiente (IMPORTANTE!)

   Configure estas variáveis no painel do Coolify:

   | Variável | Obrigatória | Descrição |
   |----------|-------------|-----------|
   | `AUTH_SECRET` | ✅ Sim | Chave para criptografia de sessões (mínimo 32 caracteres) |
   | `NUVEMFISCAL_CLIENT_ID` | ❌ Não | Client ID da Nuvem Fiscal |
   | `NUVEMFISCAL_CLIENT_SECRET` | ❌ Não | Client Secret da Nuvem Fiscal |
   | `ASAAS_API_KEY` | ❌ Não | API Key do Asaas |
   | `BLING_API_KEY` | ❌ Não | API Key do Bling |
   | `WHATSAPP_API_KEY` | ❌ Não | API Key do serviço WhatsApp |

   **⚠️ Gerando AUTH_SECRET:**
   ```bash
   # No seu terminal local:
   openssl rand -base64 32
   ```
   
   Ou use o gerador automático na primeira execução (veja no log a chave gerada e salve-a!).

4. **Porta e Domínio**
   - A aplicação expõe a porta `3000` automaticamente
   - Configure seu domínio no Coolify para apontar para o serviço
   - O Coolify gerencia o SSL automaticamente

5. **Deploy**
   - Clique em "Deploy"
   - Acompanhe os logs no painel
   - O banco de dados será inicializado automaticamente na primeira execução

6. **Acesso Inicial**
   - URL: `https://seudominio.com`
   - Usuário: `admin`
   - Senha: `admin123`
   
   **⚠️ ALTERE A SENHA DO ADMIN IMEDIATAMENTE APÓS O PRIMEIRO LOGIN!**

---

## Deploy Manual com Docker

### Requisitos

- Docker 20.10+ 
- Docker Compose 2.0+
- 2GB RAM mínimo (recomendado 4GB)
- 10GB espaço em disco

### Configuração

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd meu-concreto
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   nano .env
   ```

3. **Deploy**
   ```bash
   sudo docker-compose up -d
   ```

4. **Verificar logs**
   ```bash
   sudo docker-compose logs -f
   ```

---

## Comandos Úteis

```bash
# Ver logs em tempo real
sudo docker-compose logs -f meu-concreto

# Reiniciar serviço
sudo docker-compose restart meu-concreto

# Parar tudo
sudo docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
sudo docker-compose down -v

# Backup do banco de dados
sudo docker exec meu-concreto cat /app/data/database.sqlite > backup-$(date +%Y%m%d).sqlite

# Atualizar para nova versão
sudo docker-compose pull
sudo docker-compose up -d
```

---

## Troubleshooting

### Healthcheck falhando

```bash
# Verificar se o container está rodando
sudo docker ps

# Ver logs detalhados
sudo docker-compose logs meu-concreto
```

### Banco de dados corrompido

```bash
# Parar serviços
sudo docker-compose down

# Restaurar backup
sudo cp backup-YYYYMMDD.sqlite data/database.sqlite

# Reiniciar
sudo docker-compose up -d
```

### AUTH_SECRET não definido

Se você ver no log:
```
⚠️  AUTH_SECRET não definido. Gerando...
```

Copie a chave gerada (aparece no log) e configure nas variáveis de ambiente do Coolify para persistir entre reinicializações.

---

## Segurança Checklist

- ✅ Container roda com usuário não-root
- ✅ Healthcheck configurado
- ✅ Logs rotacionados automaticamente
- ✅ Limites de recursos definidos
- ✅ Banco de dados em volume persistente
- ⚠️ **Sempre use HTTPS em produção!**
- ⚠️ **Altere a senha padrão do admin!**
- ⚠️ **Guarde o AUTH_SECRET em local seguro!**
