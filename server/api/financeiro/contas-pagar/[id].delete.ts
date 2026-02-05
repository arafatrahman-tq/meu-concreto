import { db } from '../../../database/db';
import { contasPagar } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const user = event.context.user;
    if (!user || !id) throw createError({ statusCode: 400, message: 'ID ou usuário inválido' });

    await db.update(contasPagar)
        .set({ deletedAt: new Date() })
        .where(and(
            eq(contasPagar.id, parseInt(id)),
            eq(contasPagar.idEmpresa, user.idEmpresa)
        ));

    await serverLog.warn(event, 'FINANCEIRO', `Conta a pagar excluída`, { id });

    return { success: true };
});
