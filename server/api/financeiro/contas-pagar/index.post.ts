import { db } from '../../../database/db';
import { contasPagar } from '../../../database/schema';
import { contaPagarSchema } from '../../../utils/validador';
import { serverLog } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user;
        if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' });

        const body = await readBody(event);
        const validatedData = contaPagarSchema.parse({
            ...body,
            idEmpresa: user.idEmpresa
        });

        const [novaConta] = await db.insert(contasPagar).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        if (!novaConta) {
            throw createError({
                statusCode: 500,
                message: 'Falha ao cadastrar conta a pagar',
            });
        }

        await serverLog.info(event, 'FINANCEIRO', `Nova conta a pagar: ${validatedData.descricao}`, { id: novaConta.id });

        return novaConta;
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({ statusCode: 400, message: 'Dados inválidos', data: error.errors });
        }
        throw createError({ statusCode: 500, message: error.message });
    }
});
