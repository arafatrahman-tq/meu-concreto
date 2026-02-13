import { db } from '../../database/db'
import { vendedores } from '../../database/schema'
import { vendedorSchema } from '../../utils/validador'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const body = await readBody(event)
    const validatedData = vendedorSchema.parse(body)

    const result = await db.update(vendedores)
      .set({
        ...validatedData,
        ativo: validatedData.ativo ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(and(
        eq(vendedores.id, parseInt(id)),
        eq(vendedores.idEmpresa, user.idEmpresa),
        isNull(vendedores.deletedAt),
      ))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Vendedor não encontrado' })
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
