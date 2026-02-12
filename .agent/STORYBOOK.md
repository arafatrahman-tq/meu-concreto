# Storybook - Componentes UI

> Documentação dos componentes reutilizáveis do Meu Concreto

---

## Componentes de Formulário

### BaseInput

Input de texto com ícone, label e estado de erro.

**Props:**
```typescript
{
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'tel';
  icon?: Component;
  error?: string;
  disabled?: boolean;
}
```

**Uso:**
```vue
<BaseInput
  v-model="form.nome"
  label="Nome Completo"
  placeholder="Digite o nome"
  :icon="User"
  :error="errors.nome"
/>
```

---

### BaseDatePicker

Input de data/datetime com formatação automática.

**Props:**
```typescript
{
  modelValue: string | null;
  type: 'date' | 'datetime-local';
  label?: string;
  icon?: Component;
  error?: string;
}
```

**Uso:**
```vue
<BaseDatePicker
  v-model="form.validadeOrcamento"
  type="date"
  label="Validade"
  :icon="Calendar"
  :error="errors.validadeOrcamento"
/>
```

---

### BaseCurrency

Input monetário com máscara e formatação.

**Props:**
```typescript
{
  modelValue: number | null;
  label?: string;
  centavos?: boolean; // true = valor em centavos
  error?: string;
}
```

**Uso:**
```vue
<!-- Valor em centavos (backend) -->
<BaseCurrency
  v-model="form.valor"
  :centavos="true"
  label="Valor"
  :error="errors.valor"
/>

<!-- Valor decimal -->
<BaseCurrency
  v-model="form.valor"
  :centavos="false"
  label="Valor"
/>
```

---

### BaseSelect

Select dropdown com opções formatadas.

**Props:**
```typescript
{
  modelValue: string | number;
  label?: string;
  options: Array<{ label: string; value: any }>;
  icon?: Component;
  error?: string;
}
```

**Uso:**
```vue
<BaseSelect
  v-model="form.idVendedor"
  label="Vendedor"
  :options="vendedorOptions"
  :icon="UserCheck"
  :error="errors.idVendedor"
/>
```

---

## Componentes de Loading

### BaseSkeleton

Skeleton básico para estados de carregamento.

**Props:**
```typescript
{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}
```

**Uso:**
```vue
<BaseSkeleton size="md" />
<BaseSkeleton size="lg" className="w-full" />
```

---

### SkeletonTable

Skeleton para tabelas de dados.

**Props:**
```typescript
{
  columns: number;
  rows: number;
}
```

**Uso:**
```vue
<SkeletonTable :columns="5" :rows="5" />
```

---

### SkeletonCard

Skeleton para cards de estatísticas.

**Uso:**
```vue
<SkeletonCard />
```

---

## Componentes de Feedback

### BaseToast

Notificação toast para feedback do usuário.

**Uso (via composable):**
```typescript
const { add } = useToast();

add({
  title: "Sucesso",
  description: "Cliente cadastrado com sucesso!",
  type: "success", // 'success' | 'error' | 'warning' | 'info'
});
```

---

### BaseModal

Modal para formulários e confirmações.

**Props:**
```typescript
{
  modelValue: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Uso:**
```vue
<BaseModal v-model="showModal" title="Novo Cliente" size="lg">
  <form>...</form>
</BaseModal>
```

---

### BaseConfirmDialog

Dialog de confirmação para ações destrutivas.

**Props:**
```typescript
{
  modelValue: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}
```

**Uso:**
```vue
<BaseConfirmDialog
  v-model="showDeleteDialog"
  title="Confirmar Exclusão"
  description="Deseja realmente excluir este cliente?"
  confirmText="Excluir"
  loading="loading"
  @confirm="handleDelete"
/>
```

---

## Componentes de Dados

### BaseTable

Tabela com cabeçalho e layout consistente.

**Props:**
```typescript
{
  headers: string[];
}
```

**Uso:**
```vue
<BaseTable :headers="['ID', 'Nome', 'Email', '']">
  <tr v-for="item in items" :key="item.id">
    <td>{{ item.id }}</td>
    <td>{{ item.nome }}</td>
    <td>{{ item.email }}</td>
    <td>
      <button>Editar</button>
    </td>
  </tr>
</BaseTable>
```

---

### BaseTooltip

Tooltip para ações de botões.

**Props:**
```typescript
{
  text: string;
}
```

**Uso:**
```vue
<BaseTooltip text="Editar cliente">
  <button @click="edit">
    <Edit3 size="16" />
  </button>
</BaseTooltip>
```

---

## Composables

### useValidation

Validação de formulários com Zod.

**Uso:**
```typescript
import { useValidation } from '~/composables/useValidation';
import { clienteSharedSchema } from '../../../shared/schemas';

const { validate, errors, validateField, clearAllErrors } = useValidation(clienteSharedSchema);

// Validar formulário completo
const onSubmit = () => {
  const result = validate(form);
  if (!result.success) {
    // errors contém os erros mapeados
    return;
  }
  // result.data contém dados validados
};

