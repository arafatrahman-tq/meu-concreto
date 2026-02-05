import { db } from '../../database/db';
import { caminhoes } from '../../database/schema';
import { caminhaoSchema } from '../../utils/validador';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    try {
        requireAuth(event);
        const id = Number(getRouterParam(event, 'id'));
        const body = await readBody(event);
        const validatedData = caminhaoSchema.partial().parse(body);

        const result = await db.update(caminhoes)
            .set({
                ...validatedData,
                ativo: validatedData.ativo !== undefined ? (validatedData.ativo ? 1 : 0) : undefined,
                updatedAt: new Date()
            })
            .where(eq(caminhoes.id, id))
            .returning();

        if (!result.length) {
            throw createError({
                statusCode: 404,
                message: 'Caminhão não encontrado',
            });
        }

        return result[0];
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                message: 'Erro de validação',
                data: error.errors,
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
