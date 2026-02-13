import { db } from '../../database/db'
import { empresas } from '../../database/schema'
import { empresaSchema } from '../../utils/validador'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const body = await readBody(event)
    const validatedData = empresaSchema.parse(body)

    const result = await db.update(empresas)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(eq(empresas.id, parseInt(id)), isNull(empresas.deletedAt)))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Empresa não encontrada' })
    }

    return result[0]
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
        data: error.issues || error.errors,
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Erro no Servidor',
      message: error.message,
    })
  }
})
