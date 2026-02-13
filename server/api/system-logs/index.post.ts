import { db } from '../../database/db'
import { logs } from '../../database/schema'
import { logSchema } from '../../utils/validador'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = logSchema.parse(body)

    const result = await db
      .insert(logs)
      .values({
        ...validatedData,
        ip: validatedData.ip || getRequestIP(event),
        userAgent:
          validatedData.userAgent || getRequestHeader(event, 'user-agent'),
        timestamp: new Date(),
      })
      .returning()

    setResponseStatus(event, 201)
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
      statusCode: 500,
      message: error.message,
    })
  }
})
