import { db } from '../../database/db'
import { pagamentos } from '../../database/schema'
import { pagamentoSchema } from '../../utils/validador'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const body = await readBody(event)
    const validatedData = pagamentoSchema.partial().parse(body)

    const result = await db.update(pagamentos)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(and(
        eq(pagamentos.id, parseInt(id)),
        eq(pagamentos.idEmpresa, user.idEmpresa),
        isNull(pagamentos.deletedAt),
      ))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Pagamento não encontrado' })
    }

    return result[0]
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro Interno',
      message: error.message,
    })
  }
})
