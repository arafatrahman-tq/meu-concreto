import { db } from '../../../database/db';
import { fornecedores } from '../../../database/schema';
import { eq, and } from 'drizzle-orm';
import { fornecedorSchema } from '../../../utils/validador';
import { serverLog } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const user = event.context.user;
    if (!user || !id) throw createError({ statusCode: 400, message: 'ID ou usuário inválido' });

    const body = await readBody(event);
    const validatedData = fornecedorSchema.partial().parse(body);

    const result = await db.update(fornecedores)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(and(
            eq(fornecedores.id, parseInt(id)),
            eq(fornecedores.idEmpresa, user.idEmpresa)
        ))
        .returning();

    await serverLog.info(event, 'FINANCEIRO', `Fornecedor atualizado: ${result[0]?.nome}`, { id });

    return result[0];
});
