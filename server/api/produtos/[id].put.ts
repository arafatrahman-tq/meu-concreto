import { db } from '../../database/db'
import { produtos } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID não fornecido',
      })
    }

    const body = await readBody(event)

    // Validar com schema compartilhado (partial para updates)
    const result = produtoSharedSchema.partial().safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: 'Dados do produto inválidos',
        data: result.error.errors.map(e => ({
          path: e.path,
          message: e.message,
        })),
      })
    }

    const data = result.data

    // Remover campos que não devem ser atualizados diretamente
    delete (data as any).id

    const [produtoAtualizado] = await db
      .update(produtos)
      .set({
        ...data,
        ativo: data.ativo !== undefined ? (data.ativo ? 1 : 0) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(produtos.id, parseInt(id)), isNull(produtos.deletedAt)))
      .returning()

    if (!produtoAtualizado) {
      throw createError({
        statusCode: 404,
        message: 'Produto não encontrado',
      })
    }

    // Registrar atualização
    await serverLog.info(event, 'PRODUTOS', `Produto atualizado: ${produtoAtualizado.produto}`, {
      id: produtoAtualizado.id,
    })

    return produtoAtualizado
  }
  catch (error: any) {
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }

    // Log de erro inesperado
    await serverLog.error(event, 'PRODUTOS', 'Erro inesperado ao atualizar produto', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao processar a solicitação',
    })
  }
})
