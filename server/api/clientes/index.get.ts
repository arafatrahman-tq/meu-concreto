import { db } from '../../database/db'
import { clientes } from '../../database/schema'
import { and, eq, isNull, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const whereConditions = [
      isNull(clientes.deletedAt),
      eq(clientes.idEmpresa, user.idEmpresa),
    ]

    const result = await db.query.clientes.findMany({
      where: and(...whereConditions),
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
