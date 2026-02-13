import { db } from '../../database/db'
import { contasPagar } from '../../database/schema'
import { and, isNull, eq, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const query = getQuery(event)
    const status = query.status as string

    const whereConditions = [
      isNull(contasPagar.deletedAt),
      eq(contasPagar.idEmpresa, user.idEmpresa),
    ]

    if (status) {
      whereConditions.push(eq(contasPagar.status, status))
    }

    const result = await db.query.contasPagar.findMany({
      where: and(...whereConditions),
      with: {
        fornecedor: true,
      },
      orderBy: (contasPagar, { asc }) => [asc(contasPagar.dataVencimento)],
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
