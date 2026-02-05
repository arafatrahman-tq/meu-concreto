import { db } from '../../database/db';
import { vendas, pagamentos } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAdmin(event);

    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const vendaId = parseInt(id);

        // Usar transação para garantir que ambos sejam excluídos (soft delete)
        const result = await db.transaction(async (tx) => {
            // 1. Marcar venda como excluída
            const updatedVendas = await tx.update(vendas)
                .set({ deletedAt: new Date() })
                .where(and(
                    eq(vendas.id, vendaId),
                    eq(vendas.idEmpresa, user.idEmpresa),
                    isNull(vendas.deletedAt)
                ))
                .returning();

            if (updatedVendas.length === 0) {
                return null;
            }

            // 2. Marcar pagamentos associados como excluídos
            await tx.update(pagamentos)
                .set({ deletedAt: new Date() })
                .where(and(
                    eq(pagamentos.idVenda, vendaId),
                    eq(pagamentos.idEmpresa, user.idEmpresa),
                    isNull(pagamentos.deletedAt)
                ));

            return updatedVendas[0];
        });

        if (!result) {
            throw createError({ statusCode: 404, message: 'Venda não encontrada' });
        }

        return { message: 'Venda e pagamentos associados removidos com sucesso (soft delete)' };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,            statusMessage: error.statusMessage || 'Erro Interno',            message: error.message,
        });
    }
});
