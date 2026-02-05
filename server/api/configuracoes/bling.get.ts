import { db } from '../../database/db';
import { configuracoesBling } from '../../database/schema';
import { requireAuth } from '../../utils/auth';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const config = await db.query.configuracoesBling.findFirst({
            where: user.idEmpresa ? eq(configuracoesBling.idEmpresa, user.idEmpresa) : undefined
        });
        
        const response = config ? {
            ...config,
            ativo: config.ativo === 1,
        } : {
            apiKey: '',
            clientId: '',
            clientSecret: '',
            accessToken: '',
            refreshToken: '',
            idDeposito: '',
            idCategoria: '',
            naturezaOperacao: '',
            ativo: false,
        };

        // Mascarar dados sensíveis se não for admin master
        if (user.admin !== 1) {
            if (response.apiKey) response.apiKey = '********' + response.apiKey.slice(-4);
            if (response.clientSecret) response.clientSecret = '********';
            if (response.accessToken) response.accessToken = '********';
            if (response.refreshToken) response.refreshToken = '********';
        }

        return response;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
