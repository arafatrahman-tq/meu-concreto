# AGENTS.md - Meu Concreto

> Este arquivo é destinado a agentes de IA. Ele descreve a arquitetura, convenções e padrões do projeto para facilitar o desenvolvimento assistido.

---

## 1. Visão Geral do Projeto

**Meu Concreto** é um ERP/CRM completo para empresas de concreto (concreteiras). O sistema gerencia todo o ciclo de negócio: desde orçamentos, vendas, entregas, até emissão de notas fiscais e controle financeiro.

### Funcionalidades Principais
- **CRM**: Cadastro de clientes, vendedores e histórico
- **Orçamentos**: Geração de orçamentos com produtos personalizados
- **Vendas e Entregas**: Controle de ordens de serviço, motoristas e caminhões
- **Frota**: Gestão de caminhões, bombas de concreto e motoristas
- **Financeiro**: Contas a pagar, recebimentos e integração com gateways de pagamento
- **Fiscal**: Emissão de NF-e e NFS-e via integrações (Bling, Asaas, Nuvem Fiscal)
- **Estoque**: Controle de insumos (cimento, areia, brita) com movimentações
- **Multi-empresa**: Suporte a múltiplas filiais com isolamento de dados

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | Nuxt 4 (Vue 3 + Nitro) |
| Runtime | Bun |
| Linguagem | TypeScript |
| Banco de Dados | SQLite (Bun SQLite) |
| ORM | Drizzle ORM |
| CSS | Tailwind CSS 4 |
| Ícones | Lucide Vue Next |
| Validação | Zod |
| PDF | jsPDF + jspdf-autotable |
| Testes | Bun Test Runner (`bun:test`) |

---

## 3. Estrutura de Diretórios

```
meu-concreto/
├── app/                      # Frontend (Nuxt app)
│   ├── assets/css/           # Estilos globais (Tailwind)
│   ├── components/           # Componentes Vue
│   │   ├── ui/              # Componentes base (BaseInput, BaseTable, etc.)
│   │   ├── form/            # Componentes de formulário (BaseDatePicker, BaseCurrency)
│   │   └── dashboard/       # Componentes do dashboard
│   ├── composables/         # Composables Vue (useAuth, useSettings, etc.)
│   ├── layouts/             # Layouts (default.vue com sidebar)
│   ├── middleware/          # Middleware de navegação (auth.global.ts)
│   ├── pages/               # Rotas baseadas em arquivos
│   ├── plugins/             # Plugins Nuxt
│   └── utils/               # Utilitários do frontend
├── server/                   # Backend (Nitro)
│   ├── api/                 # Rotas da API (file-based routing)
│   ├── database/            # Schema, migrations e conexão
│   ├── middleware/          # Middleware do servidor (auth.ts)
│   ├── services/            # Serviços de negócio
│   │   ├── fiscal/         # Provedores fiscais
│   │   └── payments/       # Provedores de pagamento
│   └── utils/               # Utilitários do backend
├── shared/                   # Código compartilhado entre frontend e backend
│   └── schemas/             # Schemas Zod compartilhados
├── tests/                    # Testes unitários (Bun)
├── public/                   # Assets estáticos
└── docker-compose.yml        # Configuração Docker
```

---

## 4. Arquitetura

### 4.1 Padrão Full-Stack Nuxt
O projeto usa o padrão **Full-Stack** do Nuxt, onde frontend e backend coexistem:
- **Frontend** (`app/`): Vue 3 Composition API, SSR opcional
- **Backend** (`server/api/`): Nitro server com rotas automáticas

### 4.2 Multi-tenancy (Isolamento por Empresa)
Todos os dados são isolados por empresa (`idEmpresa`):
- Cada registro tem um `idEmpresa` vinculado
- O middleware de auth (`server/middleware/auth.ts`) popula o contexto com o usuário e suas empresas permitidas
- O helper `requireAuth()` garante autenticação nas rotas

