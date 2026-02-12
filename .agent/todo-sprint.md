# 🎯 TODO - Sprints de Migração

## 📊 Progresso Geral

```
[░░░░░░░░░░] 0% Completo
```

---

## Sprint 1: Clientes e Produtos (Prioridade Alta)

### Dia 1-2: Clientes
```
[░░░░░░░░░░] 0%
```
- [ ] **1.1** Atualizar página `app/pages/clientes/index.vue`
  - Implementar `useValidation(clienteSharedSchema)`
  - Usar `useInputMask` para CPF/CNPJ, telefone, CEP
  - Mapear erros para campos

- [ ] **1.2** Atualizar API POST `server/api/clientes/index.post.ts`
  - Aplicar `clienteSharedSchema.safeParse()`
  - Retornar erros formatados

- [ ] **1.3** Atualizar API PUT `server/api/clientes/[id].put.ts`
  - Aplicar schema compartilhado
  - Usar `.partial()` para updates

---

### Dia 3-4: Produtos
```
[░░░░░░░░░░] 0%
```
- [ ] **3.1** Atualizar página `app/pages/produtos/index.vue`
  - Substituir inputs de valor por `<BaseCurrency>`
  - Implementar `useValidation(produtoSharedSchema)`

- [ ] **3.2** Atualizar APIs POST/PUT
  - `server/api/produtos/index.post.ts`
  - `server/api/produtos/[id].put.ts`

---

## Sprint 2: Orçamentos (Prioridade Alta)

### Dia 1-2: Componentes de UI
```
[░░░░░░░░░░] 0%
```
- [ ] **2.1** Substituir inputs de data por `<BaseDatePicker>`
  - Campo: `validadeOrcamento`
  - Campo: `dataEntrega`

- [ ] **2.2** Substituir inputs de moeda por `<BaseCurrency>`
  - Campo: `valorUnit` (itens)
  - Campo: `valorBomba`
  - Campo: `valorDesconto`
  - Campo: `total`

---

### Dia 3-4: Validação
```
[░░░░░░░░░░] 0%
```
- [ ] **2.3** Implementar `useValidation(orcamentoSharedSchema)`
  - Validar schema completo
  - Validar array de itens
  - Regras de negócio adicionais

- [ ] **2.4** Mapear erros para campos do formulário
  - Mostrar erro em cada input
  - Destacar campos inválidos

---

### Dia 5: APIs Backend
```
[░░░░░░░░░░] 0%
```
- [ ] **2.5** Atualizar API POST `server/api/orcamentos/index.post.ts`
- [ ] **2.6** Atualizar API PUT `server/api/orcamentos/[id].put.ts`

---

## Sprint 3: Vendas e Frota (Prioridade Alta)

### Dia 1: Vendas
```
[░░░░░░░░░░] 0%
```
- [ ] **4.1** Atualizar página `app/pages/vendas/index.vue`
  - Usar `useCurrencyFormat` para exibição
  - Verificar consistência de centavos

- [ ] **4.2** Atualizar APIs POST/PUT
  - `server/api/vendas/index.post.ts`
  - `server/api/vendas/[id].put.ts`

---

### Dia 2: Motoristas + Caminhões
```
[░░░░░░░░░░] 0%
```
- [ ] **5.1** Motoristas: Página + APIs
- [ ] **6.1** Caminhões: Página + APIs
  - Validar placa com máscara

---

### Dia 3: Bombas + Insumos
```
[░░░░░░░░░░] 0%
```
- [ ] **7.1** Bombas: Página + APIs
- [ ] **8.1** Insumos: Página + APIs
  - Usar `<BaseCurrency>` para custo

---

## Sprint 4: Financeiro (Prioridade Alta)

### Dia 1-2: Contas a Pagar
```
[░░░░░░░░░░] 0%
```
- [ ] **9.1** Atualizar página `app/pages/financeiro/contas-pagar/index.vue`
  - `<BaseDatePicker>` para datas
  - `<BaseCurrency>` para valor

- [ ] **9.2** Atualizar APIs POST/PUT

---

### Dia 3-4: Fornecedores
```
[░░░░░░░░░░] 0%
```
- [ ] **9.3** Atualizar página `app/pages/financeiro/fornecedores/index.vue`
- [ ] **9.4** Atualizar APIs POST/PUT

---

### Dia 5: Testes e Ajustes
```
[░░░░░░░░░░] 0%
```
- [ ] Testar criação de todos os módulos
- [ ] Verificar formatação de moeda
- [ ] Validar mensagens de erro
- [ ] Corrigir bugs encontrados

---

## Sprint 5: APIs Backend (Prioridade Média)

### Dia 1-3: Migrar todas as APIs
```
[░░░░░░░░░░] 0%
```
- [ ] **10.1** APIs POST (14 arquivos)
  - [ ] clientes
  - [ ] orcamentos
  - [ ] produtos
  - [ ] vendas
  - [ ] motoristas
  - [ ] caminhoes
  - [ ] bombas
  - [ ] insumos
  - [ ] vendedores
  - [ ] financeiro/fornecedores
  - [ ] financeiro/contas-pagar
  - [ ] forma-pgto
  - [ ] usuarios
  - [ ] empresas

- [ ] **10.2** APIs PUT (14 arquivos)
  - Mesma lista acima

---

## Sprint 6: Nomenclatura e Docs (Prioridade Média)

### Dia 4: Renomear Rotas
```
[░░░░░░░░░░] 0%
```
- [ ] **11.1** `/api/financeiro/summary` → `/api/financeiro/resumo`
- [ ] **11.2** `/api/forma-pgto` → `/api/formas-pagamento`
- [ ] **11.3** Consolidar `/api/contas-pagar` em `/api/financeiro/`

---

### Dia 5: Documentação
```
[░░░░░░░░░░] 0%
```
- [ ] **11.4** Criar `server/api/README.md` com todas as rotas
- [ ] **11.5** Adicionar JSDoc em todos os handlers
- [ ] **11.6** Atualizar `AGENTS.md` com mudanças

---

## ✅ Definition of Done

Para cada tarefa estar completa:

- [ ] Código funciona sem erros
- [ ] Validação funciona no frontend
- [ ] Validação funciona no backend
- [ ] Erros são exibidos corretamente
- [ ] Testado manualmente
- [ ] Não há regressões

---

## 🎯 Métricas de Sucesso

- **0** validações duplicadas entre frontend/backend
- **100%** das APIs usam schemas compartilhados
- **100%** dos formulários usam `useValidation()`
- **0** inputs de data/moeda com implementação customizada

---

## 🚀 Comandos Úteis

```bash
# Testar TypeScript
bun run typecheck

# Rodar testes
bun test

# Verificar lint
bun run lint

# Build (verifica erros)
bun run build
```

---

## 📝 Notas

- Atualizar este arquivo marcando tarefas como concluídas
- Adicionar observações sobre bugs ou dificuldades
- Registrar tempo gasto por sprint para estimativas futuras

---

*Última atualização: 2026-02-11*
