import { db } from '../../../database/db'
import { ordensServico } from '../../../database/schema'
import { ordemServicoSchema } from '../../../utils/validador'
import { requireAuth } from '../../../utils/auth'
import { serverLog } from '../../../utils/logger'
import { EntregaService } from '../../../services/entrega'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)
    const validatedData = ordemServicoSchema.parse(body)

    const numeroTicket
      = validatedData.numeroTicket
        || (await EntregaService.gerarProximoNumeroTicket(user.idEmpresa))

    const [novaOs] = await db
      .insert(ordensServico)
      .values({
        ...validatedData,
        numeroTicket,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      })
      .returning()

    await serverLog.info(
      event,
      'ENTREGAS',
      `Nova Ordem de Serviço gerada: ${novaOs.numeroTicket || novaOs.id}`,
      { id: novaOs.id, idOrcamento: novaOs.idOrcamento },
    )

    setResponseStatus(event, 201)
    return novaOs
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: error.issues
          ? error.issues.map((e: any) => e.message).join(', ')
          : error.message,
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro Interno',
      message: error.message,
    })
  }
})
