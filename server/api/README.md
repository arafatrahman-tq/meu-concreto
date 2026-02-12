# API Routes Documentation

> Documentação completa das rotas da API do Meu Concreto

---

## Índice

- [Autenticação](#autenticação)
- [Clientes](#clientes)
- [Orçamentos](#orçamentos)
- [Vendas](#vendas)
- [Produtos](#produtos)
- [Motoristas](#motoristas)
- [Caminhões](#caminhões)
- [Bombas](#bombas)
- [Insumos](#insumos)
- [Vendedores](#vendedores)
- [Formas de Pagamento](#formas-de-pagamento)
- [Financeiro](#financeiro)
- [Usuários](#usuários)
- [Empresas](#empresas)

---

## Autenticação

Todas as rotas requerem autenticação via JWT, exceto rotas públicas explicitamente marcadas.

**Header necessário:**
```
Authorization: Bearer <token>
```

---

## Clientes

**Schema:** `clienteSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clientes` | Listar todos os clientes |
| POST | `/api/clientes` | Criar novo cliente |
| GET | `/api/clientes/:id` | Obter cliente por ID |
| PUT | `/api/clientes/:id` | Atualizar cliente |
| DELETE | `/api/clientes/:id` | Remover cliente (soft delete) |

### POST /api/clientes

**Body:**
```typescript
{
  nome: string;           // required, min 3 chars
  cpfCnpj: string;        // required, valid CPF or CNPJ
  telefone?: string;      // optional
  email?: string;         // optional, valid email
  endereco?: string;      // optional
  numero?: string;        // optional
  bairro?: string;        // optional
  cidade?: string;        // optional
  estado?: string;        // optional, 2 chars
  cep?: string;           // optional, 8-9 chars
  complemento?: string;   // optional
}
```

**Respostas:**
- `201` - Cliente criado com sucesso
- `400` - Dados inválidos (erros de validação)
- `401` - Não autenticado
- `409` - CPF/CNPJ já cadastrado

---

## Orçamentos

**Schema:** `orcamentoSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/orcamentos` | Listar todos os orçamentos |
| POST | `/api/orcamentos` | Criar novo orçamento |
| GET | `/api/orcamentos/:id` | Obter orçamento por ID |
| PUT | `/api/orcamentos/:id` | Atualizar orçamento |
| DELETE | `/api/orcamentos/:id` | Remover orçamento |

### POST /api/orcamentos

**Body:**
```typescript
{
  idCliente: number;           // required
  nomeCliente: string;         // required
  cpfCnpj: string;             // required
  telefone: string;            // required
  email?: string;              // optional
  idVendedor: number;          // required
  idFormaPgto: number;         // required
  validadeOrcamento: string;   // required, ISO date
  dataEntrega: string;         // required, ISO date
  tipoEntrega: string;         // required
  idCaminhao?: number;         // optional
  idMotorista?: number;        // optional
  idBomba?: number;            // optional
  enderecoObra: string;        // required
  valorBomba: number;          // required, centavos
  valorDesconto: number;       // required, centavos
  observacoes?: string;        // optional
  itens: Array<{
    idProduto: number;
    produtoNome: string;
    qtd: number;
    valorUnit: number;         // centavos
  }>;
}
```

---

## Vendas

**Schema:** `vendaSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/vendas` | Listar todas as vendas |
| POST | `/api/vendas` | Criar nova venda |
| GET | `/api/vendas/:id` | Obter venda por ID |
| PUT | `/api/vendas/:id` | Atualizar venda |
| DELETE | `/api/vendas/:id` | Remover venda |

### POST /api/vendas

**Body:**
```typescript
{
  idOrcamento: number;     // required
  dataVenda: string;       // required, ISO date
  valorTotal: number;      // required, centavos
  status: string;          // required, enum: PENDENTE, PAGA, CANCELADA
}
```

---

## Produtos

**Schema:** `produtoSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/produtos` | Listar todos os produtos |
| POST | `/api/produtos` | Criar novo produto |
| GET | `/api/produtos/:id` | Obter produto por ID |
| PUT | `/api/produtos/:id` | Atualizar produto |
| DELETE | `/api/produtos/:id` | Remover produto |

### POST /api/produtos

**Body:**
```typescript
{
  nome: string;            // required, min 2 chars
  descricao?: string;      // optional
  unidadeMedida: string;   // required, enum: M3, KG, UN
  valorCusto: number;      // required, centavos
  valorVenda: number;      // required, centavos
  estoqueMinimo?: number;  // optional
  estoqueAtual?: number;   // optional
  fck?: string;            // optional, enum: valores FCK
  slump?: string;          // optional, enum: valores Slump
  categoria?: string;      // optional
}
```

---

## Motoristas

**Schema:** `motoristaSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/motoristas` | Listar todos os motoristas |
| POST | `/api/motoristas` | Criar novo motorista |
| GET | `/api/motoristas/:id` | Obter motorista por ID |
| PUT | `/api/motoristas/:id` | Atualizar motorista |
| DELETE | `/api/motoristas/:id` | Remover motorista |

### POST /api/motoristas

**Body:**
```typescript
{
  nome: string;            // required, min 3 chars
  telefone?: string;       // optional
  cnh?: string;            // optional
  pin?: string;            // optional, 4-6 digitos
  idCaminhao?: number;     // optional
  ativo: boolean;          // required
}
```

---

## Caminhões

**Schema:** `caminhaoSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/caminhoes` | Listar todos os caminhões |
| POST | `/api/caminhoes` | Criar novo caminhão |
| GET | `/api/caminhoes/:id` | Obter caminhão por ID |
| PUT | `/api/caminhoes/:id` | Atualizar caminhão |
| DELETE | `/api/caminhoes/:id` | Remover caminhão |

### POST /api/caminhoes

**Body:**
```typescript
{
  placa: string;           // required, formato placa
  modelo?: string;         // optional
  capacidade: number;      // required, min 1
  ativo: boolean;          // required
}
```

---

## Bombas

**Schema:** `bombaSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/bombas` | Listar todas as bombas |
| POST | `/api/bombas` | Criar nova bomba |
| GET | `/api/bombas/:id` | Obter bomba por ID |
| PUT | `/api/bombas/:id` | Atualizar bomba |
| DELETE | `/api/bombas/:id` | Remover bomba |
| GET | `/api/bombas/agenda` | Agenda de bombeamento |

### POST /api/bombas

**Body:**
```typescript
{
  nome: string;            // required, min 2 chars
  tipo: string;            // required, enum: LANCA, ESTACIONARIA, REBOQUE
  placa?: string;          // optional
  ativo: boolean;          // required
}
```

---

## Insumos

**Schema:** `insumoSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/insumos` | Listar todos os insumos |
| POST | `/api/insumos` | Criar novo insumo |
| GET | `/api/insumos/:id` | Obter insumo por ID |
| PUT | `/api/insumos/:id` | Atualizar insumo |
| DELETE | `/api/insumos/:id` | Remover insumo |
| GET | `/api/insumos/relatorio` | Relatório de consumo |
| POST | `/api/insumos/ajuste` | Ajuste de estoque |

### POST /api/insumos

**Body:**
```typescript
{
  nome: string;              // required, min 2 chars
  unidadeMedida: string;     // required, enum: KG, LT, UN, M3, TN
  estoqueAtual?: number;     // optional, min 0
  estoqueMinimo?: number;    // optional, min 0
  custoUnitario?: number;    // optional, centavos
}
```

---

## Vendedores

**Schema:** `vendedorSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/vendedores` | Listar todos os vendedores |
| POST | `/api/vendedores` | Criar novo vendedor |
| GET | `/api/vendedores/:id` | Obter vendedor por ID |
| PUT | `/api/vendedores/:id` | Atualizar vendedor |
| DELETE | `/api/vendedores/:id` | Remover vendedor |

### POST /api/vendedores

**Body:**
```typescript
{
  nome: string;            // required, min 3 chars
  email?: string;          // optional, valid email
  telefone?: string;       // optional
  comissao?: number;       // optional, min 0, max 100
  ativo: boolean;          // required
}
```

---

## Formas de Pagamento

**Schema:** `formaPgtoSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/formas-pagamento` | Listar todas as formas |
| POST | `/api/formas-pagamento` | Criar nova forma |
| GET | `/api/formas-pagamento/:id` | Obter forma por ID |
| PUT | `/api/formas-pagamento/:id` | Atualizar forma |
| DELETE | `/api/formas-pagamento/:id` | Remover forma |

### POST /api/formas-pagamento

**Body:**
```typescript
{
  nome: string;            // required, min 2 chars
  tipo: string;            // required, enum: PIX, BOLETO, CARTAO, DINHEIRO, PRAZO
  prazoDias?: number;      // optional, min 0
  ativo: boolean;          // required
}
```

---

## Financeiro

### Fornecedores

**Schema:** `fornecedorSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/financeiro/fornecedores` | Listar fornecedores |
| POST | `/api/financeiro/fornecedores` | Criar fornecedor |
| GET | `/api/financeiro/fornecedores/:id` | Obter fornecedor |
| PUT | `/api/financeiro/fornecedores/:id` | Atualizar fornecedor |
| DELETE | `/api/financeiro/fornecedores/:id` | Remover fornecedor |

### Contas a Pagar

**Schema:** `contaPagarSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/financeiro/contas-pagar` | Listar contas |
| POST | `/api/financeiro/contas-pagar` | Criar conta |
| GET | `/api/financeiro/contas-pagar/:id` | Obter conta |
| PUT | `/api/financeiro/contas-pagar/:id` | Atualizar conta |
| DELETE | `/api/financeiro/contas-pagar/:id` | Remover conta |
| GET | `/api/financeiro/resumo` | Resumo financeiro |

### POST /api/financeiro/contas-pagar

**Body:**
```typescript
{
  descricao: string;           // required
  idFornecedor?: number;       // optional
  valor: number;               // required, centavos
  dataVencimento: string;      // required, ISO date
  dataPagamento?: string;      // optional, ISO date
  status?: string;             // optional, enum: PENDENTE, PAGO, ATRASADO
}
```

---

## Usuários

**Schema:** `usuarioSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/usuarios` | Listar usuários |
| POST | `/api/usuarios` | Criar usuário |
| GET | `/api/usuarios/:id` | Obter usuário |
| PUT | `/api/usuarios/:id` | Atualizar usuário |
| DELETE | `/api/usuarios/:id` | Remover usuário |

---

## Empresas

**Schema:** `empresaSharedSchema`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/empresas` | Listar empresas |
| POST | `/api/empresas` | Criar empresa |
| GET | `/api/empresas/:id` | Obter empresa |
| PUT | `/api/empresas/:id` | Atualizar empresa |
| DELETE | `/api/empresas/:id` | Remover empresa |

---

## Erros

### Formato de Erro Padrão

```typescript
{
  statusCode: number;
  statusMessage: string;
  message: string;
  data?: Array<{
    path: string;
    message: string;
  }>;
}
```

### Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: CPF já cadastrado) |
| 500 | Erro interno do servidor |

---

## Valores Monetários

Todos os valores monetários são armazenados em **centavos** (inteiro).

**Exemplo:**
- R$ 1.234,56 → `123456`
- R$ 100,00 → `10000`

---

*Documentação atualizada em: 2026-02-11*
