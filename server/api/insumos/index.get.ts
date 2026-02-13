import { db } from '../../database/db'
import { insumos } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  // Lista apenas insumos da empresa do usuário que não foram deletados
  const result = await db.query.insumos.findMany({
    where: and(
      eq(insumos.idEmpresa, user.idEmpresa),
      isNull(insumos.deletedAt),
    ),
    orderBy: (insumos, { asc }) => [asc(insumos.nome)],
  })

  return result
})
