import { db } from '../../database/db'
import { configuracoesAsaas } from '../../database/schema'
import { asaasSchema } from '../../utils/validador'
import { requireAdmin } from '../../utils/auth'
import { serverLog } from '../../utils/logger'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Apenas admins podem alterar integrações financeiras
  const user = requireAdmin(event)

  try {
    const body = await readBody(event)
    const validatedData = asaasSchema.parse(body)

    // Buscar configuração existente para a empresa do usuário
    const existing = await db.query.configuracoesAsaas.findFirst({
      where: user.idEmpresa ? eq(configuracoesAsaas.idEmpresa, user.idEmpresa) : undefined,
    })

    const dataToSave = {
      apiKey: validatedData.apiKey,
      environment: validatedData.environment,
      webhookToken: validatedData.webhookToken,
      ativo: validatedData.ativo ? 1 : 0,
      idEmpresa: user.idEmpresa,
    }

    if (existing) {
      await db.update(configuracoesAsaas)
        .set({
          ...dataToSave,
          updatedAt: new Date(),
        })
        .where(eq(configuracoesAsaas.id, existing.id))

      await serverLog.info(event, 'INTEGRACOES', `Configuração Asaas atualizada para empresa ${user.idEmpresa}`)
    }
    else {
      await db.insert(configuracoesAsaas).values(dataToSave)
      await serverLog.info(event, 'INTEGRACOES', `Nova configuração Asaas criada para empresa ${user.idEmpresa}`)
    }

    return { message: 'Configurações salvas com sucesso' }
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
        data: error.issues || error.errors,
      })
    }
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
