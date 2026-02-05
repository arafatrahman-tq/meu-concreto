import { db } from '../../database/db';
import { empresas } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.update(empresas)
            .set({ deletedAt: new Date() })
            .where(and(eq(empresas.id, parseInt(id)), isNull(empresas.deletedAt)))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Empresa não encontrada' });
        }

        return { message: 'Empresa removida com sucesso (soft delete)' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
