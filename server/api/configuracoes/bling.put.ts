import { db } from '../../database/db'
import { configuracoesBling } from '../../database/schema'
import { blingSchema } from '../../utils/validador'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event)

  try {
    const body = await readBody(event)
    const validatedData = blingSchema.parse(body)

    const existing = await db.query.configuracoesBling.findFirst({
      where: user.idEmpresa ? eq(configuracoesBling.idEmpresa, user.idEmpresa) : undefined,
    })

    const dataToSave = {
      ...validatedData,
      ativo: validatedData.ativo ? 1 : 0,
      idEmpresa: user.idEmpresa,
      updatedAt: new Date(),
    }

    if (existing) {
      await db.update(configuracoesBling)
        .set(dataToSave)
        .where(eq(configuracoesBling.id, existing.id))
      return { message: 'Configurações do Bling atualizadas' }
    }
    else {
      await db.insert(configuracoesBling).values(dataToSave)
      return { message: 'Configurações do Bling criadas' }
    }
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
      statusCode: 500,
      message: error.message,
    })
  }
})
