import { db } from '../../database/db'
import { configuracoes } from '../../database/schema'
import { eq, or, isNull, and } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  try {
    // Retorna apenas chaves públicas ou de categoria FEATURE_FLAG
    const result = await db.query.configuracoes.findMany({
      where: eq(configuracoes.categoria, 'FEATURE_FLAG'),
      columns: {
        chave: true,
        valor: true,
        idEmpresa: true,
      },
    })

    return result
  }
  catch (error: any) {
    return []
  }
})
