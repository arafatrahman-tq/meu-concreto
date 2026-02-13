import { db } from '../../../database/db'
import { vendas, orcamentos } from '../../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { FiscalService } from '../../../services/fiscal'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'ID da venda não fornecido' })

  try {
    const venda = await db.query.vendas.findFirst({
      where: and(eq(vendas.id, parseInt(id)), isNull(vendas.deletedAt)),
      with: {
        orcamento: true,
      },
    })

    if (!venda) {
      throw createError({ statusCode: 404, message: 'Venda não encontrada' })
    }

    const result = await FiscalService.emitNfse(venda.idEmpresa, venda)

    if (!result.sucesso) {
      throw createError({
        statusCode: 400,
        message: result.error || 'Erro ao emitir NFS-e',
      })
    }

    // Atualizar status da venda e dados da nota
    await db.update(vendas).set({
      status: 'NF_EMITIDA',
      nfseNumero: result.numero?.toString(),
      nfseLink: result.link,
      updatedAt: new Date(),
    }).where(eq(vendas.id, venda.id))

    return {
      message: 'NFS-e emitida com sucesso',
      numero: result.numero,
      link: result.link,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao emitir NFS-e',
    })
  }
})
