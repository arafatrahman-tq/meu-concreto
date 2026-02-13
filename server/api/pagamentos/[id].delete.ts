import { db } from '../../database/db'
import { pagamentos } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const result = await db.update(pagamentos)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(pagamentos.id, parseInt(id)),
        eq(pagamentos.idEmpresa, user.idEmpresa),
        isNull(pagamentos.deletedAt),
      ))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Pagamento não encontrado' })
    }

    return { message: 'Pagamento removido com sucesso (soft delete)' }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro Interno',
      message: error.message,
    })
  }
})
