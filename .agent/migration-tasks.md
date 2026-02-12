# Plano de Migração - Prioridades Alta e Média

> Gerado em: 2026-02-11
> Objetivo: Migrar código existente para novos padrões de consistência

---

## 📊 Resumo por Módulo

| Módulo | Arquivos | Prioridade | Tempo Estimado |
|--------|----------|------------|----------------|
| Clientes | 3 | Alta | 2h |
| Orçamentos | 4 | Alta | 3h |
| Produtos | 2 | Alta | 1.5h |
| Vendas | 2 | Alta | 2h |
| Motoristas | 2 | Alta | 1.5h |
| Caminhões | 2 | Alta | 1.5h |
| Bombas | 2 | Alta | 1.5h |
| Insumos | 2 | Alta | 1.5h |
| Financeiro | 4 | Alta | 3h |
| APIs Backend | 14 | Média | 4h |
| Nomenclatura | 4 | Média | 2h |

**Total Estimado: ~24 horas de trabalho**

---

## 🔴 PRIORIDADE ALTA

### 1. Módulo: Clientes

#### Tarefa 1.1: Atualizar Página de Clientes
**Arquivo:** `app/pages/clientes/index.vue`

**Checklist:**
- [x] Substituir validação inline por `useValidation(clienteSharedSchema)`
- [x] Substituir máscaras manuais por `useInputMask`
  ```typescript
  const { cpfCnpj, telefone, cep } = useInputMask();
  ```
- [x] Atualizar função `saveCliente` para usar `validate()`
- [x] Mapear erros do schema para os campos do formulário
- [x] Testar validação de CPF/CNPJ em tempo real

**Código de Referência:**
```typescript
const form = reactive<ClienteShared>({
  nome: '',
  cpfCnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  // ...
});

const { validate, errors, validateField, clearError } = useValidation(clienteSharedSchema);

const onCpfCnpjInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  input.value = cpfCnpj(input.value);
  form.cpfCnpj = input.value;
};
```

---

#### Tarefa 1.2: Atualizar API POST /clientes
**Arquivo:** `server/api/clientes/index.post.ts`

**Checklist:**
- [x] Importar `clienteSharedSchema` de `~/shared/schemas`
- [x] Substituir validação manual por `clienteSharedSchema.safeParse()`
- [x] Retornar erros formatados do Zod (400 Bad Request)
- [x] Remover código de validação duplicado
- [x] Testar com dados válidos e inválidos

**Template de Código:**
```typescript
import { clienteSharedSchema } from '~/shared/schemas';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);
  
  const result = clienteSharedSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }
  
  const data = result.data;
  // ... resto do código
});
```

---

#### Tarefa 1.3: Atualizar API PUT /clientes/[id]
**Arquivo:** `server/api/clientes/[id].put.ts`

**Checklist:**
- [x] Aplicar mesmo padrão da tarefa 1.2
- [x] Usar `clienteSharedSchema.partial()` para atualizações parciais
- [x] Garantir que `idEmpresa` não seja alterado

---

### 2. Módulo: Orçamentos

#### Tarefa 2.1: Atualizar Página de Orçamentos - Parte 1 (Datas)
**Arquivo:** `app/pages/orcamentos/index.vue`

**Checklist:**
- [x] Substituir `<BaseInput type="date">` por `<BaseDatePicker`>
  - Campo: `validadeOrcamento`
  - Campo: `dataEntrega`
- [x] Substituir inputs de valor por `<BaseCurrency>`
  - Campo: `valorUnit` (itens)
  - Campo: `valorBomba`
  - Campo: `valorDesconto`
  - Campo: `total`
- [x] Verificar conversão de centavos para exibição

**Código de Referência:**
```vue
<BaseDatePicker
  v-model="form.validadeOrcamento"
  type="date"
  label="Validade da Cotação"
  :icon="Calendar"
/>

<BaseCurrency
  v-model="form.valorDesconto"
  :centavos="true"
  label="Desconto R$"
  @input="calculateTotal"
/>
```

---

#### Tarefa 2.2: Atualizar Página de Orçamentos - Parte 2 (Validação)
**Arquivo:** `app/pages/orcamentos/index.vue`

**Checklist:**
- [x] Implementar `useValidation(orcamentoSharedSchema)`
- [x] Criar função `validateForm()` que valida schema + regras de negócio
- [x] Mapear erros para campos específicos (`errors.nomeCliente`, etc.)
- [x] Validar itens do orçamento (array)
- [x] Mostrar erros nos inputs correspondentes

