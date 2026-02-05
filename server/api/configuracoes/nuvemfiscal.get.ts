import { db } from '../../database/db';
import { configuracoesNuvemFiscal } from '../../database/schema';
import { requireAuth } from '../../utils/auth';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const config = await db.query.configuracoesNuvemFiscal.findFirst({
            where: user.idEmpresa ? eq(configuracoesNuvemFiscal.idEmpresa, user.idEmpresa) : undefined
        });
        
        const response = config ? {
            ...config,
            ativo: config.ativo === 1,
        } : {
            clientId: '',
            clientSecret: '',
            environment: 'sandbox',
            ativo: false,
        };

        // Mascarar dados sensíveis se não for admin master
        if (user.admin !== 1) {
            if (response.clientSecret) response.clientSecret = '********';
        }

        return response;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
