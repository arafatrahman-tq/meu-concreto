import { db } from '../../database/db'
import { motoristas } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)

    // Validação com schema compartilhado
    const result = motoristaSharedSchema.safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: 'Dados inválidos',
        data: result.error.errors.map(e => ({
          path: e.path,
          message: e.message,
        })),
      })
    }

    const data = result.data

    const [motorista] = await db
      .insert(motoristas)
      .values({
        nome: data.nome,
        telefone: data.telefone,
        cnh: data.cnh,
        pin: data.pin,
        idCaminhao: data.idCaminhao,
        ativo: data.ativo ? 1 : 0,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      })
      .returning()

    await serverLog.info(event, 'MOTORISTAS', 'Motorista cadastrado', {
      id: motorista.id,
      nome: motorista.nome,
    })

    setResponseStatus(event, 201)
    return motorista
  }
  catch (error: any) {
    if (error.statusCode) throw error

    await serverLog.error(event, 'MOTORISTAS', 'Erro ao cadastrar motorista', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao cadastrar motorista',
    })
  }
})