**Validações Especiais:**
- Pelo menos 1 item no orçamento
- Valor total > 0
- Vendedor selecionado
- Forma de pagamento selecionada

---

#### Tarefa 2.3: Atualizar API POST /orcamentos
**Arquivo:** `server/api/orcamentos/index.post.ts`

**Checklist:**
- [x] Importar `orcamentoSharedSchema`
- [x] Validar body com schema
- [x] Calcular total dos itens server-side (segurança)
- [x] Verificar consistência de valores (soma dos itens = total)
- [x] Remover validações manuais duplicadas

---

#### Tarefa 2.4: Atualizar API PUT /orcamentos/[id]
**Arquivo:** `server/api/orcamentos/[id].put.ts`

**Checklist:**
- [x] Aplicar mesmo padrão da tarefa 2.3
- [x] Verificar permissões antes de permitir edição
- [x] Validar transição de status (PENDENTE → APROVADO)

---

### 3. Módulo: Produtos

#### Tarefa 3.1: Atualizar Página de Produtos
**Arquivo:** `app/pages/produtos/index.vue`

**Checklist:**
- [x] Substituir inputs de valor por `<BaseCurrency>`
  - Campo: `valorCusto`
  - Campo: `valorVenda`
- [x] Implementar `useValidation(produtoSharedSchema)`
- [x] Validar FCK e slump (valores permitidos)

---

#### Tarefa 3.2: Atualizar APIs de Produtos
**Arquivos:** 
- `server/api/produtos/index.post.ts`
- `server/api/produtos/[id].put.ts`

**Checklist:**
- [x] Aplicar `produtoSharedSchema` em ambas as APIs
- [x] Validar valores monetários em centavos
- [x] Garantir que NCM e CFOP sejam válidos

---

### 4. Módulo: Vendas

#### Tarefa 4.1: Atualizar Página de Vendas
**Arquivo:** `app/pages/vendas/index.vue`

**Checklist:**
- [x] Substituir formatações manuais por `useCurrencyFormat`
  ```typescript
  const { formatarCentavos } = useCurrencyFormat();
  // Usar em todas as exibições de valor
  ```
- [x] Verificar consistência de valores em centavos
- [x] Atualizar estatísticas para usar formatação padronizada

**Pontos de Atenção:**
- Stats cards: Total em Vendas, Total Recebido, Ticket Médio
- Tabela de vendas: coluna Total
- Modal de detalhes: todos os valores

---

#### Tarefa 4.2: Atualizar APIs de Vendas
**Arquivos:**
- `server/api/vendas/index.post.ts`
- `server/api/vendas/[id].put.ts`

**Checklist:**
- [x] Aplicar `vendaSharedSchema`
- [x] Garantir que valorTotal seja calculado server-side
- [x] Validar relacionamento com orçamento

---

### 5. Módulo: Motoristas

#### Tarefa 5.1: Atualizar Página de Motoristas
**Arquivo:** `app/pages/motoristas/index.vue`

**Checklist:**
- [x] Implementar `useValidation(motoristaSharedSchema)`
- [x] Validar PIN (4 dígitos numéricos)
- [x] Usar máscara de telefone

---

#### Tarefa 5.2: Atualizar APIs de Motoristas
**Arquivos:**
- `server/api/motoristas/index.post.ts`
- `server/api/motoristas/[id].put.ts`

**Checklist:**
- [x] Aplicar `motoristaSharedSchema`
- [x] Validar unicidade do PIN por empresa

---

### 6. Módulo: Caminhões

#### Tarefa 6.1: Atualizar Página de Caminhões
**Arquivo:** `app/pages/caminhoes/index.vue`

**Checklist:**
- [x] Implementar `useValidation(caminhaoSharedSchema)`
- [x] Usar máscara de placa
- [x] Validar capacidade > 0

---

#### Tarefa 6.2: Atualizar APIs de Caminhões
**Arquivos:**
- `server/api/caminhoes/index.post.ts`
- `server/api/caminhoes/[id].put.ts`

**Checklist:**
- [x] Aplicar `caminhaoSharedSchema`
- [x] Validar formato da placa

---

### 7. Módulo: Bombas

#### Tarefa 7.1: Atualizar Página de Bombas
**Arquivo:** `app/pages/bombas/index.vue`

**Checklist:**
- [x] Implementar `useValidation(bombaSharedSchema)`
- [x] Validar tipo (LANCA, ESTACIONARIA, REBOQUE)

---

#### Tarefa 7.2: Atualizar APIs de Bombas
**Arquivos:**
- `server/api/bombas/index.post.ts`
- `server/api/bombas/[id].put.ts`

