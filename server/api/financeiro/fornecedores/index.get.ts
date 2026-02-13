import { db } from '../../../database/db'
import { fornecedores } from '../../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' })

  return await db.query.fornecedores.findMany({
    where: and(
      eq(fornecedores.idEmpresa, user.idEmpresa),
      isNull(fornecedores.deletedAt),
    ),
    orderBy: (fornecedores, { asc }) => [asc(fornecedores.nome)],
  })
})
