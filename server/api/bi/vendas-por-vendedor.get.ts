import { db } from '../../database/db'
import { vendas, orcamentos, vendedores } from '../../database/schema'
import { eq, and, gte, lte, isNull, sql, count, sum, desc } from 'drizzle-orm'
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
 * GET /api/bi/vendas-por-vendedor
 *
 * Retorna ranking de vendas por vendedor
 * Nota: idVendedor está na tabela orcamentos, não em vendas
 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const query = getQuery(event)

    // Tentar parse com filtroDashboardSchema primeiro (suporta periodo)
    const dashboardResult = filtroDashboardSchema.safeParse(query)

    let dataInicio: Date
    let dataFim: Date

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
          break
        case '6m':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate())
          break
        case '1a':
          dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate())
          break
        case '30d':
        default:
          dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }
    else {
      // Fallback para dataInicio/dataFim diretos
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
    }

    // idVendedor está na tabela orcamentos, então precisamos fazer join
    const resultado = await db
      .select({
        idVendedor: orcamentos.idVendedor,
        nomeVendedor: sql<string>`COALESCE(${vendedores.nome}, 'Sem Vendedor')`,
        totalVendas: count(vendas.id),
        valorTotal: sum(vendas.valorTotal),
        comissao: sql<number>`ROUND(${sum(vendas.valorTotal)} * 0.05)`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .leftJoin(vendedores, eq(orcamentos.idVendedor, vendedores.id))
      .where(and(
        isNull(vendas.deletedAt),
        eq(vendas.idEmpresa, user.idEmpresa),
        gte(vendas.dataVenda, dataInicio),
        lte(vendas.dataVenda, dataFim),
      ))
      .groupBy(orcamentos.idVendedor)
      .orderBy(desc(sum(vendas.valorTotal)))

    // Calcular percentual de crescimento
    const totalGeral = resultado.reduce((acc, item) => acc + Number(item.valorTotal || 0), 0)

    const dadosFormatados = resultado.map(item => ({
      idVendedor: item.idVendedor || 0,
      nomeVendedor: item.nomeVendedor,
      totalVendas: item.totalVendas,
      valorTotal: Number(item.valorTotal || 0),
      comissao: Number(item.comissao || 0),
      percentualCrescimento: totalGeral > 0 ? Math.round((Number(item.valorTotal || 0) / totalGeral) * 100) : 0,
    }))

    await serverLog.info(event, 'BI', 'Relatório vendas por vendedor gerado', {
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      registros: dadosFormatados.length,
    })

    return dadosFormatados
  }
  catch (error: any) {
    if (error.statusCode) throw error

    console.error('[BI/VendasPorVendedor] Erro:', error)

    await serverLog.error(event, 'BI', 'Erro ao gerar relatório por vendedor', {
      error: error.message,
      stack: error.stack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: error.message || 'Erro ao gerar relatório por vendedor',
    })
  }
})
