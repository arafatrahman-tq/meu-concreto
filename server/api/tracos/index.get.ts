import { db } from '../../database/db'
import { tracos } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)

  const whereConditions = [
    eq(tracos.idEmpresa, user.idEmpresa),
    isNull(tracos.deletedAt),
  ]

  if (query.idProduto) {
    whereConditions.push(eq(tracos.idProduto, Number(query.idProduto)))
  }

  const result = await db.query.tracos.findMany({
    where: and(...whereConditions),
    with: {
      itens: {
        with: {
          insumo: true,
        },
      },
      produto: true,
    },
    orderBy: (tracos, { desc }) => [desc(tracos.createdAt)],
  })

  return result
})
