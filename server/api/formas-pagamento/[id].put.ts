import { db } from '../../database/db'
import { formasPagamento } from '../../database/schema'
import { formaPgtoSchema } from '../../utils/validador'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const body = await readBody(event)
    const validatedData = formaPgtoSchema.parse(body)

    const result = await db.update(formasPagamento)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(formasPagamento.id, parseInt(id)), isNull(formasPagamento.deletedAt)))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Forma de pagamento não encontrada' })
    }

    return result[0]
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Erro de validação',
        data: error.errors,
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
