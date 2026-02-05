import { db } from '../../database/db';
import { produtos } from '../../database/schema';
import { produtoSchema } from '../../utils/validador';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const body = await readBody(event);
        const validatedData = produtoSchema.parse(body);

        const result = await db.update(produtos)
            .set({
                ...validatedData,
                ativo: validatedData.ativo ? 1 : 0,
                updatedAt: new Date()
            })
            .where(and(eq(produtos.id, parseInt(id)), isNull(produtos.deletedAt)))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Produto não encontrado' });
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