### 4.3 Autenticação
- Sessão baseada em cookies (`auth_session`)
- Dados assinados via HMAC (funções `signData`/`verifyData` em `server/utils/auth.ts`)
- Cookies são httpOnly, secure em produção, sameSite=strict
- Senhas hasheadas com `Bun.password.hash()` e verificadas com `Bun.password.verify()`

### 4.4 Sistema de Configurações (Feature Flags)
O sistema possui um mecanismo de configurações dinâmicas:
- Tabela `configuracoes` com chave-valor JSON
- Categorias: `FEATURE_FLAG`, `NEGOCIO`, `UI`, `GERAL`
- Escopo global ou por empresa
- Composable `useSettings()` para acesso no frontend
- Documentação detalhada em `HELP_FEATURE_FLAGS.md`

### 4.5 Schemas Compartilhados
Validação unificada entre frontend e backend via Zod:
- Local: `shared/schemas/index.ts`
- Usados em ambos os lados para garantir consistência
- Ver documentação em `shared/schemas/README.md`

---

## 5. Convenções de Código

### 5.1 Estilo e Nomenclatura
- **Idioma**: Código em português (domínio de negócio brasileiro)
- **Variáveis/Funções**: camelCase
- **Componentes Vue**: PascalCase
- **Arquivos de API**: kebab-case (ex: `index.post.ts`)
- **Tipos/Interfaces**: PascalCase, suffixo opcional (ex: `AuthUser`)

### 5.2 API Routes (Backend)
Padrão de nomenclatura para rotas da API:
```
server/api/recurso/
├── index.get.ts      # Listar todos
├── index.post.ts     # Criar
├── [id].get.ts       # Obter um
├── [id].put.ts       # Atualizar
└── [id].delete.ts    # Deletar
```

### 5.3 Banco de Dados (Drizzle ORM)
- **Schema**: `server/database/schema.ts`
- **Migrations**: `server/database/migrations/`
- **Soft Delete**: Campo `deletedAt` em todas as tabelas principais
- **Timestamps**: `createdAt` e `updatedAt` (automático via `$onUpdate`)
- **Relações**: Definidas explicitamente com `relations()` do Drizzle
- **Índices**: Índices compostos para consultas frequentes (ex: `empresaDeletedIdx`)

### 5.4 Validação (Zod)
Usar schemas compartilhados para consistência:

```typescript
// shared/schemas/index.ts
export const clienteSharedSchema = z.object({
  nome: z.string().min(3),
  cpfCnpj: cpfCnpjSchema, // Validação customizada
  email: emailSchema.optional().nullable(),
});

// Frontend
import { useValidation } from '~/composables/useValidation';
const { validate, errors } = useValidation(clienteSharedSchema);

// Backend
const result = clienteSharedSchema.safeParse(body);
if (!result.success) { ... }
```

### 5.5 Formatação de Dados

#### Valores Monetários
- **Backend**: Sempre em centavos (integer)
- **Frontend**: Exibição formatada (R$ 1.234,56)
- **Componente**: `BaseCurrency` com prop `centavos`

```typescript
// Backend - retorna sempre em centavos
return { valorTotal: 123456 }; // R$ 1.234,56

// Frontend - usando BaseCurrency
<BaseCurrency v-model="form.valor" :centavos="true" />

// Formatação manual
const { formatarCentavos } = useCurrencyFormat();
formatarCentavos(123456); // "R$ 1.234,56"
```

#### Datas
- **Backend**: Unix timestamp ou Date
- **Frontend**: ISO string
- **Componente**: `BaseDatePicker` com suporte a date/datetime/time

```vue
<BaseDatePicker 
  v-model="form.dataEntrega" 
  type="datetime-local"
  label="Data de Entrega"
/>
```

### 5.6 Logging
- Usar o utilitário `serverLog` (`server/utils/logger.ts`)
- Níveis: `info`, `warn`, `error`
- Sempre logar ações importantes (login, criação, alteração de dados)

