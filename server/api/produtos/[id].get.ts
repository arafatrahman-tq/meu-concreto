import { db } from '../../database/db'
import { produtos } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const result = await db.query.produtos.findFirst({
      where: and(eq(produtos.id, parseInt(id)), isNull(produtos.deletedAt)),
    })

    if (!result) {
      throw createError({ statusCode: 404, message: 'Produto não encontrado' })
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
