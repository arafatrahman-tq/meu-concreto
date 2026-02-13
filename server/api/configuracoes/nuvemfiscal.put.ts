import { db } from '../../database/db'
import { configuracoesNuvemFiscal } from '../../database/schema'
import { nuvemFiscalSchema } from '../../utils/validador'
import { nuvemfiscalService } from '../../utils/nuvemfiscal'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event)
  const idEmpresa = user.idEmpresa!

  try {
    const body = await readBody(event)
    const validatedData = nuvemFiscalSchema.parse(body)

    const existing = await db.query.configuracoesNuvemFiscal.findFirst({
      where: eq(configuracoesNuvemFiscal.idEmpresa, idEmpresa),
    })

    const dataToSave = {
      ...validatedData,
      ativo: validatedData.ativo ? 1 : 0,
      idEmpresa,
      updatedAt: new Date(),
    }

    if (existing) {
      await db.update(configuracoesNuvemFiscal)
        .set(dataToSave)
        .where(eq(configuracoesNuvemFiscal.id, existing.id))
    }
    else {
      await db.insert(configuracoesNuvemFiscal).values(dataToSave)
    }

    // Automação: Sincronizar com Nuvem Fiscal API
    // Tentamos sincronizar tudo. Se falhar algum passo opcional (como certificado sem dados), logamos.
    const automationStatus = { company: false, certificate: false, nfse: false }

    try {
      await nuvemfiscalService.syncCompany(idEmpresa)
      automationStatus.company = true

      if (validatedData.certificado) {
        await nuvemfiscalService.syncCertificate(idEmpresa)
        automationStatus.certificate = true
      }

      if (validatedData.nfseSerie && validatedData.nfseLote) {
        await nuvemfiscalService.syncNfseConfig(idEmpresa)
        automationStatus.nfse = true
      }
    }
    catch (autoError: any) {
      console.error('Erro na automação Nuvem Fiscal:', autoError.message)
      // Não barramos o salvamento local, mas avisamos o erro de sincronização
      return {
        message: 'Configurações salvas localmente, mas houve erro na sincronização com a Nuvem Fiscal API.',
        error: autoError.message,
        status: automationStatus,
      }
    }

    return {
      message: 'Configurações da Nuvem Fiscal sincronizadas com sucesso',
      status: automationStatus,
    }
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
