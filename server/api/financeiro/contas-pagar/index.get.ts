import { db } from '../../../database/db';
import { contasPagar } from '../../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const user = event.context.user;
    if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' });

    return await db.query.contasPagar.findMany({
        where: and(
            eq(contasPagar.idEmpresa, user.idEmpresa),
            isNull(contasPagar.deletedAt)
        ),
        with: {
            fornecedor: true
        },
        orderBy: (contasPagar, { asc }) => [asc(contasPagar.dataVencimento)],
    });
});
