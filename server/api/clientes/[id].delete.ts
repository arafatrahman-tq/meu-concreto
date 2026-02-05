import { db } from '../../database/db';
import { clientes } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user;
        if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' });

        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.update(clientes)
            .set({ deletedAt: new Date() })
            .where(and(
                eq(clientes.id, parseInt(id)),
                eq(clientes.idEmpresa, user.idEmpresa),
                isNull(clientes.deletedAt)
            ))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Cliente não encontrado' });
        }

        return { message: 'Cliente removido com sucesso (soft delete)' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
