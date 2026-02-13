import { db } from '../../database/db'
import { vendas } from '../../database/schema'
import { eq, and, gte, lte, isNull, sql, count, sum } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { z } from 'zod'
import { serverLog } from '../../utils/logger'

// Schema local
const filtroDashboardSchema = z.object({
  periodo: z.enum(['7d', '30d', '90d', '6m', '1a', 'personalizado']).default('30d'),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
})

/**
 * GET /api/bi/vendas-por-periodo
 *
 * Retorna vendas agrupadas por período (dia, semana, mês)
 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const query = getQuery(event)

    // Tentar parse com filtroDashboardSchema primeiro (suporta periodo)
    const dashboardResult = filtroDashboardSchema.safeParse(query)

    let dataInicio: Date
    let dataFim: Date
    let agruparPor: 'dia' | 'semana' | 'mes' = 'dia'

    if (dashboardResult.success && dashboardResult.data.periodo) {
      // Calcular datas baseado no período
      const hoje = new Date()
      dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)

      switch (dashboardResult.data.periodo) {
        case '7d':
          dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000)
          agruparPor = 'semana'
          break
        case '6m':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate())
          agruparPor = 'mes'
          break
        case '1a':
          dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate())
          agruparPor = 'mes'
          break
        case '30d':
        default:
          dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }
    else {
      // Fallback para dataInicio/dataFim diretos (espera strings YYYY-MM-DD)
      const dataInicioStr = String(query.dataInicio || '')
      const dataFimStr = String(query.dataFim || '')

      if (!dataInicioStr || !dataFimStr) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Erro de Validação',
          message: 'Informe periodo (7d, 30d, 90d, 6m, 1a) ou dataInicio/dataFim',
        })
      }

      dataInicio = new Date(dataInicioStr + 'T00:00:00')
      dataFim = new Date(dataFimStr + 'T23:59:59')

      const agruparPorQuery = String(query.agruparPor || 'dia')
      agruparPor = ['dia', 'semana', 'mes'].includes(agruparPorQuery) ? agruparPorQuery as any : 'dia'
    }

    // Construir condições
    const conditions = [
      isNull(vendas.deletedAt),
      eq(vendas.idEmpresa, user.idEmpresa),
      gte(vendas.dataVenda, dataInicio),
      lte(vendas.dataVenda, dataFim),
    ]

    // Agrupar conforme solicitado - usar strftime com unixepoch pois o campo é timestamp
    let groupByClause
    switch (agruparPor) {
      case 'semana':
        groupByClause = sql`strftime('%Y-W%W', ${vendas.dataVenda}, 'unixepoch')`
        break
      case 'mes':
        groupByClause = sql`strftime('%Y-%m', ${vendas.dataVenda}, 'unixepoch')`
        break
      case 'dia':
      default:
        groupByClause = sql`date(${vendas.dataVenda}, 'unixepoch')`
    }

    const resultado = await db
      .select({
        periodo: groupByClause,
        totalVendas: count(vendas.id),
        valorTotal: sum(vendas.valorTotal),
      })
      .from(vendas)
      .where(and(...conditions))
      .groupBy(groupByClause)
      .orderBy(groupByClause)

    // Calcular ticket médio para cada período
    const dadosFormatados = resultado.map(item => ({
      periodo: String(item.periodo),
      totalVendas: item.totalVendas,
      valorTotal: Number(item.valorTotal || 0),
      ticketMedio: item.totalVendas > 0 ? Math.round(Number(item.valorTotal || 0) / item.totalVendas) : 0,
      quantidadeMedia: 0,
    }))

    await serverLog.info(event, 'BI', 'Relatório vendas por período gerado', {
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      agruparPor,
      registros: dadosFormatados.length,
    })

    return dadosFormatados
  }
  catch (error: any) {
    if (error.statusCode) throw error

    console.error('[BI/VendasPorPeriodo] Erro:', error)

    await serverLog.error(event, 'BI', 'Erro ao gerar relatório de vendas', {
      error: error.message,
      stack: error.stack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: error.message || 'Erro ao gerar relatório de vendas',
    })
  }
})
