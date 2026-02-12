import { db } from "../../database/db";
import { vendas, orcamentos, clientes } from "../../database/schema";
import { eq, and, gte, lte, isNull, sql, count, sum, desc } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";
import { z } from "zod";
import { serverLog } from "../../utils/logger";

// Schema local
const filtroDashboardSchema = z.object({
  periodo: z.enum(["7d", "30d", "90d", "6m", "1a", "personalizado"]).default("30d"),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
});

/**
 * GET /api/bi/vendas-por-cliente
 * 
 * Retorna ranking de vendas por cliente
 * Relacionamento: vendas → orcamentos (via idOrcamento) → clientes (via idCliente)
 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const query = getQuery(event);
    
    // Tentar parse com filtroDashboardSchema primeiro (suporta periodo)
    const dashboardResult = filtroDashboardSchema.safeParse(query);
    
    let dataInicio: Date;
    let dataFim: Date;
    
    if (dashboardResult.success && dashboardResult.data.periodo) {
      // Calcular datas baseado no período
      const hoje = new Date();
      dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
      
      switch (dashboardResult.data.periodo) {
        case "7d":
          dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
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
        case "30d":
        default:
          dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Fallback para dataInicio/dataFim diretos
      const dataInicioStr = String(query.dataInicio || '');
      const dataFimStr = String(query.dataFim || '');
      
      if (!dataInicioStr || !dataFimStr) {
        throw createError({
          statusCode: 400,
          statusMessage: "Erro de Validação",
          message: "Informe periodo (7d, 30d, 90d, 6m, 1a) ou dataInicio/dataFim",
        });
      }
      
      dataInicio = new Date(dataInicioStr + 'T00:00:00');
      dataFim = new Date(dataFimStr + 'T23:59:59');
    }
    
    // Condições para vendas
    const vendasConditions = [
      isNull(vendas.deletedAt),
      eq(vendas.idEmpresa, user.idEmpresa),
      gte(vendas.dataVenda, dataInicio),
      lte(vendas.dataVenda, dataFim),
    ];
    
    // Query com JOIN: vendas → orcamentos → clientes
    // Nota: vendas NÃO tem idCliente diretamente, apenas via orcamentos
    const resultado = await db
      .select({
        idCliente: orcamentos.idCliente,
        nomeCliente: sql<string>`COALESCE(${clientes.nome}, 'Cliente ' || ${orcamentos.idCliente})`,
        totalCompras: count(vendas.id),
        valorTotal: sum(vendas.valorTotal),
        ultimaCompra: sql<string>`MAX(date(${vendas.dataVenda}, 'unixepoch'))`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .leftJoin(clientes, eq(orcamentos.idCliente, clientes.id))
      .where(and(...vendasConditions))
      .groupBy(orcamentos.idCliente)
      .orderBy(desc(sum(vendas.valorTotal)));
    
    const dadosFormatados = resultado.map((item) => ({
      idCliente: item.idCliente || 0,
      nomeCliente: item.nomeCliente,
      totalCompras: item.totalCompras,
      valorTotal: Number(item.valorTotal || 0),
      ultimaCompra: item.ultimaCompra,
    }));
    
    await serverLog.info(event, "BI", "Relatório vendas por cliente gerado", {
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      registros: dadosFormatados.length,
    });
    
    return dadosFormatados;
    
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    console.error("[BI/VendasPorCliente] Erro:", error);
    
    await serverLog.error(event, "BI", "Erro ao gerar relatório por cliente", {
      error: error.message,
      stack: error.stack,
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: error.message || "Erro ao gerar relatório por cliente",
    });
  }
});
