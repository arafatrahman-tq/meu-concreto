import { db } from '../../database/db'
import { configuracoes } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  if (user.admin !== 1) {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }

  try {
    const body = await readBody(event)
    const { reforma2026, ambiente } = body

    const settings = [
      { chave: 'MODO_FISCAL_REFORMA_2026', valor: reforma2026 ? 'true' : 'false', categoria: 'NEGOCIO' },
      { chave: 'AMBIENTE_FISCAL', valor: ambiente || 'homologacao', categoria: 'NEGOCIO' },
    ]

    for (const s of settings) {
      const existing = await db.query.configuracoes.findFirst({
        where: and(
          eq(configuracoes.idEmpresa, user.idEmpresa),
          eq(configuracoes.chave, s.chave),
        ),
      })

      if (existing) {
        await db.update(configuracoes)
          .set({ valor: s.valor, updatedAt: new Date() })
          .where(eq(configuracoes.id, existing.id))
      }
      else {
        await db.insert(configuracoes).values({
          chave: s.chave,
          valor: s.valor,
          categoria: s.categoria,
          idEmpresa: user.idEmpresa,
        })
      }
    }

    return { success: true }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao salvar configurações fiscais',
    })
  }
})
