import { db } from '../../database/db'
import { tracos, tracoItens } from '../../database/schema'
import { tracoSchema } from '../../utils/validador'
import { serverLog } from '../../utils/logger'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)
    const validatedData = tracoSchema.parse({
      ...body,
      idEmpresa: user.idEmpresa,
    })

    // Usar transação para garantir integridade
    return await db.transaction(async (tx) => {
      const resultTraco = await tx.insert(tracos).values({
        idProduto: validatedData.idProduto,
        nome: validatedData.nome,
        descricao: validatedData.descricao,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      }).returning()

      const novoTraco = resultTraco[0]

      if (!novoTraco) {
        throw createError({
          statusCode: 500,
          message: 'Falha ao criar traço',
        })
      }

      if (validatedData.itens && validatedData.itens.length > 0) {
        await tx.insert(tracoItens).values(
          validatedData.itens.map(item => ({
            idTraco: novoTraco.id,
            idInsumo: item.idInsumo,
            quantidade: item.quantidade,
          })),
        )
      }

      await serverLog.info(event, 'TRACOS', `Novo traço cadastrado: ${validatedData.nome}`, { id: novoTraco.id })

      setResponseStatus(event, 201)
      return novoTraco
    })
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: error.issues.map((e: any) => e.message).join(', '),
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
