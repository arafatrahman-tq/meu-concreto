import { db } from '../../database/db';
import { insumos } from '../../database/schema';
import { insumoSchema } from '../../utils/validador';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);
    const id = Number(getRouterParam(event, 'id'));

    try {
        const body = await readBody(event);
        const validatedData = insumoSchema.partial().parse(body);

        const result = await db.update(insumos)
            .set({
                ...validatedData,
                updatedAt: new Date(),
            })
            .where(and(
                eq(insumos.id, id),
                eq(insumos.idEmpresa, user.idEmpresa)
            ))
            .returning();

        if (result.length === 0 || !result[0]) {
            throw createError({
                statusCode: 404,
                message: 'Insumo não encontrado',
            });
        }

        await serverLog.info(event, 'INSUMOS', `Insumo atualizado: ${result[0].nome}`, { id });

        return result[0];
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                message: error.issues.map((e: any) => e.message).join(', '),
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
