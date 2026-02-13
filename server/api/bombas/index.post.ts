import { db } from '../../database/db'
import { bombas } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)

    // Validação com schema compartilhado
    const result = bombaSharedSchema.safeParse(body)

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

    const [novaBomba] = await db
      .insert(bombas)
      .values({
        nome: data.nome,
        tipo: data.tipo,
        placa: data.placa,
        ativo: data.ativo ? 1 : 0,
        idEmpresa: user.idEmpresa,
      })
      .returning()

    if (!novaBomba) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro Interno',
        message: 'Falha ao criar bomba',
      })
    }

    await serverLog.info(event, 'BOMBAS', 'Bomba cadastrada', {
      id: novaBomba.id,
      nome: novaBomba.nome,
    })

    return novaBomba
  }
  catch (error: any) {
    if (error.statusCode) throw error

    await serverLog.error(event, 'BOMBAS', 'Erro ao criar bomba', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao criar bomba',
    })
  }
})
