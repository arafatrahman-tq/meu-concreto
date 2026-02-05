import { db } from '../../../database/db';
import { contasPagar } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { contaPagarSchema } from '../../../utils/validador';
import { serverLog } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const user = event.context.user;
    if (!user || !id) throw createError({ statusCode: 400, message: 'ID ou usuário inválido' });

    const body = await readBody(event);
    const validatedData = contaPagarSchema.partial().parse(body);

    const result = await db.update(contasPagar)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(and(
            eq(contasPagar.id, parseInt(id)),
            eq(contasPagar.idEmpresa, user.idEmpresa)
        ))
        .returning();

    await serverLog.info(event, 'FINANCEIRO', `Conta a pagar atualizada: ${result[0]?.descricao}`, { id });

    return result[0];
});