---

## 6. Componentes de UI

### 6.1 Componentes Base Existentes
| Componente | Local | Propósito |
|------------|-------|-----------|
| `BaseInput` | `app/components/ui/` | Input de texto com ícone, máscaras |
| `BaseSelect` | `app/components/ui/` | Select dropdown |
| `BaseTable` | `app/components/ui/` | Tabela de dados |
| `BaseModal` | `app/components/ui/` | Modal/dialog |
| `BaseButton` | `app/components/ui/` | Botão padronizado |
| `BaseTooltip` | `app/components/ui/` | Tooltip |
| `BaseToast` | `app/components/ui/` | Notificações |

### 6.2 Novos Componentes de Formulário
| Componente | Local | Propósito |
|------------|-------|-----------|
| `BaseDatePicker` | `app/components/form/` | Input de data/datetime/time |
| `BaseCurrency` | `app/components/form/` | Input monetário com formatação |

### 6.3 Design System
- **Cores**: Usar variáveis CSS definidas em `main.css`
  - Primária: `text-brand`, `bg-brand` (laranja #FF7A3D)
  - Superfície: `bg-surface`, `border-border`
  - Texto: `text-primary`, `text-secondary`
- **Tipografia**: Fonte sans-serif, pesos bold/black para headings
- **Bordas**: `rounded-2xl` ou `rounded-3xl` (design moderno)
- **Sombras**: `shadow-[0_20px_60px_rgba(0,0,0,0.02)]` (subtil)

---

## 7. Composables

### 7.1 Composables Existentes
| Composable | Propósito |
|------------|-----------|
| `useAuth()` | Autenticação e dados do usuário |
| `useSettings()` | Feature flags e configurações |
| `useToast()` | Notificações/toasts |
| `useLogger()` | Logging client-side |
| `useWhatsApp()` | Envio de mensagens WhatsApp |

### 7.2 Novos Composables
| Composable | Propósito |
|------------|-----------|
| `useValidation()` | Validação Zod com feedback de erros |
| `useCpfCnpjValidation()` | Validação de documentos |
| `useCurrencyFormat()` | Formatação de moeda |
| `useInputMask()` | Máscaras de input |

---

## 8. Comandos de Build e Teste

### Desenvolvimento Local
```bash
# Instalar dependências
bun install

# Servidor de desenvolvimento
bun run dev

# Build para produção
bun run build

# Preview da build
bun run preview
```

### Banco de Dados
```bash
# Gerar migrations
bunx drizzle-kit generate

# Aplicar migrations
bunx drizzle-kit push

# Seed mínimo (cria empresa e admin)
bun server/database/seed-minimal.ts
```

### Testes
```bash
# Rodar todos os testes
bun test

# Rodar teste específico
bun test tests/validators.test.ts
```

### Docker
```bash
# Subir com Docker Compose
docker-compose up -d

# Build da imagem
docker build -t meu-concreto .
```

---

## 9. Variáveis de Ambiente

```env
# Banco de dados
DB_FILE_NAME=mydb.sqlite

# Segurança
AUTH_SECRET=supersecretkey

# Integrações (opcional, também configurável via UI)
NUVEMFISCAL_CLIENT_ID=
NUVEMFISCAL_CLIENT_SECRET=
CRON_SECRET=meu-concreto-cron-key-2026
```

---

## 10. Padrões de Desenvolvimento

### 10.1 Criando uma Nova Entidade
1. **Schema**: Adicionar tabela em `server/database/schema.ts`
2. **Migration**: Rodar `drizzle-kit generate`
3. **Schema Shared**: Adicionar em `shared/schemas/index.ts`
4. **API**: Criar rotas em `server/api/nova-entidade/`
5. **Frontend**: Criar página em `app/pages/nova-entidade/`
6. **Componente**: Criar modal/form em `app/components/NovaEntidadeModal.vue`

### 10.2 Protegendo Rotas da API
```typescript
// Em toda rota da API que precisa de auth
import { requireAuth } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const { idEmpresa } = user;
  // ... lógica da rota
});
```

### 10.3 Usando Composables no Frontend
```typescript
// Autenticação
const { user, logout, fetchUser } = useAuth();

// Configurações/Feature Flags
const { isFeatureEnabled, getSetting, fetchSettings } = useSettings();
const maintenance = computed(() => isFeatureEnabled('MAINTENANCE_MODE'));

// Toast notifications
const { add: addToast } = useToast();
addToast({ title: 'Sucesso!', description: 'Operação realizada' }, 'success');

// Validação
const { validate, errors } = useValidation(clienteSharedSchema);
const result = validate(formData);
if (!result.success) { return; }
```

### 10.4 Acesso ao Banco de Dados
```typescript
import { db } from "../database/db";
import { tabela } from "../database/schema";
import { eq, and } from "drizzle-orm";

// Query com relations
const result = await db.query.tabela.findFirst({
  where: eq(tabela.id, id),
  with: { relacionamento: true }
});
```

---

## 11. Considerações de Segurança

1. **Sessões**: Sempre usar cookies httpOnly; nunca armazenar tokens em localStorage
2. **CSRF**: Cookies configurados com `sameSite: "strict"`
3. **SQL Injection**: Drizzle ORM previne por padrão; nunca concatenar queries
4. **XSS**: Vue escapa conteúdo por padrão; validar inputs no backend
5. **Multi-tenancy**: Sempre filtrar por `idEmpresa` em queries
6. **Admin**: Usar `requireAdmin(event)` para rotas administrativas
7. **Validação**: Sempre validar inputs com Zod antes de processar

---

## 12. Integrações Externas

### Provedores Fiscais (NF-e / NFS-e)
Local: `server/services/fiscal/`
- **Bling**: Emissão via API Bling
- **Asaas**: Emissão fiscal integrada
- **Nuvem Fiscal**: Provider principal recomendado

### Provedores de Pagamento
Local: `server/services/payments/`
- **Asaas**: Boletos, PIX, cartão
- **Sicoob**: PIX com certificado
- **PIX Manual**: Geração de QR Code estático

### WhatsApp
- Integração com Evolution API ou similar
- Endpoint para cron: `GET /api/whatsapp/jobs/process-notifications`
- Ver `HELP_WHATSAPP_CRON.md` para configuração

---

## 13. Dicas para Agentes

1. **Soft Delete**: Sempre verificar `deletedAt IS NULL` em queries manuais
2. **Empresa Ativa**: Usar `event.context.user.idEmpresa` para filtros
3. **Schema**: Consultar `server/database/schema.ts` para entender entidades
4. **Validação**: Usar schemas Zod em `shared/schemas/index.ts`
5. **UI**: Usar componentes base em `app/components/ui/` para consistência
6. **Form**: Usar componentes de formulário em `app/components/form/`
7. **Ícones**: Usar Lucide (`lucide-vue-next`)
8. **Cores**: Usar variáveis CSS definidas em `main.css` (ex: `text-brand`)
9. **Testes**: Escrever testes para validações e lógicas complexas
10. **Monetário**: Backend sempre em centavos, frontend formatado

---

## 14. Troubleshooting Comum

### Erro de hidratação (hydration mismatch)
- Verificar uso de `ClientOnly` para componentes que acessam `window`
- Usar `useState` para dados compartilhados entre servidor e cliente

### Cookie não persiste
- Verificar se está em ambiente HTTPS em produção
- Confirmar que o cookie está sendo enviado com `credentials: 'include'`

### Migration falha
- Verificar se o arquivo SQLite não está corrompido
- Dropar tabela manualmente e recriar se necessário (ambiente dev)

### Validação inconsistente
- Verificar se está usando schemas de `shared/schemas/`
- Não duplicar validações entre frontend e backend

---

**Última atualização**: 2026-02-11
