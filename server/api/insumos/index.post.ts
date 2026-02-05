import { db } from '../../database/db';
import { insumos } from '../../database/schema';
import { insumoSchema } from '../../utils/validador';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);

    try {
        const body = await readBody(event);
        const validatedData = insumoSchema.parse({
            ...body,
            idEmpresa: user.idEmpresa
        });

        const result = await db.insert(insumos).values({
            ...validatedData,
            createdAt: new Date(),
        }).returning();

        const novoInsumo = result[0];
        if (!novoInsumo) {
            throw createError({
                statusCode: 500,
                message: 'Falha ao criar insumo',
            });
        }

        await serverLog.info(event, 'INSUMOS', `Novo insumo cadastrado: ${validatedData.nome}`, { id: novoInsumo.id });

        setResponseStatus(event, 201);
        return novoInsumo;
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
            message: error.message,
        });
    }
});
