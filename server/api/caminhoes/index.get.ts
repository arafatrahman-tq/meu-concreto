import { db } from '../../database/db'
import { caminhoes } from '../../database/schema'
import { and, eq, isNull, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)

    const whereConditions = [
      isNull(caminhoes.deletedAt),
      eq(caminhoes.idEmpresa, user.idEmpresa),
    ]

    const result = await db.query.caminhoes.findMany({
      where: and(...whereConditions),
      orderBy: (caminhoes, { asc }) => [asc(caminhoes.placa)],
      with: {
        empresa: true,
      },
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
