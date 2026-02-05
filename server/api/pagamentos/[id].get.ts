import { db } from '../../database/db';
import { pagamentos } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.query.pagamentos.findFirst({
            where: and(
                eq(pagamentos.id, parseInt(id)),
                eq(pagamentos.idEmpresa, user.idEmpresa),
                isNull(pagamentos.deletedAt)
            ),
            with: {
                venda: {
                    with: {
                        orcamento: true
                    }
                }
            }
        });

        if (!result) {
            throw createError({ statusCode: 404, message: 'Pagamento não encontrado' });
        }

        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
