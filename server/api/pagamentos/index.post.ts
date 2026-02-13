import { db } from '../../database/db'
import { pagamentos } from '../../database/schema'
import { pagamentoSchema } from '../../utils/validador'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)
    const validatedData = pagamentoSchema.parse(body)

    const result = await db.insert(pagamentos).values({
      ...validatedData,
      idEmpresa: user.idEmpresa,
      createdAt: new Date(),
    }).returning()

    setResponseStatus(event, 201)
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
