import { db } from '../../database/db'
import { motoristas } from '../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))

    const result = await db.delete(motoristas)
      .where(eq(motoristas.id, id))
      .returning()

    if (!result.length) {
      throw createError({
        statusCode: 404,
        message: 'Motorista não encontrado',
      })
    }

    return { message: 'Motorista removido com sucesso' }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
