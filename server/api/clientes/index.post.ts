import { db } from '../../database/db'
import { clientes } from '../../database/schema'
import { serverLog } from '../../utils/logger'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)

    // Validar com schema compartilhado
    const result = clienteSharedSchema.safeParse(body)

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

    const [novoCliente] = await db.insert(clientes).values({
      nome: data.nome,
      cpfCnpj: data.cpfCnpj,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco,
      enderecoEntrega: data.enderecoEntrega,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      numero: data.numero,
      complemento: data.complemento,
      cidadeIbge: data.cidadeIbge,
      idEmpresa: user.idEmpresa,
      createdAt: new Date(),
    }).returning()

    if (!novoCliente) {
      throw createError({
        statusCode: 500,
        message: 'Falha ao criar cliente',
      })
    }

    // Registrar criação de cliente
    await serverLog.info(event, 'CLIENTES', `Novo cliente cadastrado: ${data.nome}`, {
      id: novoCliente.id,
      idEmpresa: user.idEmpresa,
    })

    setResponseStatus(event, 201)
    return novoCliente
  }
  catch (error: any) {
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }

    // Log de erro inesperado
    await serverLog.error(event, 'CLIENTES', 'Erro inesperado ao criar cliente', {
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
