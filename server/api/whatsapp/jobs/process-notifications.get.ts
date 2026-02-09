import { db } from "../../../database/db";
import {
  configuracoesWhatsapp,
  contasPagar,
  pagamentos,
  orcamentos,
  empresas,
  fornecedores,
  clientes,
} from "../../../database/schema";
import { sendWhatsAppMessage } from "../../../utils/whatsapp";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Proteção: apenas chamadas com o segredo correto podem disparar o job
  const configRuntime = useRuntimeConfig();
  const cronSecret = getRequestHeader(event, "x-cron-secret");

  // Fallback para uma chave padrão se não houver no runtime config (para desenvolvimento)
  const validSecret = process.env.CRON_SECRET || "meu-concreto-cron-key-2026";

  if (cronSecret !== validSecret) {
    throw createError({
      statusCode: 401,
      message: "Não autorizado: Chave de agendamento inválida",
    });
  }

  const logs: string[] = [];
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
  );
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  try {
    const config = await db.query.configuracoesWhatsapp.findFirst();

    if (!config) {
      return { message: "WhatsApp não configurado", success: false };
    }

    // 1. NOTIFICAÇÃO DE CONTAS A PAGAR
    if (config.notificaContasPagar === 1) {
      logs.push("Processando Contas a Pagar...");
      const contasVencendo = await db.query.contasPagar.findMany({
        where: and(
          gte(contasPagar.dataVencimento, todayStart),
          lte(contasPagar.dataVencimento, todayEnd),
          eq(contasPagar.status, "PENDENTE"),
        ),
        with: {
          empresa: true,
          fornecedor: true,
        },
      });

      for (const conta of contasVencendo) {
        if (conta.empresa?.telefone) {
          const empresaHeader =
            `${conta.empresa.empresa}${conta.empresa.filial ? ` - ${conta.empresa.filial}` : ""}`.toUpperCase();
          const msg = `*${empresaHeader}*\n📌 *AVISO DE VENCIMENTO*\n\nOlá! A conta *${conta.descricao}* no valor de *R$ ${(conta.valor / 100).toFixed(2)}* vence hoje.\nFornecedor: ${conta.fornecedor?.nome || "Não informado"}\n\n_Mensagem automática do Sistema Meu Concreto._`;
          try {
            await sendWhatsAppMessage(conta.empresa.telefone, { text: msg });
            logs.push(
              `Notificação enviada para ${conta.empresa.empresa} (Conta: ${conta.id})`,
            );
          } catch (e: any) {
            logs.push(
              `Erro ao enviar notificação da conta ${conta.id}: ${e.message}`,
            );
          }
        }
      }
    }

    // 2. NOTIFICAÇÃO DE COBRANÇAS (Inadimplência)
    if (config.notificaCobrancas === 1) {
      logs.push("Processando Cobranças/Inadimplência...");
      // Buscar pagamentos vencidos há mais de 1 dia e ainda pendentes
      const pagamentosAtrasados = await db.query.pagamentos.findMany({
        where: and(
          lte(pagamentos.dataVencimento, todayStart),
          eq(pagamentos.status, "PENDENTE"),
        ),
        with: {
          empresa: true,
          venda: {
            with: {
              orcamento: {
                with: {
                  cliente: true,
                },
              },
            },
          },
        },
      });

      for (const pgto of pagamentosAtrasados) {
        const cliente = pgto.venda?.orcamento?.cliente;
        if (cliente?.telefone) {
          const empresaHeader = pgto.empresa
            ? `${pgto.empresa.empresa}${pgto.empresa.filial ? ` - ${pgto.empresa.filial}` : ""}`.toUpperCase()
            : "GESTÃO FINANCEIRA";
          const msg = `*${empresaHeader}*\n⚠️ *AVISO DE COBRANÇA*\n\nOlá *${cliente.nome}*,\nIdentificamos uma pendência em aberto referente ao pedido no valor de *R$ ${(pgto.valor / 100).toFixed(2)}* que venceu em ${pgto.dataVencimento.toLocaleDateString("pt-BR")}.\n\nPor favor, entre em contato para regularizar.\n\nAtenciosamente,\n*${empresaHeader}*`;
          try {
            await sendWhatsAppMessage(cliente.telefone, { text: msg });
            logs.push(
              `Cobrança enviada para ${cliente.nome} (Pagamento: ${pgto.id})`,
            );
          } catch (e: any) {
            logs.push(`Erro ao enviar cobrança ${pgto.id}: ${e.message}`);
          }
        }
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      logs,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      logs,
    };
  }
});
