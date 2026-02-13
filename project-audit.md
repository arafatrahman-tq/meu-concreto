# Auditoria de Consistência Design/Backend

> Data: 2026-02-11
> Tipo: Correção de Consistência

---

## Resumo das Correções Aplicadas

### 1. ✅ Schemas Zod Compartilhados

**Problema**: Validações duplicadas entre frontend e backend, risco de inconsistência.

**Solução**: Criado `shared/utils/schemas.ts` com schemas compartilhados, seguindo os padrões do Nuxt 4 para auto-import.

**Schemas Criados**:

- Base: `valorMonetarioSchema`, `cpfCnpjSchema`, `telefoneSchema`, `emailSchema`, `cepSchema`, `pinSchema`, `placaSchema`
- Entidades: `clienteSharedSchema`, `produtoSharedSchema`, `orcamentoSharedSchema`, `vendaSharedSchema`, `pagamentoSharedSchema`, `motoristaSharedSchema`, `caminhaoSharedSchema`, `bombaSharedSchema`, `insumoSharedSchema`, `fornecedorSharedSchema`, `contaPagarSharedSchema`

**Uso (Auto-import)**:

```typescript
// Frontend (Componentes Vue)
import { useValidation } from "~/composables/useValidation";
// Não é necessário importar o schema, ele está disponível globalmente
const { validate, errors } = useValidation(clienteSharedSchema);

// Backend (Nitro API Routes)
// O schema também está disponível globalmente via auto-import
const result = clienteSharedSchema.safeParse(body);
```

---

### 2. ✅ Componentes de Formulário Padronizados

**Problema**: Inputs de data e moeda implementados de formas diferentes em várias telas.

**Solução**: Criados componentes reutilizáveis.

#### BaseDatePicker (`app/components/form/BaseDatePicker.vue`)

- Suporte a `type="date"`, `type="datetime-local"`, `type="time"`
- Conversão automática de Date/timestamp para ISO string
- Ícone de calendário integrado
- Validação de min/max

```vue
<BaseDatePicker
  v-model="form.dataEntrega"
  type="datetime-local"
  label="Data de Entrega"
  :icon="Calendar"
/>
```

#### BaseCurrency (`app/components/form/BaseCurrency.vue`)

- Formatação automática no padrão brasileiro (R$ 1.234,56)
- Suporte a trabalhar com centavos (prop `centavos`)
- Máscara de input em tempo real
- Validação de min/max

```vue
<BaseCurrency
  v-model="form.valor"
  :centavos="true"
  label="Valor Total"
  :icon="DollarSign"
/>
```

---

### 3. ✅ Composable useValidation

**Problema**: Lógica de validação espalhada e inconsistente entre formulários.

**Solução**: Criado `app/composables/useValidation.ts` com helpers completos.

**Funcionalidades**:

- `useValidation(schema)` - Validação completa de formulários
- `useCpfCnpjValidation()` - Validação e formatação de documentos
- `useCurrencyFormat()` - Formatação de valores monetários
- `useInputMask()` - Máscaras (telefone, CEP, placa, CPF/CNPJ)

```typescript
const { validate, errors, clearError, hasErrors } =
  useValidation(clienteSharedSchema);
const { validar, formatar } = useCpfCnpjValidation();
const { formatarCentavos } = useCurrencyFormat();
const { telefone, cep, cpfCnpj } = useInputMask();
```

---

### 4. ✅ Documentação dos Padrões

**Arquivos Criados/Atualizados**:

1. **`shared/README.md`** - Guia completo de uso do código compartilhado
2. **`AGENTS.md`** - Atualizado com:
   - Seção 4.5 sobre Schemas Compartilhados
   - Seção 5.4 sobre Validação (Zod)
   - Seção 5.5 sobre Formatação de Dados
   - Seção 6.2 sobre Componentes de Formulário
   - Seção 7.2 sobre Novos Composables

---

## Convenções Estabelecidas

### Valores Monetários

| Camada   | Formato            | Exemplo         |
| -------- | ------------------ | --------------- |
| Backend  | Centavos (integer) | `123456`        |
| API      | Centavos (integer) | `123456`        |
| Frontend | Decimal formatado  | `"R$ 1.234,56"` |

### Datas

| Camada   | Formato                   |
| -------- | ------------------------- |
| Backend  | Date object ou timestamp  |
| API      | ISO 8601 string           |
| Frontend | Date object ou ISO string |

### Validação

1. Usar sempre schemas de `shared/schemas/index.ts`
2. Frontend: usar `useValidation()` para feedback em tempo real
3. Backend: usar `schema.safeParse()` e retornar erros formatados
4. Nunca duplicar validações customizadas

---

## Próximos Passos Recomendados

### Refatoração de Código Existente

1. **Migrar telas para novos componentes**:

   - Substituir inputs de data por `BaseDatePicker`
   - Substituir inputs de moeda por `BaseCurrency`
   - Atualizar `app/pages/orcamentos/index.vue`
   - Atualizar `app/pages/vendas/index.vue`

2. **Padronizar validações**:

   - Substituir validações inline por schemas compartilhados
   - Atualizar APIs para usar schemas de `shared/schemas/`

3. **Corrigir APIs inconsistentes**:
   - Renomear `/api/financeiro/summary` para `/api/financeiro/resumo`
   - Padronizar todas as rotas para kebab-case

### Testes

1. Adicionar testes para schemas compartilhados
2. Adicionar testes para componentes BaseDatePicker e BaseCurrency
3. Adicionar testes para useValidation

---

## Checklist de Implementação

- [x] Criar diretório `shared/schemas/`
- [x] Criar `shared/schemas/index.ts` com todos os schemas
- [x] Criar `shared/schemas/README.md` com documentação
- [x] Criar diretório `app/components/form/`
- [x] Criar `BaseDatePicker.vue`
- [x] Criar `BaseCurrency.vue`
- [x] Criar `app/composables/useValidation.ts`
- [x] Atualizar `AGENTS.md` com novos padrões
- [ ] Migrar telas existentes para novos componentes
- [ ] Atualizar APIs para usar schemas compartilhados
- [ ] Adicionar testes

---

## Notas para Desenvolvedores

Ao criar novas funcionalidades, seguir estas regras:

1. **Sempre** usar schemas compartilhados para validação
2. **Sempre** usar `BaseDatePicker` e `BaseCurrency` para inputs de data/moeda
3. **Sempre** usar `useValidation()` para validação de formulários
4. **Sempre** manter valores monetários em centavos no backend
5. **Nunca** duplicar lógica de validação entre frontend e backend

---

_Documento gerado automaticamente durante auditoria de consistência._