**Checklist:**
- [x] Aplicar `bombaSharedSchema`

---

### 8. Módulo: Insumos

#### Tarefa 8.1: Atualizar Página de Insumos
**Arquivo:** `app/pages/insumos/index.vue`

**Checklist:**
- [x] Substituir inputs de valor por `<BaseCurrency>`
  - Campo: `custoUnitario`
- [x] Implementar `useValidation(insumoSharedSchema)`

---

#### Tarefa 8.2: Atualizar APIs de Insumos
**Arquivos:**
- `server/api/insumos/index.post.ts`
- `server/api/insumos/[id].put.ts`

**Checklist:**
- [x] Aplicar `insumoSharedSchema`
- [x] Validar unidade de medida

---

### 9. Módulo: Financeiro

#### Tarefa 9.1: Atualizar Página de Contas a Pagar
**Arquivo:** `app/pages/financeiro/contas-pagar/index.vue`

**Checklist:**
- [x] Substituir `<BaseInput type="date">` por `<BaseDatePicker>`
  - Campo: `dataVencimento`
  - Campo: `dataPagamento`
- [x] Substituir input de valor por `<BaseCurrency>`
  - Campo: `valor`
- [x] Implementar `useValidation(contaPagarSharedSchema)`

---

#### Tarefa 9.2: Atualizar Página de Fornecedores
**Arquivo:** `app/pages/financeiro/fornecedores/index.vue`

**Checklist:**
- [x] Implementar `useValidation(fornecedorSharedSchema)`
- [x] Usar máscaras de CNPJ e telefone

---

#### Tarefa 9.3: Atualizar APIs do Financeiro
**Arquivos:**
- `server/api/financeiro/contas-pagar/index.post.ts`
- `server/api/financeiro/contas-pagar/[id].put.ts`
- `server/api/financeiro/fornecedores/index.post.ts`
- `server/api/financeiro/fornecedores/[id].put.ts`

**Checklist:**
- [x] Aplicar schemas compartilhados
- [x] Validar datas (vencimento >= hoje para novas)

---

## 🟡 PRIORIDADE MÉDIA

### 10. Padronização de APIs Backend

#### Tarefa 10.1: Migrar Schemas em Todas as APIs POST
**Arquivos:** Todos os `index.post.ts`

**Lista de APIs:**
- [x] `server/api/clientes/index.post.ts`
- [x] `server/api/orcamentos/index.post.ts`
- [x] `server/api/produtos/index.post.ts`
- [x] `server/api/vendas/index.post.ts`
- [x] `server/api/motoristas/index.post.ts`
- [x] `server/api/caminhoes/index.post.ts`
- [x] `server/api/bombas/index.post.ts`
- [x] `server/api/insumos/index.post.ts`
- [x] `server/api/vendedores/index.post.ts`
- [x] `server/api/financeiro/fornecedores/index.post.ts`
- [x] `server/api/financeiro/contas-pagar/index.post.ts`
- [x] `server/api/forma-pgto/index.post.ts` (se existir schema)
- [x] `server/api/usuarios/index.post.ts` (se existir schema)
- [x] `server/api/empresas/index.post.ts` (se existir schema)

**Template para cada API:**
```typescript
import { recursoSharedSchema } from '~/shared/schemas';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);
  
  const result = recursoSharedSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos',
      data: result.error.flatten().fieldErrors
    });
  }
  
  // ... resto do código usando result.data
});
```

---

#### Tarefa 10.2: Migrar Schemas em Todas as APIs PUT
**Arquivos:** Todos os `[id].put.ts`

**Lista de APIs:**
- [x] `server/api/clientes/[id].put.ts`
- [x] `server/api/orcamentos/[id].put.ts`
- [x] `server/api/produtos/[id].put.ts`
- [x] `server/api/vendas/[id].put.ts`
- [x] `server/api/motoristas/[id].put.ts`
- [x] `server/api/caminhoes/[id].put.ts`
- [x] `server/api/bombas/[id].put.ts`
- [x] `server/api/insumos/[id].put.ts`
- [x] `server/api/vendedores/[id].put.ts`
- [x] `server/api/financeiro/fornecedores/[id].put.ts`
- [x] `server/api/financeiro/contas-pagar/[id].put.ts`
- [x] `server/api/forma-pgto/[id].put.ts`
- [x] `server/api/usuarios/[id].put.ts`
- [x] `server/api/empresas/[id].put.ts`

**Nota:** Usar `schema.partial()` para atualizações parciais quando apropriado.

---

### 11. Padronização de Nomenclatura

