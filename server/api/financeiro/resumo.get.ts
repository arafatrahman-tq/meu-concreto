import { db } from '../../database/db'
import { pagamentos, contasPagar } from '../../database/schema'
import { and, isNull, eq, lt, sql, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const idEmpresa = user.idEmpresa
    const now = new Date()

    // --- CONTAS A RECEBER (Pagamentos de Vendas) ---
    const receivables = await db
      .select({
        status: pagamentos.status,
        total: sql<number>`sum(${pagamentos.valor})`,
        count: sql<number>`count(${pagamentos.id})`,
      })
      .from(pagamentos)
      .where(
        and(
          eq(pagamentos.idEmpresa, idEmpresa),
          isNull(pagamentos.deletedAt),
        ),
      )
      .groupBy(pagamentos.status)

    const lateReceivables = await db
      .select({
        total: sql<number>`sum(${pagamentos.valor})`,
      })
      .from(pagamentos)
      .where(
        and(
          eq(pagamentos.idEmpresa, idEmpresa),
          isNull(pagamentos.deletedAt),
          eq(pagamentos.status, 'PENDENTE'),
          lt(pagamentos.dataVencimento, now),
        ),
      )

    // --- CONTAS A PAGAR ---
    const payables = await db
      .select({
        status: contasPagar.status,
        total: sql<number>`sum(${contasPagar.valor})`,
        count: sql<number>`count(${contasPagar.id})`,
      })
      .from(contasPagar)
      .where(
        and(
          eq(contasPagar.idEmpresa, idEmpresa),
          isNull(contasPagar.deletedAt),
        ),
      )
      .groupBy(contasPagar.status)

    const latePayables = await db
      .select({
        total: sql<number>`sum(${contasPagar.valor})`,
      })
      .from(contasPagar)
      .where(
        and(
          eq(contasPagar.idEmpresa, idEmpresa),
          isNull(contasPagar.deletedAt),
          eq(contasPagar.status, 'PENDENTE'),
          lt(contasPagar.dataVencimento, now),
        ),
      )

    // Processamento de totais
    const summary = {
      receber: {
        total: receivables.reduce(
          (acc, curr) => acc + (Number(curr.total) || 0),
          0,
        ),
        pendente: receivables.find(r => r.status === 'PENDENTE')?.total || 0,
        pago: receivables.find(r => r.status === 'PAGO')?.total || 0,
        atrasado: Number(lateReceivables[0]?.total) || 0,
      },
      pagar: {
        total: payables.reduce(
          (acc, curr) => acc + (Number(curr.total) || 0),
          0,
        ),
        pendente: payables.find(r => r.status === 'PENDENTE')?.total || 0,
        pago: payables.find(r => r.status === 'PAGO')?.total || 0,
        atrasado: Number(latePayables[0]?.total) || 0,
      },
      fluxoCaixa: 0,
      indiceInadimplencia: 0,
    }

    summary.fluxoCaixa = summary.receber.pago - summary.pagar.pago
    const totalExpected = summary.receber.pendente + summary.receber.pago
    summary.indiceInadimplencia
      = totalExpected > 0 ? (summary.receber.atrasado / totalExpected) * 100 : 0

    return summary
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro Interno',
      message: error.message,
    })
  }
})
