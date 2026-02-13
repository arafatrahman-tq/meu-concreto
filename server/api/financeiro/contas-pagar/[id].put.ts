import { db } from '../../../database/db'
import { contasPagar } from '../../../database/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { serverLog } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    // Validação parcial com schema compartilhado
    const result = contaPagarSharedSchema.partial().safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: 'Dados inválidos',
        data: result.error.errors.map(e => ({
          path: e.path,
          message: e.message,
        })),
      })
    }

    const data = result.data
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // Remove idEmpresa das atualizações (não deve ser alterado)
    delete updateData.idEmpresa

    const [conta] = await db
      .update(contasPagar)
      .set(updateData)
      .where(and(
        eq(contasPagar.id, id),
        eq(contasPagar.idEmpresa, user.idEmpresa),
      ))
      .returning()

    if (!conta) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Não Encontrado',
        message: 'Conta a pagar não encontrada',
      })
    }

    await serverLog.info(event, 'FINANCEIRO', 'Conta a pagar atualizada', {
      id: conta.id,
      descricao: conta.descricao,
    })

    return conta
  }
  catch (error: any) {
    if (error.statusCode) throw error

    await serverLog.error(event, 'FINANCEIRO', 'Erro ao atualizar conta a pagar', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao atualizar conta a pagar',
    })
  }
})
