import { db } from '../../database/db';
import { insumos } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);
    const id = Number(getRouterParam(event, 'id'));

    const result = await db.update(insumos)
        .set({
            deletedAt: new Date(),
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

    await serverLog.info(event, 'INSUMOS', `Insumo excluído: ${result[0].nome}`, { id });

    return { success: true };
});
