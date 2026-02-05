import { db } from '../../database/db';
import { usuarios } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAdmin(event);
    
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const result = await db.query.usuarios.findFirst({
            where: and(eq(usuarios.id, id), isNull(usuarios.deletedAt)),
            columns: {
                senha: false,
            },
            with: {
                acessoEmpresas: true
            }
        });

        if (!result) {
            throw createError({ statusCode: 404, message: 'Usuário não encontrado' });
        }

        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
