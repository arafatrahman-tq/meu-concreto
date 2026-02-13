import { db } from '../../database/db'
import { configuracoes } from '../../database/schema'
import { eq, or, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autorizado' })
    }

    if (user.admin !== 1) {
      throw createError({ statusCode: 403, message: 'Acesso restrito ao administrador' })
    }

    // Retorna todas as configurações (Globais e da Empresa do Admin)
    const result = await db.query.configuracoes.findMany({
      where: or(
        isNull(configuracoes.idEmpresa),
        eq(configuracoes.idEmpresa, user.idEmpresa),
      ),
    })

    return result
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
