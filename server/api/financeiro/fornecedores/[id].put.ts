import { db } from '../../../database/db'
import { fornecedores } from '../../../database/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { serverLog } from '../../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    // Validação parcial com schema compartilhado
    const result = fornecedorSharedSchema.partial().safeParse(body)

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
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // Remove idEmpresa das atualizações (não deve ser alterado)
    delete updateData.idEmpresa

    const [fornecedor] = await db
      .update(fornecedores)
      .set(updateData)
      .where(and(
        eq(fornecedores.id, id),
        eq(fornecedores.idEmpresa, user.idEmpresa),
      ))
      .returning()

    if (!fornecedor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Não Encontrado',
        message: 'Fornecedor não encontrado',
      })
    }

    await serverLog.info(event, 'FINANCEIRO', 'Fornecedor atualizado', {
      id: fornecedor.id,
      nome: fornecedor.nome,
    })

    return fornecedor
  }
  catch (error: any) {
    if (error.statusCode) throw error

    await serverLog.error(event, 'FINANCEIRO', 'Erro ao atualizar fornecedor', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao atualizar fornecedor',
    })
  }
})
