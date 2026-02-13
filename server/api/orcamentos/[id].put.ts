import { db } from '../../database/db'
import { orcamentos, orcamentoItens } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'ID não fornecido' })
    }

    const body = await readBody(event)

    // Validar com schema compartilhado (partial para updates)
    const result = orcamentoSharedSchema.partial().safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: 'Dados do orçamento inválidos',
        data: result.error.errors.map(e => ({
          path: e.path,
          message: e.message,
        })),
      })
    }

    const data = result.data
    const { itens, ...orcamentoData } = data

    // Impedir alteração de campos sensíveis
    delete (orcamentoData as any).id
    delete (orcamentoData as any).idEmpresa
    delete (orcamentoData as any).idUsuario

    const [orcamento] = await db
      .update(orcamentos)
      .set({
        ...orcamentoData,
        bombaNecessaria:
          orcamentoData.bombaNecessaria !== undefined
            ? orcamentoData.bombaNecessaria
              ? 1
              : 0
            : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orcamentos.id, parseInt(id)),
          eq(orcamentos.idEmpresa, user.idEmpresa),
          isNull(orcamentos.deletedAt),
        ),
      )
      .returning()

    if (!orcamento) {
      throw createError({
        statusCode: 404,
        message: 'Orçamento não encontrado',
      })
    }

    // Sincronizar Itens (Simples: Deleta e insere novamente)
    if (itens) {
      await db
        .delete(orcamentoItens)
        .where(eq(orcamentoItens.idOrcamento, orcamento.id))
      if (itens.length > 0) {
        await db.insert(orcamentoItens).values(
          itens.map(item => ({
            ...item,
            idOrcamento: orcamento.id,
          })),
        )
      }
    }

    // Registrar atualização
    await serverLog.info(event, 'ORCAMENTOS', `Orçamento atualizado: #${orcamento.id}`, {
      id: orcamento.id,
      idEmpresa: user.idEmpresa,
      cliente: orcamento.nomeCliente,
    })

    return orcamento
  }
  catch (error: any) {
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }

    // Log de erro inesperado
    await serverLog.error(event, 'ORCAMENTOS', 'Erro inesperado ao atualizar orçamento', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao processar a solicitação',
    })
  }
})
