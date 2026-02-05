import { db } from '../../database/db';
import { clientes } from '../../database/schema';
import { clienteSchema } from '../../utils/validador';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user;
        if (!user) throw createError({ statusCode: 401, message: 'Não autorizado' });

        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const body = await readBody(event);
        const validatedData = clienteSchema.parse(body);

        const result = await db.update(clientes)
            .set({ ...validatedData, updatedAt: new Date() })
            .where(and(
                eq(clientes.id, parseInt(id)),
                eq(clientes.idEmpresa, user.idEmpresa),
                isNull(clientes.deletedAt)
            ))
            .returning();

        if (result.length === 0) {
            throw createError({ statusCode: 404, message: 'Cliente não encontrado' });
        }

        return result[0];
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
            statusMessage: 'Erro Interno',
            message: error.message,
        });
    }
});
