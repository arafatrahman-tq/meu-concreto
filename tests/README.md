# Testes - Meu Concreto

> Suite de testes automatizados do projeto

---

## Estrutura

```
tests/
├── shared/
│   └── schemas/
│       ├── cliente.test.ts       # Testes de validação de clientes
│       ├── orcamento.test.ts     # Testes de validação de orçamentos
│       └── valores.test.ts       # Testes de validação de valores
├── components/
│   ├── BaseDatePicker.test.ts   # Testes de lógica de datas
│   └── BaseCurrency.test.ts     # Testes de lógica monetária
├── composables/
│   └── useValidation.test.ts    # Testes de validação e máscaras
└── README.md                    # Este arquivo
```

---

## Execução

### Executar todos os testes:
```bash
bun test
```

### Executar testes específicos:
```bash
bun test tests/shared/schemas/cliente.test.ts
bun test tests/shared/schemas/orcamento.test.ts
bun test tests/composables/useValidation.test.ts
```

### Executar com watch mode:
```bash
bun test --watch
```

---

## Cobertura

### Schemas Compartilhados (Zod)
- ✅ Validação de campos obrigatórios
- ✅ Validação de CPF/CNPJ
- ✅ Validação de email
- ✅ Validação de valores monetários
- ✅ Validação de schema parcial (updates)
- ✅ Helpers de validação (validarCpf, validarCnpj)

### Componentes
- ✅ Formatação de datas (ISO, datetime-local, BR)
- ✅ Validação de datas
- ✅ Formatação monetária (centavos ↔ moeda)
- ✅ Máscara de input monetário
- ✅ Precisão decimal

### Composables
- ✅ useValidation (validate, errors, clear)
- ✅ useCurrencyFormat (formatarCentavos, paraCentavos)
- ✅ useInputMask (cpfCnpj, telefone, cep, placa)

---

## Exemplo de Saída

```
bun test v1.3.8

tests/shared/schemas/cliente.test.ts:
✓ clienteSharedSchema > Validação de campos obrigatórios > deve validar cliente com dados válidos (CPF) [2.00ms]
✓ clienteSharedSchema > Validação de campos obrigatórios > deve validar cliente com dados válidos (CNPJ) [0.50ms]
✓ clienteSharedSchema > Validação de CPF/CNPJ helpers > validarCpf deve retornar true para CPF válido [0.20ms]
...

 7 pass
 0 fail
```

---

## Adicionar Novos Testes

```typescript
import { describe, it, expect } from "bun:test";
import { schema } from "../../../shared/schemas";

describe("Nome do Schema", () => {
  it("deve fazer algo", () => {
    const result = schema.safeParse({ ... });
    expect(result.success).toBe(true);
  });
});
```

---

*Atualizado em: 2026-02-11*
