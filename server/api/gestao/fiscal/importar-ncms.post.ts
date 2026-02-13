import { db } from '../../../database/db'
import { produtos } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { serverLog } from '../../../utils/logger'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  if (user.admin !== 1) {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }

  try {
    const body = await readBody(event)
    const { ncm, applyAll } = body

    if (!ncm || ncm.length < 8) {
      throw createError({ statusCode: 400, message: 'NCM inválido' })
    }

    if (applyAll) {
      const result = await db.update(produtos)
        .set({ ncm })
        .where(eq(produtos.ativo, 1))

      await serverLog.info(event, 'FISCAL', `Saneamento de NCM realizado em massa: ${ncm}`, {
        alvo: 'TODOS_PRODUTOS_ATIVOS',
      })

      return { message: 'NCM aplicado a todos os produtos ativos com sucesso.' }
    }

    return { message: 'Nada alterado.' }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao importar NCMs',
    })
  }
})
