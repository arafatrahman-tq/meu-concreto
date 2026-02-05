import { db } from '../../database/db';
import { contasPagar } from '../../database/schema';
import { contaPagarSchema } from '../../utils/validador';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const body = await readBody(event);
        const validatedData = contaPagarSchema.parse(body);

        const result = await db.insert(contasPagar).values({
            ...validatedData,
            idEmpresa: user.idEmpresa,
            createdAt: new Date(),
        }).returning();

        const novaConta = result[0];
        if (!novaConta) {
            throw createError({
                statusCode: 500,
                message: 'Falha ao criar conta a pagar',
            });
        }

        await serverLog.info(event, 'FINANCEIRO', `Nova conta a pagar cadastrada: ${validatedData.descricao}`, { id: novaConta.id });

        setResponseStatus(event, 201);
        return novaConta;
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
