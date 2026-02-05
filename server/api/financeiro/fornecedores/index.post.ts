import { db } from '../../../database/db';
import { fornecedores } from '../../../database/schema';
import { fornecedorSchema } from '../../../utils/validador';
import { serverLog } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user;
        if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' });

        const body = await readBody(event);
        const validatedData = fornecedorSchema.parse({
            ...body,
            idEmpresa: user.idEmpresa
        });

        const [novoFornecedor] = await db.insert(fornecedores).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        if (!novoFornecedor) {
            throw createError({
                statusCode: 500,
                message: 'Falha ao cadastrar fornecedor',
            });
        }

        await serverLog.info(event, 'FINANCEIRO', `Novo fornecedor cadastrado: ${validatedData.nome}`, { id: novoFornecedor.id });

        return novoFornecedor;
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({ statusCode: 400, message: 'Dados inválidos', data: error.errors });
        }
        throw createError({ statusCode: 500, message: error.message });
    }
});
