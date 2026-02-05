import { db } from '../../../database/db';
import { fornecedores } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const user = event.context.user;
    if (!user || !id) throw createError({ statusCode: 400, message: 'ID ou usuário inválido' });

    await db.update(fornecedores)
        .set({ deletedAt: new Date() })
        .where(and(
            eq(fornecedores.id, parseInt(id)),
            eq(fornecedores.idEmpresa, user.idEmpresa)
        ));

    await serverLog.warn(event, 'FINANCEIRO', `Fornecedor excluído (soft-delete)`, { id });

    return { success: true };
});
