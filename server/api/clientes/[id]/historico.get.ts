import { db } from '../../../database/db'
import { clientes, orcamentos, vendas, pagamentos } from '../../../database/schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const clientId = parseInt(id)

    const client = await db.query.clientes.findFirst({
      where: and(eq(clientes.id, clientId), isNull(clientes.deletedAt)),
    })

    if (!client) {
      throw createError({ statusCode: 404, message: 'Cliente não encontrado' })
    }

    // Buscar Orçamentos do cliente
    const clientOrcamentos = await db.query.orcamentos.findMany({
      where: and(eq(orcamentos.idCliente, clientId), isNull(orcamentos.deletedAt)),
      orderBy: [desc(orcamentos.createdAt)],
      with: {
        produto: true,
        vendedor: true,
      },
    })

    const orcamentoIds = clientOrcamentos.map(o => o.id)

    // Buscar Vendas associadas a esses orçamentos
    let clientVendas: any[] = []
    if (orcamentoIds.length > 0) {
      const allVendas = await db.query.vendas.findMany({
        where: and(isNull(vendas.deletedAt)),
        orderBy: [desc(vendas.createdAt)],
        with: {
          orcamento: true,
        },
      })
      clientVendas = allVendas.filter(v => orcamentoIds.includes(v.idOrcamento))
    }

    // Buscar Pagamentos das vendas identificadas
    const vendaIds = clientVendas.map(v => v.id)
    let clientPagamentos: any[] = []

    if (vendaIds.length > 0) {
      const allPagamentos = await db.query.pagamentos.findMany({
        where: and(isNull(pagamentos.deletedAt)),
        orderBy: [desc(pagamentos.dataVencimento)],
        with: {
          venda: {
            with: {
              orcamento: true,
            },
          },
        },
      })
      clientPagamentos = allPagamentos.filter(p => vendaIds.includes(p.idVenda))
    }

    return {
      client,
      orcamentos: clientOrcamentos,
      vendas: clientVendas,
      pagamentos: clientPagamentos,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
