# Módulo Relatórios e BI

> Documentação do módulo de Business Intelligence

---

## Visão Geral

O módulo de Relatórios e BI fornece dashboards interativos, KPIs em tempo real e relatórios detalhados para análise de negócio.

## Estrutura

```
├── shared/schemas/relatorios.ts          # Schemas de filtros e dados
├── server/api/bi/
│   ├── kpis.get.ts                       # KPIs do dashboard
│   ├── vendas-por-periodo.get.ts         # Gráfico de vendas
│   ├── vendas-por-vendedor.get.ts        # Ranking de vendedores
│   ├── vendas-por-cliente.get.ts         # Top clientes
│   └── status-orcamentos.get.ts          # Distribuição de status
├── app/pages/relatorios/
│   └── index.vue                         # Dashboard principal
└── .agent/BI_DOCUMENTACAO.md             # Esta documentação
```

---

## APIs

### GET /api/bi/kpis

Retorna os principais indicadores do dashboard.

**Query Params:**
```typescript
{
  periodo: "7d" | "30d" | "90d" | "6m" | "1a" | "personalizado",
  dataInicio?: string,  // YYYY-MM-DD (se personalizado)
  dataFim?: string      // YYYY-MM-DD (se personalizado)
}
```

**Resposta:**
```typescript
{
  // Vendas
  totalVendas: number,
  valorTotalVendas: number,  // centavos
  ticketMedio: number,       // centavos
  
  // Crescimento vs período anterior
  crescimentoVendas: number, // percentual
  crescimentoValor: number,  // percentual
  
  // Orçamentos
  totalOrcamentos: number,
  taxaConversao: number,     // percentual
  
  // Financeiro
  saldoPeriodo: number,      // centavos
  contasReceber: number,     // centavos
  contasPagar: number,       // centavos
  
  // Clientes
  novosClientes: number,
  clientesAtivos: number,
  
  // Produtos
  produtoMaisVendido: {
    nome: string,
    quantidade: number
  } | null,
  
  // Período
  dataInicio: string,
  dataFim: string
}
```

---

### GET /api/bi/vendas-por-periodo

Retorna vendas agrupadas por período (dia, semana, mês).

**Query Params:**
```typescript
{
  dataInicio: string,  // YYYY-MM-DD
  dataFim: string,     // YYYY-MM-DD
  agruparPor: "dia" | "semana" | "mes"
}
```

---

### GET /api/bi/vendas-por-vendedor

Retorna ranking de vendas por vendedor.

**Query Params:**
```typescript
{
  dataInicio: string,  // YYYY-MM-DD
  dataFim: string      // YYYY-MM-DD
}
```

---

### GET /api/bi/vendas-por-cliente

Retorna ranking de vendas por cliente.

**Query Params:**
```typescript
{
  dataInicio: string,  // YYYY-MM-DD
  dataFim: string,     // YYYY-MM-DD
  tipo?: "novos" | "ativos" | "inativos" | "todos",
  minCompras?: number
}
```

---

### GET /api/bi/status-orcamentos

Retorna distribuição de orçamentos por status.

**Query Params:**
```typescript
{
  dataInicio: string,  // YYYY-MM-DD
  dataFim: string      // YYYY-MM-DD
}
```

---

## Schemas

### Filtros

```typescript
import { 
  filtroDashboardSchema,
  filtroRelatorioVendasSchema,
  filtroRelatorioOrcamentosSchema,
  filtroRelatorioFinanceiroSchema,
  filtroRelatorioClientesSchema 
} from "~/shared/schemas/relatorios";
```

### Dados

```typescript
import {
  type KpisDashboard,
  type VendaPorPeriodo,
  type VendaPorVendedor,
  type VendaPorCliente,
  type StatusOrcamento
} from "~/shared/schemas/relatorios";
```

---

## Frontend

### Página Dashboard

**Rota:** `/relatorios`

**Componentes:**
- KPI Cards com indicadores principais
- Gráfico de barras (vendas por período)
- Ranking de vendedores
- Tabela de top clientes
- Gráfico de status de orçamentos

**Funcionalidades:**
- Filtro de período (7d, 30d, 90d, 6m, 1a)
- Toggle de agrupamento (dia/semana/mês)
- Exportação para PDF

### Uso

```vue
<script setup>
// Carregar KPIs
const { data: kpis } = useFetch("/api/bi/kpis", {
  query: { periodo: "30d" }
});

// Carregar relatório específico
const vendasPorVendedor = await $fetch("/api/bi/vendas-por-vendedor", {
  query: { 
    dataInicio: "2026-01-01", 
    dataFim: "2026-02-01" 
  }
});
</script>
```

---

## Testes

```bash
# Testar APIs de BI
bun test tests/bi/
```

---

## ✅ Funcionalidades Implementadas

### Exportação PDF
- **Botão Exportar**: Dashboard possui botão "PDF" no header
- **Utilitário**: `app/utils/pdfExport.ts` - Função `exportarRelatorioPDF()`
- **API**: `POST /api/bi/exportar` - Gera dados formatados para PDF
- **Bibliotecas**: jsPDF + jspdf-autotable

### Gráficos Avançados (Chart.js)
- **Componentes**:
  - `BarChart.vue` - Gráfico de barras (vendas por vendedor)
  - `LineChart.vue` - Gráfico de linha (evolução de vendas)
  - `PieChart.vue` - Gráfico de doughnut (status de orçamentos)
- **Bibliotecas**: chart.js + vue-chartjs

## 🔄 Próximos Passos (Opcionais)

1. **Relatórios Programados**
   - Agendar envio de relatórios por email
   - Configurar frequência (diário, semanal, mensal)

2. **Filtros Avançados**
   - Filtros por região, produto, vendedor
   - Comparação entre períodos

3. **Exportação Excel**
   - Além de PDF, permitir exportar XLSX

4. **Alertas** - Notificações quando KPIs atingem thresholds

5. **Alertas**
   - Notificações quando KPIs atingem thresholds
   - Alertas de queda de vendas

---

*Documentação atualizada: 2026-02-11*
