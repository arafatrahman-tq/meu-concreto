import { db } from '../../database/db';
import { usuarios } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAdmin(event);
    
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.update(usuarios)
            .set({ deletedAt: new Date(), ativo: 0 })
            .where(and(eq(usuarios.id, id), isNull(usuarios.deletedAt)))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Usuário não encontrado' });
        }

        return { message: 'Usuário removido com sucesso (soft delete)' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
