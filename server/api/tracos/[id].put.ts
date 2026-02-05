import { db } from '../../database/db';
import { tracos, tracoItens } from '../../database/schema';
import { tracoSchema } from '../../utils/validador';
import { eq, and } from 'drizzle-orm';
import { serverLog } from '../../utils/logger';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);
    const id = Number(getRouterParam(event, 'id'));

    try {
        const body = await readBody(event);
        const validatedData = tracoSchema.parse({
            ...body,
            idEmpresa: user.idEmpresa
        });

        return await db.transaction(async (tx) => {
            // Atualizar cabeçalho do traço
            await tx.update(tracos)
                .set({
                    nome: validatedData.nome,
                    descricao: validatedData.descricao,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(tracos.id, id),
                    eq(tracos.idEmpresa, user.idEmpresa)
                ));

            // Substituir itens (remover e reinserir)
            await tx.delete(tracoItens).where(eq(tracoItens.idTraco, id));
            
            if (validatedData.itens && validatedData.itens.length > 0) {
                await tx.insert(tracoItens).values(
                    validatedData.itens.map(item => ({
                        idTraco: id,
                        idInsumo: item.idInsumo,
                        quantidade: item.quantidade
                    }))
                );
            }

            await serverLog.info(event, 'TRACOS', `Traço atualizado: ${validatedData.nome}`, { id });

            return { success: true };
        });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                message: error.issues.map((e: any) => e.message).join(', '),
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
