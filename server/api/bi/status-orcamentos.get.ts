import { db } from "../../database/db";
import { orcamentos } from "../../database/schema";
import { eq, and, gte, lte, isNull, sql, count, sum } from "drizzle-orm";
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
 * GET /api/bi/status-orcamentos
 * 
 * Retorna distribuição de orçamentos por status
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
    
    const resultado = await db
      .select({
        status: orcamentos.status,
        quantidade: count(orcamentos.id),
        valorTotal: sum(sql`COALESCE(${orcamentos.total}, 0)`),
      })
      .from(orcamentos)
      .where(and(
        isNull(orcamentos.deletedAt),
        eq(orcamentos.idEmpresa, user.idEmpresa),
        gte(orcamentos.createdAt, dataInicio),
        lte(orcamentos.createdAt, dataFim),
      ))
      .groupBy(orcamentos.status);
    
    const totalOrcamentos = resultado.reduce((acc, item) => acc + item.quantidade, 0);
    
    const dadosFormatados = resultado.map((item) => ({
      status: item.status,
      quantidade: item.quantidade,
      valorTotal: Number(item.valorTotal || 0),
      percentual: totalOrcamentos > 0 ? Math.round((item.quantidade / totalOrcamentos) * 100) : 0,
    }));
    
    await serverLog.info(event, "BI", "Relatório status de orçamentos gerado", {
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      registros: dadosFormatados.length,
    });
    
    return dadosFormatados;
    
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    console.error("[BI/StatusOrcamentos] Erro:", error);
    
    await serverLog.error(event, "BI", "Erro ao consultar status dos orçamentos", {
      error: error.message,
      stack: error.stack,
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: error.message || "Erro ao consultar status dos orçamentos",
    });
  }
});
