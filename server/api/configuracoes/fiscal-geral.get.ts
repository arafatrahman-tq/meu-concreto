import { db } from '../../database/db';
import { configuracoes } from '../../database/schema';
import { requireAdmin } from '../../utils/auth';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const user = requireAdmin(event);

    try {
        // Buscar chaves específicas do módulo fiscal
        const chaves = ['MODO_FISCAL_REFORMA_2026', 'AMBIENTE_FISCAL'];
        
        const configs = await db.query.configuracoes.findMany({
            where: and(
                eq(configuracoes.idEmpresa, user.idEmpresa),
            )
        });

        // Filtrar apenas as chaves que nos interessam ou retornar defaults
        const result = {
            reforma2026: configs.find(c => c.chave === 'MODO_FISCAL_REFORMA_2026')?.valor === 'true',
            ambiente: configs.find(c => c.chave === 'AMBIENTE_FISCAL')?.valor || 'homologacao',
        };

        return result;
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Erro ao carregar configurações fiscais',
        });
    }
});
