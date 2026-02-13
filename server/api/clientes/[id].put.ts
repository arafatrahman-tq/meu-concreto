import { db } from '../../database/db'
import { clientes } from '../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID não fornecido',
      })
    }

    const body = await readBody(event)

    // Validar com schema compartilhado (partial para updates)
    const result = clienteSharedSchema.partial().safeParse(body)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro de Validação',
        message: 'Dados do cliente inválidos',
        data: result.error.errors.map(e => ({
          path: e.path,
          message: e.message,
        })),
      })
    }

    const data = result.data

    // Remover campos que não devem ser atualizados
    delete data.id
    delete data.idEmpresa
    delete data.cidadeIbge

    const [clienteAtualizado] = await db.update(clientes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(clientes.id, parseInt(id)),
        eq(clientes.idEmpresa, user.idEmpresa),
        isNull(clientes.deletedAt),
      ))
      .returning()

    if (!clienteAtualizado) {
      throw createError({
        statusCode: 404,
        message: 'Cliente não encontrado',
      })
    }

    // Registrar atualização
    await serverLog.info(event, 'CLIENTES', `Cliente atualizado: ${clienteAtualizado.nome}`, {
      id: clienteAtualizado.id,
      idEmpresa: user.idEmpresa,
    })

    return clienteAtualizado
  }
  catch (error: any) {
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }

    // Log de erro inesperado
    await serverLog.error(event, 'CLIENTES', 'Erro inesperado ao atualizar cliente', {
      error: error.message,
      stack: error.stack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao processar a solicitação',
    })
  }
})
