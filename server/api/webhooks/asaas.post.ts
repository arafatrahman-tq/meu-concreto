import { db } from '../../database/db';
import { pagamentos, vendas, logs, configuracoesAsaas } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../utils/logger';

/**
 * Webhook Handler para o Asaas
 * Eventos principais:
 * - PAYMENT_RECEIVED: Pagamento efetuado
 * - PAYMENT_OVERDUE: Pagamento vencido
 * - PAYMENT_DELETED: Pagamento removido
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const headers = getHeaders(event);
    const authToken = headers['asaas-access-token'];

    // 1. Log inicial do evento para auditoria
    console.log(`[Asaas Webhook] Evento recebido: ${body.event} para pagamento ${body.payment?.id}`);

    try {
        // 2. Validar o Token do Webhook (Segurança)
        // Buscamos a configuração para validar o token. 
        // Como o webhook não envia o idEmpresa no header, tentamos validar contra os tokens cadastrados.
        const config = await db.query.configuracoesAsaas.findFirst({
            where: authToken ? eq(configuracoesAsaas.webhookToken, authToken) : undefined
        });

        if (!config || (config.webhookToken !== authToken)) {
             await serverLog.register(null, {
                nivel: 'WARN',
                modulo: 'WEBHOOK_ASAAS',
                mensagem: `Tentativa de acesso não autorizada ao webhook. Token inválido: ${authToken}`,
                dados: JSON.stringify({ ip: event.node.req.socket.remoteAddress })
            });
            throw createError({ statusCode: 401, message: 'Unauthorized Webhook Token' });
        }

        const asaasPaymentId = body.payment?.id;
        const eventType = body.event;

        // 3. Processar o Evento
        switch (eventType) {
            case 'PAYMENT_RECEIVED':
            case 'PAYMENT_CONFIRMED':
                await processPaymentReceived(asaasPaymentId, config.idEmpresa);
                break;
            
            case 'PAYMENT_OVERDUE':
                await processPaymentOverdue(asaasPaymentId, config.idEmpresa);
                break;

            case 'PAYMENT_DELETED':
                await processPaymentDeleted(asaasPaymentId, config.idEmpresa);
                break;

            default:
                console.log(`[Asaas Webhook] Evento ignorado: ${eventType}`);
        }

        return { received: true };

    } catch (error: any) {
        console.error('[Asaas Webhook Error]:', error);
        
        await serverLog.register(null, {
            nivel: 'ERROR',
            modulo: 'WEBHOOK_ASAAS',
            mensagem: `Erro ao processar webhook Asaas: ${error.message}`,
            dados: JSON.stringify({ body, error })
        });

        throw createError({
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
});

/**
 * Atualiza o status do pagamento para PAGO no banco local
 */
async function processPaymentReceived(asaasId: string, idEmpresa: number | null) {
    const pagamentoLocal = await db.query.pagamentos.findFirst({
        where: eq(pagamentos.asaasId, asaasId)
    });

    if (pagamentoLocal) {
        await db.update(pagamentos)
            .set({ 
                status: 'PAGO', 
                dataPagamento: new Date(),
                updatedAt: new Date()
            })
            .where(eq(pagamentos.id, pagamentoLocal.id));
        
        console.log(`[Success] Pagamento local ${pagamentoLocal.id} (Asaas: ${asaasId}) confirmado.`);
    } else {
        console.warn(`[Warning] Recebido pagamento do Asaas (${asaasId}) mas não encontrado registro local.`);
    }
    
    await serverLog.register(null, {
        nivel: 'INFO',
        modulo: 'FINANCEIRO',
        mensagem: `Pagamento confirmado via Webhook Asaas: ${asaasId}`,
        idEmpresa: idEmpresa || undefined
    });
}

/**
 * Atualiza o status do pagamento para ATRASADO no banco local
 */
async function processPaymentOverdue(asaasId: string, idEmpresa: number | null) {
    const pagamentoLocal = await db.query.pagamentos.findFirst({
        where: eq(pagamentos.asaasId, asaasId)
    });

    if (pagamentoLocal) {
        await db.update(pagamentos)
            .set({ 
                status: 'ATRASADO',
                updatedAt: new Date()
            })
            .where(eq(pagamentos.id, pagamentoLocal.id));
    }

    await serverLog.register(null, {
        nivel: 'WARN',
        modulo: 'FINANCEIRO',
        mensagem: `Pagamento vencido via Webhook Asaas: ${asaasId}`,
        idEmpresa: idEmpresa || undefined
    });
}

/**
 * Atualiza o status do pagamento para CANCELADO no banco local
 */
async function processPaymentDeleted(asaasId: string, idEmpresa: number | null) {
    const pagamentoLocal = await db.query.pagamentos.findFirst({
        where: eq(pagamentos.asaasId, asaasId)
    });

    if (pagamentoLocal) {
        await db.update(pagamentos)
            .set({ 
                status: 'CANCELADO',
                updatedAt: new Date(),
                deletedAt: new Date()
            })
            .where(eq(pagamentos.id, pagamentoLocal.id));
    }

    await serverLog.register(null, {
        nivel: 'INFO',
        modulo: 'FINANCEIRO',
        mensagem: `Pagamento removido via Webhook Asaas: ${asaasId}`,
        idEmpresa: idEmpresa || undefined
    });
}

