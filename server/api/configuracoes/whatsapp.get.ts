import { db } from '../../database/db'
import { configuracoesWhatsapp } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const config = await db.query.configuracoesWhatsapp.findFirst({
      where: user.idEmpresa ? eq(configuracoesWhatsapp.idEmpresa, user.idEmpresa) : undefined,
    })

    const response = config
      ? {
          ...config,
          notificaContasPagar: config.notificaContasPagar === 1,
          notificaCobrancas: config.notificaCobrancas === 1,
          notificaNovosOrcamentos: config.notificaNovosOrcamentos === 1,
          ativo: config.ativo === 1,
        }
      : {
          instanceUrl: '',
          apiKey: '',
          notificaContasPagar: false,
          notificaCobrancas: false,
          notificaNovosOrcamentos: false,
          ativo: false,
        }

    // Mascarar a API Key para não-admins
    if (user.admin !== 1 && response.apiKey) {
      response.apiKey = '********' + response.apiKey.slice(-4)
    }

    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
