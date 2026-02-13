import { db } from '../../database/db'
import { insumos } from '../../database/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    // Validação parcial com schema compartilhado
    const result = insumoSharedSchema.partial().safeParse(body)

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

    const [insumo] = await db
      .update(insumos)
      .set(updateData)
      .where(and(
        eq(insumos.id, id),
        eq(insumos.idEmpresa, user.idEmpresa),
      ))
      .returning()

    if (!insumo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Não Encontrado',
        message: 'Insumo não encontrado',
      })
    }

    await serverLog.info(event, 'INSUMOS', 'Insumo atualizado', {
      id: insumo.id,
      nome: insumo.nome,
    })

    return insumo
  }
  catch (error: any) {
    if (error.statusCode) throw error

    await serverLog.error(event, 'INSUMOS', 'Erro ao atualizar insumo', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao atualizar insumo',
    })
  }
})
