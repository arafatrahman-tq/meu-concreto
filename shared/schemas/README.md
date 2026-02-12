# Schemas Compartilhados

Este diretório contém schemas Zod compartilhados entre frontend e backend.

## Propósito

Garantir consistência de validação em toda a aplicação, evitando divergências
entre a validação client-side e server-side.

## Estrutura

```
shared/schemas/
├── index.ts          # Exporta todos os schemas e tipos
└── README.md         # Esta documentação
```

## Convenções

### Valores Monetários

- **Backend**: Sempre trabalhar com centavos (`integer`)
- **Frontend**: Converter para exibição em reais (`R$ 1.234,56`)
- **API**: Sempre enviar/receber em centavos

```typescript
// Backend - armazenamento
const valor = 123456; // R$ 1.234,56

// Frontend - exibição
formatCurrency(valor); // "R$ 1.234,56"
```

### Datas

- **Backend**: Date objects ou timestamps
- **Frontend**: ISO strings ou Date objects
- **API**: ISO 8601 string format

```typescript
// Envio para API
const data = new Date().toISOString();

// Recebimento da API
const data = new Date(response.dataEntrega);
```

### Campos Opcionais

Sempre usar `.optional().nullable()` para campos não obrigatórios:

```typescript
const schema = z.object({
  nome: z.string(), // obrigatório
  telefone: z.string().optional().nullable(), // opcional
});
```

## Uso

### Backend

```typescript
import { clienteSharedSchema } from '~/shared/schemas';

// Validação de input
const body = await readBody(event);
const result = clienteSharedSchema.safeParse(body);

if (!result.success) {
  throw createError({
    statusCode: 400,
    message: 'Dados inválidos',
    data: result.error.errors
  });
}
```

### Frontend

```typescript
import { clienteSharedSchema } from '~/shared/schemas';
import { useValidation } from '~/composables/useValidation';

const { validate, errors } = useValidation(clienteSharedSchema);

const onSubmit = async () => {
  const result = validate(formData);
  if (result.success) {
    await $fetch('/api/clientes', { method: 'POST', body: result.data });
  }
};
```

## Schemas Disponíveis

### Base
- `valorMonetarioSchema` - Valores em centavos
- `cpfCnpjSchema` - CPF ou CNPJ válido
- `telefoneSchema` - Telefone brasileiro
- `emailSchema` - Email válido
- `cepSchema` - CEP válido
- `pinSchema` - PIN de 4 dígitos
- `placaSchema` - Placa de veículo

### Entidades
- `clienteSharedSchema` - Cliente
- `produtoSharedSchema` - Produto/Traço
- `orcamentoSharedSchema` - Orçamento
- `orcamentoItemSharedSchema` - Item de orçamento
- `vendaSharedSchema` - Venda
- `pagamentoSharedSchema` - Pagamento
- `motoristaSharedSchema` - Motorista
- `caminhaoSharedSchema` - Caminhão
- `bombaSharedSchema` - Bomba
- `insumoSharedSchema` - Insumo
- `fornecedorSharedSchema` - Fornecedor
- `contaPagarSharedSchema` - Conta a pagar

## Manutenção

Ao adicionar novos schemas:

1. Sempre exportar o schema e seu tipo inferido
2. Seguir as convenções de nomenclatura: `{entidade}SharedSchema`
3. Documentar campos obrigatórios vs opcionais
4. Atualizar este README
