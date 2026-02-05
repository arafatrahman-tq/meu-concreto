import { db } from '../../database/db';
import { clientes } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.query.clientes.findFirst({
            where: and(
                eq(clientes.id, parseInt(id)),
                eq(clientes.idEmpresa, user.idEmpresa),
                isNull(clientes.deletedAt)
            ),
        });

        if (!result) {
            throw createError({ statusCode: 404, message: 'Cliente não encontrado' });
        }

        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
