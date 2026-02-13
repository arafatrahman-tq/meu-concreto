import { db } from '../../database/db'
import { formasPagamento } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const result = await db.query.formasPagamento.findFirst({
      where: and(eq(formasPagamento.id, parseInt(id)), isNull(formasPagamento.deletedAt)),
    })

    if (!result) {
      throw createError({ statusCode: 404, message: 'Forma de pagamento não encontrada' })
    }

    return result
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
