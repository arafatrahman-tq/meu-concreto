# Guia de Migração - Padrões e Convenções

> Documento para evitar erros comuns durante migrações

---

## ❌ ERRO COMUM: `import type` no Vue SFC

### O Problema
O Vue Compiler SFC pode não reconhecer corretamente a sintaxe `import type` ou `import { type X }`, mesmo com `lang="ts"`.

### Erro
```
[vue/compiler-sfc] Unexpected token, expected "from" (37:12)
```

### Solução
**NUNCA** use `import type` em arquivos Vue SFC (`.vue`).

```typescript
// ❌ NÃO FAÇA ISSO
import type { ClienteShared } from "../../../shared/schemas";
import { type ClienteShared } from "../../../shared/schemas"; // Também não funciona

// ✅ FAÇA ISSO
import { clienteSharedSchema } from "../../../shared/schemas";
// Use 'any' ou defina a interface localmente
```

### Exemplo Correto
```vue
<script setup lang="ts">
import { clienteSharedSchema } from "../../../shared/schemas";
import { useValidation } from "~/composables/useValidation";

// ❌ NÃO use tipagem genérica com imported types
const form = reactive<Partial<ClienteShared>>({
  nome: "",
  // ...
});

// ✅ Use reactive sem tipagem ou com 'any'
const form = reactive({
  nome: "",
  // ...
});

// O schema já garante a validação dos tipos
const { validate, errors } = useValidation(clienteSharedSchema);
</script>
```

---

## ✅ Checklist para Migração

### 1. Imports de Schemas
- [ ] Importar apenas o schema (não o tipo)
- [ ] Usar caminho relativo: `../../../shared/schemas`
- [ ] NUNCA usar `import type` ou `import { type X }`

```typescript
// ✅ Correto
import { clienteSharedSchema } from "../../../shared/schemas";

// ❌ Errado
import type { ClienteShared } from "../../../shared/schemas";
import { type ClienteShared } from "../../../shared/schemas";
```

### 2. Script Setup
- [ ] SEMPRE usar `lang="ts"` para habilitar TypeScript
- [ ] Usar `any` para formulários reativos em vez de tipos importados

```vue
<!-- ✅ Correto -->
<script setup lang="ts">
const form = reactive({
  nome: "",
  valor: 0,
});
</script>

<!-- ❌ Errado (se importar tipos) -->
<script setup lang="ts">
const form = reactive<Partial<ClienteShared>>({...});
</script>
```

### 3. Componentes de Formulário
- [ ] `BaseDatePicker` para datas/datetime
- [ ] `BaseCurrency` para valores monetários (com `:centavos="true"`)
- [ ] `BaseInput` para textos normais

### 4. Validação
- [ ] Usar `useValidation(schema)` do composable
- [ ] Mapear erros do backend para os campos
- [ ] Validar no submit com `validate(form)`

### 5. APIs Backend
- [ ] Usar `schema.safeParse(body)` em vez de `schema.parse()`
- [ ] Retornar erros formatados:
```typescript
if (!result.success) {
  throw createError({
    statusCode: 400,
    statusMessage: "Erro de Validação",
    message: "Dados inválidos",
    data: result.error.errors.map((e) => ({
      path: e.path,
      message: e.message,
    })),
  });
}
```

---

## 🔧 Template para Nova Página

```vue
<template>
  <div>
    <!-- Seu template aqui -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useValidation } from "~/composables/useValidation";
import { entidadeSharedSchema } from "../../../shared/schemas";
// NÃO importe tipos! Apenas o schema

const { validate, errors, validateField, hasErrors, clearAllErrors } = useValidation(entidadeSharedSchema);

// Formulário sem tipagem genérica
const form = reactive({
  campo1: "",
  campo2: 0,
});

const onSubmit = async () => {
  const result = validate(form);
  if (!result.success) {
    // Mostrar erros
    return;
  }
  // Enviar result.data
};
</script>
```

---

## 🔧 Template para Nova API

```typescript
import { entidadeSharedSchema } from "../../../shared/schemas";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const body = await readBody(event);
    
    const result = entidadeSharedSchema.safeParse(body);
    
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: "Dados inválidos",
        data: result.error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    const data = result.data;
    // ... resto do código
    
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    await serverLog.error(event, "MODULO", "Erro", { error: error.message });
    
    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao processar a solicitação",
    });
  }
});
```

---

## 🧹 Limpar Cache

Sempre que houver erros de compilação estranhos:

```bash
# Remover cache do Nuxt
rm -rf .nuxt

# Ou no Windows
Remove-Item -Recurse -Force .nuxt
```

---

## 📋 Regras de Ouro

1. **Nunca use `import type`** em arquivos `.vue`
2. **Sempre use `lang="ts"`** no script setup
3. **Use `reactive({})`** sem tipagem genérica para formulários
4. **Use `safeParse()`** em vez de `parse()` nas APIs
5. **Limpe o cache** (`.nuxt/`) se houver erros estranhos

---

*Última atualização: 2026-02-11*
