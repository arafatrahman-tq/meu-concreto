import { db } from '../../database/db';
import { clientes } from '../../database/schema';
import { clienteSchema } from '../../utils/validador';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAuth(event);

    try {
        const body = await readBody(event);
        const validatedData = clienteSchema.parse(body);

        const result = await db.insert(clientes).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        const novoCliente = result[0];
        if (!novoCliente) {
            throw createError({
                statusCode: 500,
                message: 'Falha ao criar cliente',
            });
        }

        // Registrar criação de cliente
        await serverLog.info(event, 'CLIENTES', `Novo cliente cadastrado: ${validatedData.nome}`, { id: novoCliente.id });

        setResponseStatus(event, 201);
        return novoCliente;
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Erro de Validação',
                message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
                data: error.issues || error.errors,
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Erro Interno',
            message: error.message,
        });
    }
});
