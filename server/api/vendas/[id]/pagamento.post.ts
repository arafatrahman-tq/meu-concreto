import { db } from '../../../database/db'
import { vendas, pagamentos } from '../../../database/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { PaymentService } from '../../../services/payments'
import { sendPaymentLink, sendPixCode } from '../../../utils/whatsapp'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const tipoPagamento = body?.tipo || 'PIX'

  if (!id)
    throw createError({
      statusCode: 400,
      message: 'ID da venda não fornecido',
    })

  try {
    // 1. Buscar a venda e dados do cliente
    const venda = await db.query.vendas.findFirst({
      where: and(eq(vendas.id, parseInt(id)), isNull(vendas.deletedAt)),
      with: {
        orcamento: {
          with: {
            cliente: true,
          },
        },
      },
    })

    if (!venda || !venda.orcamento) {
      throw createError({
        statusCode: 404,
        message: 'Venda ou Orçamento não encontrado',
      })
    }

    const orcamentoData = venda.orcamento
    const idEmpresa = venda.idEmpresa

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3) // Vencimento em 3 dias

    // 2. Criar Pagamento via Central PaymentService (Provedores)
    const payment = await PaymentService.createPayment(idEmpresa, {
      valor: venda.valorTotal,
      nomeCliente: orcamentoData.nomeCliente,
      cpfCnpj: orcamentoData.cpfCnpj || '',
      email: orcamentoData.email || '',
      telefone: orcamentoData.telefone || '',
      descricao: `Pagamento ref. Venda #${id}`,
      vencimento: dueDate,
      tipo: tipoPagamento as 'PIX' | 'BOLETO' | 'CREDIT_CARD',
      idReferencia: `VENDA_${id}`,
    })

    if (!payment.sucesso) {
      throw createError({
        statusCode: 500,
        message: `Falha ao gerar cobrança: ${payment.error}`,
      })
    }

    // 3. Registrar em pagamentos
    await db.insert(pagamentos).values({
      idVenda: venda.id,
      valor: venda.valorTotal,
      dataVencimento: dueDate,
      status: 'PENDENTE',
      metodo: tipoPagamento,
      asaasId: payment.providerId,
      asaasUrl: payment.link,
      sicoobId: payment.providerId,
      sicoobQrCode: payment.qrCode,
      idEmpresa: idEmpresa,
      createdAt: new Date(),
    })

    // 4. Enviar via WhatsApp
    if (orcamentoData.telefone) {
      try {
        if (payment.qrCode) {
          await sendPixCode(
            orcamentoData.telefone,
            orcamentoData.nomeCliente,
            venda.valorTotal,
            payment.qrCode,
            idEmpresa,
          )
        }
        else if (payment.link) {
          await sendPaymentLink(
            orcamentoData.telefone,
            orcamentoData.nomeCliente,
            venda.valorTotal,
            payment.link,
            idEmpresa,
          )
        }
      }
      catch (wsError) {
        console.error('Erro ao enviar WhatsApp:', wsError)
      }
    }

    return {
      message: 'Pagamento gerado e enviado com sucesso',
      invoiceUrl: payment.link,
      sicoobQrCode: payment.qrCode,
    }
  }
  catch (error: any) {
    console.error('Erro ao emitir pagamento:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro interno ao processar pagamento',
    })
  }
})
