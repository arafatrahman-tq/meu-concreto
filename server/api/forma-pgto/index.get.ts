import { db } from '../../database/db';
import { formasPagamento } from '../../database/schema';
import { isNull } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAuth(event);

    try {
        const result = await db.query.formasPagamento.findMany({
            where: isNull(formasPagamento.deletedAt),
        });
        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Erro Interno',
            message: error.message,
        });
    }
});
