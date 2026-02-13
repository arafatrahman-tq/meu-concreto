import { db } from '../../database/db'
import { orcamentos } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const result = await db.update(orcamentos)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(orcamentos.id, parseInt(id)),
        eq(orcamentos.idEmpresa, user.idEmpresa),
        isNull(orcamentos.deletedAt),
      ))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Orçamento não encontrado' })
    }

    return { message: 'Orçamento removido com sucesso (soft delete)' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro Interno',
      message: error.message,
    })
  }
})
