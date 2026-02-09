import { db } from '../../database/db';
import { empresas } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAdmin(event);
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.query.empresas.findFirst({
            where: and(eq(empresas.id, parseInt(id)), isNull(empresas.deletedAt)),
        });

        if (!result) {
            throw createError({ statusCode: 404, message: 'Empresa não encontrada' });
        }

        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
