import { db } from "../../../database/db";
import {
  orcamentos,
  vendas,
  pagamentos,
  insumos,
  tracos,
  insumosMovimentacoes,
} from "../../../database/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { PaymentService } from "../../../services/payments";
import { sendPaymentLink, sendPixCode } from "../../../utils/whatsapp";
import { requireAuth } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const id = getRouterParam(event, "id");
    if (!id)
      throw createError({ statusCode: 400, message: "ID não fornecido" });

    const body = await readBody(event);
    const { lacre } = body;

    // 1. Buscar Orçamento e sua Forma de Pagamento
    const orcamento = await db.query.orcamentos.findFirst({
      where: and(
        eq(orcamentos.id, parseInt(id)),
        eq(orcamentos.idEmpresa, user.idEmpresa),
        isNull(orcamentos.deletedAt),
      ),
      with: {
        formaPgto: true,
      },
    });

    if (!orcamento) {
      throw createError({
        statusCode: 404,
        message: "Orçamento não encontrado",
      });
    }

    if (orcamento.status === "APROVADO") {
      throw createError({ statusCode: 400, message: "Orçamento já aprovado" });
    }

    const formaPgto = orcamento.formaPgto;

    // 2. Criar a Venda
    const [novaVenda] = await db
      .insert(vendas)
      .values({
        idOrcamento: orcamento.id,
        valorTotal: orcamento.total,
        idEmpresa: orcamento.idEmpresa,
        dataVenda: new Date(),
        status: "ABERTA",
      })
      .returning();

    if (!novaVenda) {
      throw createError({ statusCode: 500, message: "Erro ao criar venda" });
    }

    // 4. Gerar Parcelas e Integração via PaymentService
    if (formaPgto) {
      const prazos = formaPgto.dias
        .toString()
        .split(",")
        .map((d: string) => parseInt(d.trim()));
      const valorTotalCentavos = orcamento.total;
      const valorParcelaCentavos = Math.floor(
        valorTotalCentavos / prazos.length,
      );
      const restoCentavos = valorTotalCentavos % prazos.length;

      for (let i = 0; i < prazos.length; i++) {
        const dias = prazos[i];
        if (dias === undefined) continue;

        const vencimento = new Date();
        vencimento.setDate(vencimento.getDate() + dias);

        const valorFinalCentavos =
          i === prazos.length - 1
            ? valorParcelaCentavos + restoCentavos
            : valorParcelaCentavos;

        // Criar pagamento via Provedor Centralizado
        const payment = await PaymentService.createPayment(
          orcamento.idEmpresa,
          {
            valor: valorFinalCentavos,
            nomeCliente: orcamento.nomeCliente,
            cpfCnpj: orcamento.cpfCnpj || "",
            email: orcamento.email || "",
            telefone: orcamento.telefone || "",
            descricao: `Pedido #${novaVenda.id} - P${i + 1}/${prazos.length}`,
            vencimento: vencimento,
            tipo: (formaPgto.tipoAsaas || "BOLETO") as any,
            idReferencia: `venda_${novaVenda.id}_p${i + 1}`,
          },
        );

        const [novoPagamento] = await db
          .insert(pagamentos)
          .values({
            idVenda: novaVenda.id,
            valor: valorFinalCentavos,
            dataVencimento: vencimento,
            status: "PENDENTE",
            metodo: formaPgto.formaPagamento,
            asaasId: payment.providerId,
            asaasUrl: payment.link,
            sicoobId: payment.providerId,
            sicoobQrCode: payment.qrCode,
            idEmpresa: orcamento.idEmpresa,
          })
          .returning();

        // 5. Enviar Link via WhatsApp
        if ((payment.link || payment.qrCode) && orcamento.telefone) {
          try {
            if (payment.qrCode) {
              await sendPixCode(
                orcamento.telefone,
                orcamento.nomeCliente,
                valorFinalCentavos,
                payment.qrCode,
                orcamento.idEmpresa,
              );
            } else if (payment.link) {
              await sendPaymentLink(
                orcamento.telefone,
                orcamento.nomeCliente,
                valorFinalCentavos,
                payment.link,
                orcamento.idEmpresa,
              );
            }
          } catch (wsError) {
            console.error("Erro ao enviar WhatsApp:", wsError);
          }
        }
      }
    }

    // 6. Atualizar o Status do Orçamento
    await db
      .update(orcamentos)
      .set({
        status: "APROVADO",
        lacre: lacre || null,
        updatedAt: new Date(),
      })
      .where(eq(orcamentos.id, orcamento.id));

    // 7. Abatimento Automático de Estoque (Baseado no Traço/Mix Design)
    try {
      const tracoAtivo = await db.query.tracos.findFirst({
        where: and(
          eq(tracos.idProduto, orcamento.idProduto),
          eq(tracos.idEmpresa, orcamento.idEmpresa),
          eq(tracos.ativo, 1),
        ),
        with: {
          itens: true,
        },
      });

      if (tracoAtivo && tracoAtivo.itens.length > 0) {
        for (const item of tracoAtivo.itens) {
          const qtdConsumida = item.quantidade * orcamento.qtd;

          // 1. Atualizar estoque
          await db
            .update(insumos)
            .set({
              estoqueAtual: sql`${insumos.estoqueAtual} - ${qtdConsumida}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(insumos.id, item.idInsumo),
                eq(insumos.idEmpresa, orcamento.idEmpresa),
              ),
            );

          // 2. Registrar movimentação histórica
          await db.insert(insumosMovimentacoes).values({
            idInsumo: item.idInsumo,
            tipo: "SAIDA_TEORICA",
            quantidade: qtdConsumida,
            origem: "VENDA",
            idReferencia: orcamento.id.toString(),
            idUsuario: user.id,
            idEmpresa: orcamento.idEmpresa,
            observacao: `Consumo teórico para Orçamento #${orcamento.id}`,
            createdAt: new Date(),
          });
        }
      }
    } catch (e) {
      console.error("Erro ao processar abatimento de estoque:", e);
      // Não interromper o processo principal se falhar o abatimento, mas logar
    }

    return {
      venda: novaVenda,
      message: "Orçamento aprovado, venda criada e cobranças geradas.",
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Erro Interno",
      message: error.message,
    });
  }
});
