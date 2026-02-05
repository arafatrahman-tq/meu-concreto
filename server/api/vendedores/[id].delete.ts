import { db } from '../../database/db';
import { vendedores } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user;
        if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' });

        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.update(vendedores)
            .set({ deletedAt: new Date(), ativo: 0 })
            .where(and(
                eq(vendedores.id, parseInt(id)),
                eq(vendedores.idEmpresa, user.idEmpresa),
                isNull(vendedores.deletedAt)
            ))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Vendedor não encontrado' });
        }

        return { message: 'Vendedor removido com sucesso (soft delete)' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