// Validar campo individual
const onBlur = () => {
  validateField('nome', form.nome);
};

// Limpar erros
const resetForm = () => {
  clearAllErrors();
};
```

---

### useCurrencyFormat

Formatação de valores monetários.

**Uso:**
```typescript
import { useCurrencyFormat } from '~/composables/useValidation';

const { formatarCentavos, paraCentavos, formatarDecimal } = useCurrencyFormat();

// Centavos para moeda
formatarCentavos(123456); // "R$ 1.234,56"

// String para centavos
paraCentavos("R$ 1.234,56"); // 123456

// Decimal para moeda
formatarDecimal(1234.56); // "R$ 1.234,56"
```

---

### useInputMask

Máscaras de input para CPF, CNPJ, telefone, etc.

**Uso:**
```typescript
import { useInputMask } from '~/composables/useValidation';

const { cpfCnpj, telefone, cep, placa } = useInputMask();

// Máscara CPF
const masked = cpfCnpj("12345678901"); // "123.456.789-01"

// Máscara CNPJ
const masked = cpfCnpj("11222333000181"); // "11.222.333/0001-81"

// Máscara Telefone
const masked = telefone("11999999999"); // "(11) 99999-9999"

// Máscara CEP
const masked = cep("01001000"); // "01001-000"

// Máscara Placa
const masked = placa("abc1d23"); // "ABC1D23"
```

---

## Exemplos Completos

### Formulário de Cliente

```vue
<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <BaseInput
      v-model="form.nome"
      label="Nome Completo"
      placeholder="Digite o nome"
      :icon="User"
      :error="errors.nome"
      @blur="validateField('nome', form.nome)"
    />
    
    <BaseInput
      v-model="form.cpfCnpj"
      label="CPF/CNPJ"
      placeholder="000.000.000-00"
      :icon="CreditCard"
      :error="errors.cpfCnpj"
      @input="onCpfCnpjInput"
    />
    
    <BaseInput
      v-model="form.telefone"
      label="Telefone"
      placeholder="(00) 00000-0000"
      :icon="Phone"
      :error="errors.telefone"
      @input="onTelefoneInput"
    />
    
    <BaseInput
      v-model="form.email"
      label="Email"
      type="email"
      placeholder="email@exemplo.com"
      :icon="Mail"
      :error="errors.email"
    />
    
    <div class="flex justify-end gap-2">
      <button type="button" @click="onCancel">Cancelar</button>
      <button type="submit" :disabled="loading">Salvar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { User, CreditCard, Phone, Mail } from 'lucide-vue-next';
import { useValidation, useInputMask } from '~/composables/useValidation';
import { clienteSharedSchema } from '../../../shared/schemas';

const form = reactive({
  nome: '',
  cpfCnpj: '',
  telefone: '',
  email: '',
});

const loading = ref(false);

const { validate, errors, validateField, clearAllErrors } = useValidation(clienteSharedSchema);
const { cpfCnpj, telefone } = useInputMask();

const onCpfCnpjInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  input.value = cpfCnpj(input.value);
  form.cpfCnpj = input.value;
};

const onTelefoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  input.value = telefone(input.value);
  form.telefone = input.value;
};

const onSubmit = async () => {
  clearAllErrors();
  
  const result = validate(form);
  if (!result.success) return;
  
  loading.value = true;
  try {
    await $fetch('/api/clientes', {
      method: 'POST',
      body: result.data,
    });
    // Sucesso
  } finally {
    loading.value = false;
  }
};

const onCancel = () => {
  clearAllErrors();
  // Fechar modal, etc.
};
</script>
```

---

### Tabela com Skeleton Loading

```vue
<template>
  <div>
    <!-- Skeleton durante carregamento -->
    <SkeletonTable v-if="pending" :columns="4" :rows="5" />
    
    <!-- Tabela quando carregado -->
    <BaseTable v-else :headers="['ID', 'Nome', 'Email', 'Ações']">
      <tr v-for="cliente in clientes" :key="cliente.id">
        <td>{{ cliente.id }}</td>
        <td>{{ cliente.nome }}</td>
        <td>{{ cliente.email }}</td>
        <td>
          <BaseTooltip text="Editar">
            <button @click="edit(cliente)">
              <Edit3 size="16" />
            </button>
          </BaseTooltip>
        </td>
      </tr>
    </BaseTable>
  </div>
</template>

<script setup>
const { data: clientes, pending } = useFetch('/api/clientes');
</script>
```

---

## Checklist de Uso

- [ ] Usar `useValidation` em todos os formulários
- [ ] Usar `BaseDatePicker` para datas
- [ ] Usar `BaseCurrency` para valores monetários
- [ ] Usar `useInputMask` para máscaras
- [ ] Mostrar `SkeletonTable` durante carregamento
- [ ] Mapear `:error` nos inputs
- [ ] Usar `BaseTooltip` em ações de botões

---

*Documentação atualizada em: 2026-02-11*
