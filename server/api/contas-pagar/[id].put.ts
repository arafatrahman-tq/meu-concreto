import { db } from '../../database/db';
import { contasPagar } from '../../database/schema';
import { contaPagarSchema } from '../../utils/validador';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID inválido' });

        const body = await readBody(event);
        const validatedData = contaPagarSchema.parse(body);

        const result = await db.update(contasPagar)
            .set({
                ...validatedData,
                idEmpresa: user.idEmpresa,
                updatedAt: new Date(),
            })
            .where(and(
                eq(contasPagar.id, parseInt(id)),
                eq(contasPagar.idEmpresa, user.idEmpresa)
            ))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Conta não encontrada' });
        }

        await serverLog.info(event, 'FINANCEIRO', `Conta a pagar atualizada: ${validatedData.descricao}`, { id: parseInt(id) });

        return result[0];
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Erro de Validação',
                message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Erro Interno',
            message: error.message,
        });
    }
});
