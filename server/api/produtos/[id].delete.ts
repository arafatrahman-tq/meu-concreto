import { db } from '../../database/db';
import { produtos } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.update(produtos)
            .set({ deletedAt: new Date(), ativo: 0 })
            .where(and(eq(produtos.id, parseInt(id)), isNull(produtos.deletedAt)))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Produto não encontrado' });
        }

        return { message: 'Produto removido com sucesso (soft delete)' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
