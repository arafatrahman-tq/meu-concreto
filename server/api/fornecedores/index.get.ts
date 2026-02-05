import { db } from '../../database/db';
import { fornecedores } from '../../database/schema';
import { and, isNull, eq, inArray } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const whereConditions = [isNull(fornecedores.deletedAt)];

        if (user.idEmpresasAcesso && user.idEmpresasAcesso.length > 0) {
            whereConditions.push(inArray(fornecedores.idEmpresa, user.idEmpresasAcesso));
        } else {
            whereConditions.push(eq(fornecedores.idEmpresa, user.idEmpresa));
        }

        const result = await db.query.fornecedores.findMany({
            where: and(...whereConditions),
            orderBy: (fornecedores, { asc }) => [asc(fornecedores.nome)],
        });
        return result;
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
