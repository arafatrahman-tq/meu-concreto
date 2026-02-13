import { db } from '../../../database/db'
import { entregaEventos } from '../../../database/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID do orçamento é obrigatório' })

  try {
    const eventos = await db.query.entregaEventos.findMany({
      where: eq(entregaEventos.idOrcamento, parseInt(id)),
      orderBy: [desc(entregaEventos.timestamp)],
      with: {
        usuario: true,
      },
    })

    return eventos
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
