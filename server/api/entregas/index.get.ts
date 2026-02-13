import { db } from '../../database/db'
import { orcamentos } from '../../database/schema'
import { and, eq, isNull, isNotNull, gte, lte, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const query = getQuery(event)
    const start = query.start ? new Date(query.start as string) : new Date()
    const end = query.end
      ? new Date(query.end as string)
      : new Date(new Date().setDate(new Date().getDate() + 7))

    const whereConditions = [
      isNull(orcamentos.deletedAt),
      isNotNull(orcamentos.dataEntrega),
      gte(orcamentos.dataEntrega, start),
      lte(orcamentos.dataEntrega, end),
      eq(orcamentos.idEmpresa, user.idEmpresa),
    ]

    const result = await db.query.orcamentos.findMany({
      where: and(...whereConditions),
      orderBy: (orcamentos, { asc }) => [asc(orcamentos.dataEntrega)],
      with: {
        cliente: true,
        produto: true,
        motorista: true,
        caminhao: true,
        bomba: true,
      },
    })

    return result
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
