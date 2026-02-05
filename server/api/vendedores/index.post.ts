import { db } from '../../database/db';
import { vendedores } from '../../database/schema';
import { vendedorSchema } from '../../utils/validador';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const validatedData = vendedorSchema.parse(body);

        const result = await db.insert(vendedores).values({
            ...validatedData,
            ativo: validatedData.ativo ? 1 : 0,
            createdAt: new Date(),
        }).returning();

        setResponseStatus(event, 201);
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
