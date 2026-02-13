# Código Compartilhado (Shared)

Este diretório contém código compartilhado entre o app Vue e o servidor Nitro, seguindo os padrões do Nuxt 4.

## Estrutura

Conforme as convenções do Nuxt 4, os arquivos nestes diretórios são auto-importados:

```
shared/
├── utils/            # Utilitários e Schemas (Auto-importados)
│   ├── schemas.ts    # Schemas Zod e Tipos inferidos
│   └── relatorios.ts # Lógica compartilhada de relatórios
├── types/            # Definições de tipos TypeScript (Auto-importados)
└── README.md         # Esta documentação
```

## Auto-import

Graças ao padrão do Nuxt 4, você **não precisa importar** manualmente os schemas ou tipos nos seus componentes Vue ou rotas da API. Eles estão disponíveis globalmente.

Exemplo de uso:

```typescript
// Não é necessário: import { clienteSharedSchema } from '#shared/utils/schemas'
const result = clienteSharedSchema.safeParse(body);
```

## Propósito

Garantir consistência de validação e lógica em toda a aplicação, evitando divergências entre o client-side e server-side.

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
import { clienteSharedSchema } from "~/shared/schemas";

// Validação de input
const body = await readBody(event);
const result = clienteSharedSchema.safeParse(body);

if (!result.success) {
  throw createError({
    statusCode: 400,
    message: "Dados inválidos",
    data: result.error.errors,
  });
}
```

### Frontend

```typescript
import { clienteSharedSchema } from "~/shared/schemas";
import { useValidation } from "~/composables/useValidation";

const { validate, errors } = useValidation(clienteSharedSchema);

const onSubmit = async () => {
  const result = validate(formData);
  if (result.success) {
    await $fetch("/api/clientes", { method: "POST", body: result.data });
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
