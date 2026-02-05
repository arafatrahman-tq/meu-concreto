import { db } from '../../database/db';
import { motoristas } from '../../database/schema';
import { motoristaSchema } from '../../utils/validador';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = Number(getRouterParam(event, 'id'));
        const body = await readBody(event);
        const validatedData = motoristaSchema.partial().parse(body);

        const result = await db.update(motoristas)
            .set({
                ...validatedData,
                ativo: validatedData.ativo !== undefined ? (validatedData.ativo ? 1 : 0) : undefined,
                updatedAt: new Date()
            })
            .where(eq(motoristas.id, id))
            .returning();

        if (!result.length) {
            throw createError({
                statusCode: 404,
                message: 'Motorista não encontrado',
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
            statusCode: 500,
            message: error.message,
        });
    }
});
