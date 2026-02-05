import { db } from '../../database/db';
import { configuracoes } from '../../database/schema';
import { configuracaoSchema } from '../../utils/validador';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const user = event.context.user;
        if (!user) {
            throw createError({ statusCode: 401, message: "Não autorizado" });
        }

        if (user.admin !== 1) {
            throw createError({ statusCode: 403, message: "Acesso restrito ao administrador" });
        }

        const body = await readBody(event);
        const validatedData = configuracaoSchema.parse(body);

        // Verifica se a chave jÃ¡ existe para essa empresa (ou global)
        const existing = await db.query.configuracoes.findFirst({
            where: and(
                eq(configuracoes.chave, validatedData.chave),
                validatedData.idEmpresa 
                    ? eq(configuracoes.idEmpresa, validatedData.idEmpresa)
                    : isNull(configuracoes.idEmpresa)
            )
        });

        if (existing) {
            // Update
            const updated = await db.update(configuracoes)
                .set({
                    valor: validatedData.valor,
                    descricao: validatedData.descricao,
                    categoria: validatedData.categoria,
                    updatedAt: new Date()
                })
                .where(eq(configuracoes.id, existing.id))
                .returning();
            return updated[0];
        } else {
            // Insert
            const inserted = await db.insert(configuracoes)
                .values(validatedData)
                .returning();
            return inserted[0];
        }
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                message: 'Erro de validaÃ§Ã£o',
                data: error.errors,
            });
        }
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
