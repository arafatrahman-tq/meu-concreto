/**
 * Schemas para Relatórios e BI
 * 
 * Este arquivo contém schemas para filtros e dados de relatórios
 */

import { z } from "zod";

// ==========================================
// Filtros de Relatórios
// ==========================================

export const periodoFiltroSchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
});

export const filtroRelatorioVendasSchema = z.object({
  ...periodoFiltroSchema.shape,
  idCliente: z.number().int().optional().nullable(),
  idVendedor: z.number().int().optional().nullable(),
  idProduto: z.number().int().optional().nullable(),
  status: z.enum(["ABERTA", "PAGA", "CANCELADA", "NF_EMITIDA"]).optional().nullable(),
  agruparPor: z.enum(["dia", "semana", "mes", "vendedor", "cliente", "produto"]).default("dia"),
});

export const filtroRelatorioOrcamentosSchema = z.object({
  ...periodoFiltroSchema.shape,
  idCliente: z.number().int().optional().nullable(),
  idVendedor: z.number().int().optional().nullable(),
  status: z.enum(["PENDENTE", "APROVADO", "CANCELADO", "VENCIDO", "CONCLUIDO"]).optional().nullable(),
});

export const filtroRelatorioFinanceiroSchema = z.object({
  ...periodoFiltroSchema.shape,
  tipo: z.enum(["receitas", "despesas", "ambos"]).default("ambos"),
  idFornecedor: z.number().int().optional().nullable(),
  status: z.enum(["PENDENTE", "PAGO", "ATRASADO"]).optional().nullable(),
});

export const filtroRelatorioClientesSchema = z.object({
  ...periodoFiltroSchema.shape,
  tipo: z.enum(["novos", "ativos", "inativos", "todos"]).default("todos"),
  minCompras: z.number().int().min(0).optional(),
});

export const filtroDashboardSchema = z.object({
  periodo: z.enum(["7d", "30d", "90d", "6m", "1a", "personalizado"]).default("30d"),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
  idEmpresa: z.number().int().optional(),
});

// ==========================================
// Dados de Relatórios (Respostas)
// ==========================================

export const vendaPorPeriodoSchema = z.object({
  periodo: z.string(),
  totalVendas: z.number().int(),
  valorTotal: z.number().int(),
  ticketMedio: z.number().int(),
  quantidadeMedia: z.number(),
});

export const vendaPorVendedorSchema = z.object({
  idVendedor: z.number().int(),
  nomeVendedor: z.string(),
  totalVendas: z.number().int(),
  valorTotal: z.number().int(),
  comissao: z.number().int().optional(),
  percentualCrescimento: z.number().optional(),
});

export const vendaPorClienteSchema = z.object({
  idCliente: z.number().int(),
  nomeCliente: z.string(),
  totalCompras: z.number().int(),
  valorTotal: z.number().int(),
  ultimaCompra: z.string().optional().nullable(),
});

export const vendaPorProdutoSchema = z.object({
  idProduto: z.number().int(),
  nomeProduto: z.string(),
  quantidadeTotal: z.number(),
  valorTotal: z.number().int(),
  percentualVendas: z.number(),
});

export const statusOrcamentoSchema = z.object({
  status: z.string(),
  quantidade: z.number().int(),
  valorTotal: z.number().int(),
  percentual: z.number(),
});

export const fluxoCaixaSchema = z.object({
  periodo: z.string(),
  receitas: z.number().int(),
  despesas: z.number().int(),
  saldo: z.number().int(),
});

export const contasAReceberSchema = z.object({
  vencidas: z.number().int(),
  aVencer7Dias: z.number().int(),
  aVencer30Dias: z.number().int(),
  totalReceber: z.number().int(),
});

export const contasAPagarSchema = z.object({
  vencidas: z.number().int(),
  aVencer7Dias: z.number().int(),
  aVencer30Dias: z.number().int(),
  totalPagar: z.number().int(),
});

// ==========================================
// KPIs do Dashboard
// ==========================================

export const kpisDashboardSchema = z.object({
  // Vendas
  totalVendas: z.number().int(),
  valorTotalVendas: z.number().int(),
  ticketMedio: z.number().int(),
  quantidadeMedia: z.number(),
  
  // Comparação com período anterior
  crescimentoVendas: z.number(), // percentual
  crescimentoValor: z.number(), // percentual
  
  // Orçamentos
  totalOrcamentos: z.number().int(),
  taxaConversao: z.number(), // percentual
  
  // Financeiro
  saldoPeriodo: z.number().int(),
  contasReceber: z.number().int(),
  contasPagar: z.number().int(),
  
  // Clientes
  novosClientes: z.number().int(),
  clientesAtivos: z.number().int(),
  
  // Produtos
  produtoMaisVendido: z.object({
    nome: z.string(),
    quantidade: z.number(),
  }).optional().nullable(),
  
  // Período
  dataInicio: z.string(),
  dataFim: z.string(),
});

// ==========================================
// Tipos TypeScript
// ==========================================

export type PeriodoFiltro = z.infer<typeof periodoFiltroSchema>;
export type FiltroRelatorioVendas = z.infer<typeof filtroRelatorioVendasSchema>;
export type FiltroRelatorioOrcamentos = z.infer<typeof filtroRelatorioOrcamentosSchema>;
export type FiltroRelatorioFinanceiro = z.infer<typeof filtroRelatorioFinanceiroSchema>;
export type FiltroRelatorioClientes = z.infer<typeof filtroRelatorioClientesSchema>;
export type FiltroDashboard = z.infer<typeof filtroDashboardSchema>;

export type VendaPorPeriodo = z.infer<typeof vendaPorPeriodoSchema>;
export type VendaPorVendedor = z.infer<typeof vendaPorVendedorSchema>;
export type VendaPorCliente = z.infer<typeof vendaPorClienteSchema>;
export type VendaPorProduto = z.infer<typeof vendaPorProdutoSchema>;
export type StatusOrcamento = z.infer<typeof statusOrcamentoSchema>;
export type FluxoCaixa = z.infer<typeof fluxoCaixaSchema>;
export type ContasAReceber = z.infer<typeof contasAReceberSchema>;
export type ContasAPagar = z.infer<typeof contasAPagarSchema>;
export type KpisDashboard = z.infer<typeof kpisDashboardSchema>;
