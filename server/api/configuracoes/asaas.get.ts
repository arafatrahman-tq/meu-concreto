import { db } from '../../database/db';
import { configuracoesAsaas } from '../../database/schema';
import { requireAdmin } from '../../utils/auth';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const user = requireAdmin(event);

    try {
        // Buscar configuração associada à empresa do usuário
        const config = await db.query.configuracoesAsaas.findFirst({
            where: user.idEmpresa ? eq(configuracoesAsaas.idEmpresa, user.idEmpresa) : undefined
        });
        
        const response = config ? {
            ...config,
            ativo: config.ativo === 1,
        } : {
            apiKey: '',
            environment: 'sandbox',
            webhookToken: '',
            ativo: false,
        };

        // Mascarar a API Key para segurança se não for admin master
        if (user.admin !== 1 && response.apiKey) {
            response.apiKey = response.apiKey.substring(0, 10) + '*****************';
        }

        return response;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
