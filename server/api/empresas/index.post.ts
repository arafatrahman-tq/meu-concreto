import { db } from '../../database/db';
import { empresas } from '../../database/schema';
import { empresaSchema } from '../../utils/validador';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const validatedData = empresaSchema.parse(body);

        const result = await db.insert(empresas).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        setResponseStatus(event, 201);
        return result[0];
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Erro de Validação',
                message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
                data: error.issues || error.errors,
            });
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro Interno',
            message: error.message,
        });
    }
});
