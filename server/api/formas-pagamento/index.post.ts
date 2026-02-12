import { db } from '../../database/db';
import { formasPagamento } from '../../database/schema';
import { formaPgtoSchema } from '../../utils/validador';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const validatedData = formaPgtoSchema.parse(body);

        const result = await db.insert(formasPagamento).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        setResponseStatus(event, 201);
        return result[0];
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                message: 'Erro de validaÃ§Ã£o',
                data: error.errors,
            });
        }
        throw createError({
            statusCode: 500,
            message: error.message,
        });
    }
});
