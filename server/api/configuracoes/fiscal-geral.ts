import { db } from '../../database/db'
import { configuracoes } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const idEmpresa = user.idEmpresa

  if (event.method === 'GET') {
    const config = await db.query.configuracoes.findFirst({
      where: and(
        eq(configuracoes.idEmpresa, idEmpresa),
        eq(configuracoes.chave, 'FISCAL_GERAL'),
      ),
    })

    if (!config) {
      return {
        reforma2026: true,
        ambiente: 'sandbox',
      }
    }

    try {
      return JSON.parse(config.valor)
    }
    catch (e) {
      return { reforma2026: true, ambiente: 'sandbox' }
    }
  }

  if (event.method === 'POST') {
    if (user.admin !== 1) {
      throw createError({
        statusCode: 403,
        message: 'Apenas administradores podem alterar configurações fiscais',
      })
    }

    const body = await readBody(event)

    // Upsert logic
    const existing = await db.query.configuracoes.findFirst({
      where: and(
        eq(configuracoes.idEmpresa, idEmpresa),
        eq(configuracoes.chave, 'FISCAL_GERAL'),
      ),
    })

    if (existing) {
      await db.update(configuracoes)
        .set({
          valor: JSON.stringify(body),
          updatedAt: new Date(),
        })
        .where(eq(configuracoes.id, existing.id))
    }
    else {
      await db.insert(configuracoes).values({
        idEmpresa,
        chave: 'FISCAL_GERAL',
        valor: JSON.stringify(body),
        categoria: 'NEGOCIO',
        descricao: 'Configurações gerais do motor fiscal e Reforma 2026',
      })
    }

    return { success: true }
  }
})