#### Tarefa 11.1: Renomear Rotas Inconsistentes

**Lista de Renomeações:**

| De | Para | Motivo |
|----|------|--------|
| `/api/financeiro/summary.get.ts` | `/api/financeiro/resumo.get.ts` | Português consistente |
| `/api/forma-pgto/` | `/api/formas-pagamento/` | Plural completo |
| `/api/contas-pagar/index.get.ts` | `/api/financeiro/contas-pagar/index.get.ts` | Consolidar módulo |
| `/api/contas-pagar/index.post.ts` | `/api/financeiro/contas-pagar/index.post.ts` | Consolidar módulo |

**Checklist por Renomeação:**
- [x] Renomear arquivo
- [x] Atualizar imports no frontend
- [x] Testar endpoint
- [x] Atualizar documentação (se houver)

---

#### Tarefa 11.2: Criar Documentação de Rotas
**Arquivo:** `server/api/README.md`

**Checklist:**
- [x] Listar todas as rotas organizadas por módulo
- [x] Documentar parâmetros de entrada (com schemas)
- [x] Documentar respostas
- [x] Adicionar exemplos de uso

**Estrutura:**
```markdown
# API Routes

## Clientes
- `GET /api/clientes` - Listar todos
- `POST /api/clientes` - Criar (schema: clienteSharedSchema)
- `GET /api/clientes/:id` - Obter um
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Remover

## Orçamentos
...
```

---

#### Tarefa 11.3: Adicionar JSDoc aos Handlers
**Exemplo para cada arquivo .ts em server/api:**

```typescript
/**
 * Cria um novo cliente
 * @param {Object} body - Dados do cliente
 * @param {string} body.nome - Nome completo
 * @param {string} body.cpfCnpj - CPF ou CNPJ válido
 * @returns {Object} Cliente criado
 * @throws {400} Dados inválidos
 * @throws {401} Não autenticado
 * @throws {409} CPF/CNPJ já cadastrado
 */
export default defineEventHandler(async (event) => {
  // ...
});
```

---

## ✅ Checklist Final de Validação

Após completar todas as tarefas:

### Validação Frontend
- [x] Todos os formulários principais usam `useValidation()`
- [x] Todos os inputs de data usam `BaseDatePicker`
- [x] Todos os inputs de moeda usam `BaseCurrency`
- [x] Todas as máscaras usam `useInputMask`
- [x] Erros são exibidos nos campos correspondentes

### Validação Backend
- [x] Todas as APIs POST usam schemas compartilhados
- [x] Todas as APIs PUT usam schemas compartilhados
- [x] Erros retornam formato padronizado
- [x] Validações manuais foram removidas

### Testes
- [x] Testar criação de cliente com dados válidos
- [x] Testar criação de cliente com dados inválidos
- [x] Testar criação de orçamento com múltiplos itens
- [x] Testar formatação de valores monetários
- [x] Testar datas em diferentes fusos horários

---

## 🚀 Execução Recomendada

### Sprint 1 (Semana 1) - Prioridade Alta
- Dia 1-2: Clientes + Produtos
- Dia 3-4: Orçamentos (Parte 1)
- Dia 5: Orçamentos (Parte 2) + Testes

### Sprint 2 (Semana 2) - Prioridade Alta
- Dia 1: Vendas
- Dia 2: Motoristas + Caminhões
- Dia 3: Bombas + Insumos
- Dia 4: Financeiro
- Dia 5: Testes e ajustes

### Sprint 3 (Semana 3) - Prioridade Média
- Dia 1-3: APIs Backend
- Dia 4: Nomenclatura
- Dia 5: Documentação

---

## 📞 Suporte

Em caso de dúvidas durante a migração:
1. Consultar `shared/schemas/README.md`
2. Verificar exemplos em `AGENTS.md`
3. Reutilizar padrões já implementados

---

## 🐛 Problemas Conhecidos e Soluções

### Erro: `[vue/compiler-sfc] Unexpected token, expected "from"`

**Causa:** Uso de `import type` em arquivos Vue SFC (`.vue`)

**Solução:** Nunca use `import type` em arquivos Vue. Importe apenas o schema:
```typescript
// ❌ NÃO FAÇA ISSO
import type { ClienteShared } from "../../../shared/schemas";

// ✅ FAÇA ISSO
import { clienteSharedSchema } from "../../../shared/schemas";
```

**Veja também:** `.agent/MIGRATION_GUIDE.md` para mais detalhes.

---

*Documento gerado em: 2026-02-11*
*Última atualização: 2026-02-11*
