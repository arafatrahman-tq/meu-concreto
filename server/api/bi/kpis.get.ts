import { db } from "../../database/db";
import { vendas, orcamentos, clientes, contasPagar } from "../../database/schema";
import { eq, and, gte, lte, isNull, sql, count, sum } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";
import { z } from "zod";
import { serverLog } from "../../utils/logger";

// Schema local para validação
const filtroDashboardSchema = z.object({
  periodo: z.enum(["7d", "30d", "90d", "6m", "1a", "personalizado"]).default("30d"),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
});

/**
 * GET /api/bi/kpis
 * 
 * Retorna KPIs do dashboard para o período especificado
 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    // Parse e validação dos filtros
    const query = getQuery(event);
    const result = filtroDashboardSchema.safeParse(query);
    
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: "Filtros inválidos",
        data: result.error.issues,
      });
    }
    
    const filtros = result.data;
    
    // Calcular datas do período (como Date objects)
    const periodoAtual = calcularPeriodo(filtros);
    const dataInicio = periodoAtual.dataInicio;
    const dataFim = periodoAtual.dataFim;
    
    const periodoAnterior = calcularPeriodoAnterior(dataInicio, dataFim);
    const dataInicioAnterior = periodoAnterior.dataInicioAnterior;
    const dataFimAnterior = periodoAnterior.dataFimAnterior;
    
    // Construir condições base
    const baseConditions = [
      isNull(vendas.deletedAt),
      eq(vendas.idEmpresa, user.idEmpresa),
    ];
    
    // ==========================================
    // KPIs do Período Atual
    // ==========================================
    
    // Total de vendas e valores
    const vendasPeriodo = await db
      .select({
        totalVendas: count(vendas.id),
        valorTotal: sum(vendas.valorTotal),
      })
      .from(vendas)
      .where(and(
        ...baseConditions,
        gte(vendas.dataVenda, dataInicio),
        lte(vendas.dataVenda, dataFim),
      ));
    
    const totalVendas = vendasPeriodo[0]?.totalVendas || 0;
    const valorTotalVendas = Number(vendasPeriodo[0]?.valorTotal || 0);
    const ticketMedio = totalVendas > 0 ? Math.round(valorTotalVendas / totalVendas) : 0;
    
    // Período anterior (para comparação)
    const vendasPeriodoAnterior = await db
      .select({
        totalVendas: count(vendas.id),
        valorTotal: sum(vendas.valorTotal),
      })
      .from(vendas)
      .where(and(
        ...baseConditions,
        gte(vendas.dataVenda, dataInicioAnterior),
        lte(vendas.dataVenda, dataFimAnterior),
      ));
    
    const totalVendasAnterior = vendasPeriodoAnterior[0]?.totalVendas || 0;
    const valorTotalAnterior = Number(vendasPeriodoAnterior[0]?.valorTotal || 0);
    
    const crescimentoVendas = calcularPercentualCrescimento(totalVendas, totalVendasAnterior);
    const crescimentoValor = calcularPercentualCrescimento(valorTotalVendas, valorTotalAnterior);
    
    // Total de orçamentos
    const orcamentosPeriodo = await db
      .select({
        total: count(orcamentos.id),
        aprovados: count(sql`CASE WHEN ${orcamentos.status} = 'APROVADO' THEN 1 END`),
      })
      .from(orcamentos)
      .where(and(
        isNull(orcamentos.deletedAt),
        eq(orcamentos.idEmpresa, user.idEmpresa),
        gte(orcamentos.createdAt, dataInicio),
        lte(orcamentos.createdAt, dataFim),
      ));
    
    const totalOrcamentos = orcamentosPeriodo[0]?.total || 0;
    const orcamentosAprovados = orcamentosPeriodo[0]?.aprovados || 0;
    const taxaConversao = totalOrcamentos > 0 ? Math.round((orcamentosAprovados / totalOrcamentos) * 100) : 0;
    
    // Novos clientes
    const novosClientes = await db
      .select({ count: count(clientes.id) })
      .from(clientes)
      .where(and(
        isNull(clientes.deletedAt),
        eq(clientes.idEmpresa, user.idEmpresa),
        gte(clientes.createdAt, dataInicio),
        lte(clientes.createdAt, dataFim),
      ));
    
    // Clientes ativos (compraram no período) - via join com orcamentos
    // Relacionamento: vendas → orcamentos (via idOrcamento) → clientes (via idCliente)
    const clientesAtivosResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${orcamentos.idCliente})` })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .where(and(
        isNull(vendas.deletedAt),
        eq(vendas.idEmpresa, user.idEmpresa),
        gte(vendas.dataVenda, dataInicio),
        lte(vendas.dataVenda, dataFim),
      ));
    
    // Contas a pagar e receber
    const hoje = new Date();
    
    const contasPagarResult = await db
      .select({
        total: sum(contasPagar.valor),
        vencidas: sum(sql`CASE WHEN ${contasPagar.dataVencimento} < ${hoje} AND ${contasPagar.status} != 'PAGO' THEN ${contasPagar.valor} ELSE 0 END`),
      })
      .from(contasPagar)
      .where(and(
        isNull(contasPagar.deletedAt),
        eq(contasPagar.idEmpresa, user.idEmpresa),
        eq(contasPagar.status, "PENDENTE"),
      ));
    
    const totalContasPagar = Number(contasPagarResult[0]?.total || 0);
    
    await serverLog.info(event, "BI", "KPIs consultados", {
      periodo: filtros.periodo,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      totalVendas,
      valorTotalVendas,
    });
    
    return {
      // Vendas
      totalVendas,
      valorTotalVendas,
      ticketMedio,
      quantidadeMedia: 0,
      
      // Crescimento
      crescimentoVendas,
      crescimentoValor,
      
      // Orçamentos
      totalOrcamentos,
      taxaConversao,
      
      // Financeiro
      saldoPeriodo: valorTotalVendas - totalContasPagar,
      contasReceber: 0,
      contasPagar: totalContasPagar,
      
      // Clientes
      novosClientes: novosClientes[0]?.count || 0,
      clientesAtivos: clientesAtivosResult[0]?.count || 0,
      
      // Período
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
    };
    
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    console.error("[BI/KPIs] Erro:", error);
    
    await serverLog.error(event, "BI", "Erro ao consultar KPIs", {
      error: error.message,
      stack: error.stack,
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: error.message || "Erro ao consultar KPIs",
    });
  }
});

// ==========================================
// Helpers
// ==========================================

function calcularPeriodo(filtros: any): { dataInicio: Date; dataFim: Date } {
  const hoje = new Date();
  // Final do dia atual (23:59:59)
  const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  let dataInicio: Date;
  
  switch (filtros.periodo) {
    case "7d":
      dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "6m":
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
      break;
    case "1a":
      dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
      break;
    case "personalizado":
      if (!filtros.dataInicio || !filtros.dataFim) {
        throw new Error("Para período personalizado, dataInicio e dataFim são obrigatórios");
      }
      dataInicio = new Date(filtros.dataInicio + 'T00:00:00');
      return { dataInicio, dataFim: new Date(filtros.dataFim + 'T23:59:59') };
    default:
      dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { dataInicio, dataFim };
}

function calcularPeriodoAnterior(dataInicio: Date, dataFim: Date): { dataInicioAnterior: Date; dataFimAnterior: Date } {
  const diffMs = dataFim.getTime() - dataInicio.getTime();
  
  const dataFimAnterior = new Date(dataInicio.getTime() - 1);
  const dataInicioAnterior = new Date(dataFimAnterior.getTime() - diffMs);
  
  return {
    dataInicioAnterior,
    dataFimAnterior,
  };
}

function calcularPercentualCrescimento(atual: number, anterior: number): number {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return Math.round(((atual - anterior) / anterior) * 100);
}
