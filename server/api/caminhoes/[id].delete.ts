import { db } from '../../database/db';
import { caminhoes } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    try {
        requireAuth(event);
        const id = Number(getRouterParam(event, 'id'));

        const result = await db.delete(caminhoes)
            .where(eq(caminhoes.id, id))
            .returning();

        if (!result.length) {
            throw createError({
                statusCode: 404,
                message: 'Caminhão não encontrado',
            });
        }

        return { message: 'Caminhão removido com sucesso' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
