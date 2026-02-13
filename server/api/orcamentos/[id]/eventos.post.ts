import { db } from '../../../database/db'
import {
  orcamentos,
  entregaEventos,
  ordensServico,
} from '../../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { EntregaService } from '../../../services/entrega'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({
      statusCode: 400,
      message: 'ID do orçamento é obrigatório',
    })

  try {
    const body = await readBody(event)
    const { tipo, lat, lng, obs, idUsuario, idOrdemServico } = body

    // 1. Registrar o evento
    await db.insert(entregaEventos).values({
      idOrcamento: parseInt(id),
      idOrdemServico: idOrdemServico ? parseInt(idOrdemServico) : null,
      tipo,
      lat: lat?.toString(),
      lng: lng?.toString(),
      obs,
      idUsuario,
      timestamp: new Date(),
    })

    // 2. Atualizar status da Ordem de Serviço se vinculada
    if (idOrdemServico) {
      let statusOs = null
      if (tipo === 'SAIDA_USINA') statusOs = 'EM_TRANSITO'
      if (tipo === 'INICIO_DESCARGA') statusOs = 'DESCARREGANDO'
      if (tipo === 'FIM_DESCARGA') statusOs = 'CONCLUIDA'

      if (statusOs) {
        await db
          .update(ordensServico)
          .set({
            status: statusOs,
            dataSaida: tipo === 'SAIDA_USINA' ? new Date() : undefined,
            updatedAt: new Date(),
          })
          .where(eq(ordensServico.id, parseInt(idOrdemServico)))

        // Se concluiu a descarga, processa estoque
        if (statusOs === 'CONCLUIDA') {
          await EntregaService.processarConclusaoOS(
            parseInt(idOrdemServico),
            idUsuario || 'SISTEMA',
          )
        }
      }
    }

    // 3. Se for o último evento (RETORNO_USINA) e não tiver OS (legado), podemos calcular o tempo total
    if (tipo === 'RETORNO_USINA') {
      const eventos = await db.query.entregaEventos.findMany({
        where: eq(entregaEventos.idOrcamento, parseInt(id)),
        orderBy: [desc(entregaEventos.timestamp)],
      })

      const saida = eventos.find((e: any) => e.tipo === 'SAIDA_USINA')
      if (saida && saida.timestamp) {
        const diffMs
          = new Date().getTime() - new Date(saida.timestamp).getTime()
        const diffMin = Math.round(diffMs / 60000)

        await db
          .update(orcamentos)
          .set({ tempoCicloTotal: diffMin })
          .where(eq(orcamentos.id, parseInt(id)))
      }
    }

    return { success: true }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
