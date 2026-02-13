import { db } from '../../database/db'
import { orcamentos, orcamentoItens } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { serverLog } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)

    // Validar com schema compartilhado
    const result = orcamentoSharedSchema.safeParse(body)

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

    const [orcamento] = await db
      .insert(orcamentos)
      .values({
        ...orcamentoData,
        idEmpresa: user.idEmpresa,
        idUsuario: user.id,
        bombaNecessaria: orcamentoData.bombaNecessaria ? 1 : 0,
        createdAt: new Date(),
      })
      .returning()

    if (itens && itens.length > 0) {
      await db.insert(orcamentoItens).values(
        itens.map(item => ({
          ...item,
          idOrcamento: orcamento.id,
        })),
      )
    }

    // Registrar criação
    await serverLog.info(event, 'ORCAMENTOS', `Novo orçamento criado: #${orcamento.id}`, {
      id: orcamento.id,
      idEmpresa: user.idEmpresa,
      cliente: orcamento.nomeCliente,
    })

    setResponseStatus(event, 201)
    return orcamento
  }
  catch (error: any) {
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }

    // Log de erro inesperado
    await serverLog.error(event, 'ORCAMENTOS', 'Erro inesperado ao criar orçamento', {
      error: error.message,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro Interno',
      message: 'Erro ao processar a solicitação',
    })
  }
})
