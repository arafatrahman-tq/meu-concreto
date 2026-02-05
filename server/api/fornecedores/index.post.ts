import { db } from '../../database/db';
import { fornecedores } from '../../database/schema';
import { fornecedorSchema } from '../../utils/validador';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const body = await readBody(event);
        const validatedData = fornecedorSchema.parse(body);

        const result = await db.insert(fornecedores).values({
            ...validatedData,
            idEmpresa: user.idEmpresa,
            createdAt: new Date(),
        }).returning();

        const novoFornecedor = result[0];
        if (!novoFornecedor) {
            throw createError({
                statusCode: 500,
                message: 'Falha ao criar fornecedor',
            });
        }

        await serverLog.info(event, 'FINANCEIRO', `Novo fornecedor cadastrado: ${validatedData.nome}`, { id: novoFornecedor.id });

        setResponseStatus(event, 201);
        return novoFornecedor;
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
