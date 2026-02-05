import { db } from '../../database/db';
import { vendas } from '../../database/schema';
import { vendaSchema } from '../../utils/validador';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const body = await readBody(event);
        const validatedData = vendaSchema.parse(body);

        const result = await db.update(vendas)
            .set({ 
                ...validatedData, 
                idEmpresa: user.idEmpresa,
                updatedAt: new Date() 
            })
            .where(and(
                eq(vendas.id, parseInt(id)),
                eq(vendas.idEmpresa, user.idEmpresa),
                isNull(vendas.deletedAt)
            ))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Venda não encontrada' });
        }

        return result[0];
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Erro de Validação',
                message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Erro Interno',
            message: error.message,
        });
    }
});
