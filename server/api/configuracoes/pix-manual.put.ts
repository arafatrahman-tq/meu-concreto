import { db } from '../../database/db'
import { configuracoesPixManual } from '../../database/schema'
import { configuracoesPixManualSchema } from '../../utils/validador'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  try {
    const validated = configuracoesPixManualSchema.parse(body)

    const dbData = {
      chavePix: validated.chavePix,
      beneficiario: validated.beneficiario,
      cidade: validated.cidade,
      ativo: validated.ativo ? 1 : 0,
      updatedAt: new Date(),
    }

    const existing = await db.query.configuracoesPixManual.findFirst({
      where: eq(configuracoesPixManual.idEmpresa, user.idEmpresa),
    })

    if (existing) {
      await db
        .update(configuracoesPixManual)
        .set(dbData)
        .where(eq(configuracoesPixManual.id, existing.id))
    }
    else {
      await db.insert(configuracoesPixManual).values({
        ...dbData,
        idEmpresa: user.idEmpresa,
      })
    }

    await serverLog.info(
      event,
      'CONFIG',
      'Configurações de Pix Manual atualizadas',
    )
    return { success: true }
  }
  catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }
})
