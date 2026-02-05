import { db } from '../../database/db';
import { vendas } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.query.vendas.findFirst({
            where: and(
                eq(vendas.id, parseInt(id)),
                eq(vendas.idEmpresa, user.idEmpresa),
                isNull(vendas.deletedAt)
            ),
        });

        if (!result) {
            throw createError({ statusCode: 404, message: 'Venda não encontrada' });
        }

        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
