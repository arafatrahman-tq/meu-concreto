import { db } from '../../database/db';
import { insumosMovimentacoes, insumos } from '../../database/schema';
import { eq, and, sql, between } from 'drizzle-orm';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);
    const query = getQuery(event);
    
    // Período padrão: último mês
    const dateStart = query.start ? new Date(query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateEnd = query.end ? new Date(query.end as string) : new Date();

    try {
        // Agrupar movimentações por insumo e tipo no período
        const stats = await db.select({
            idInsumo: insumosMovimentacoes.idInsumo,
            tipo: insumosMovimentacoes.tipo,
            total: sql<number>`sum(${insumosMovimentacoes.quantidade})`
        })
        .from(insumosMovimentacoes)
        .where(and(
            eq(insumosMovimentacoes.idEmpresa, user.idEmpresa),
            between(insumosMovimentacoes.createdAt, dateStart, dateEnd)
        ))
        .groupBy(insumosMovimentacoes.idInsumo, insumosMovimentacoes.tipo);

        // Buscar nomes dos insumos
        const todosInsumos = await db.query.insumos.findMany({
            where: eq(insumos.idEmpresa, user.idEmpresa)
        });

        // Formatar relatório
        const report = todosInsumos.map(insumo => {
            const insumoStats = stats.filter(s => s.idInsumo === insumo.id);
            
            const teorico = insumoStats.find(s => s.tipo === 'SAIDA_TEORICA')?.total || 0;
            const entradas = insumoStats.find(s => s.tipo === 'ENTRADA')?.total || 0;
            const perdasReais = insumoStats.find(s => s.tipo === 'SAIDA_REAL')?.total || 0;
            
            // Ajustes de inventário podem ser positivos ou negativos
            const ajustesInventario = insumoStats
                .filter(s => s.tipo === 'AJUSTE')
                .reduce((acc, s) => acc + s.total, 0);

            // "Consumo Real" para concretaria = Teórico + Perdas Identificadas + Quebra de Inventário
            // Nota: Se ajustesInventario for negativo, significa que sobrou mais do que o esperado (ganho).
            const realCalculado = teorico + perdasReais - ajustesInventario; 
            
            const desvio = teorico > 0 ? ((realCalculado - teorico) / teorico) * 100 : 0;

            return {
                id: insumo.id,
                nome: insumo.nome,
                unidade: insumo.unidadeMedida,
                teorico,
                entradas,
                perdasReais,
                ajustesInventario,
                realCalculado,
                desvio: Number(desvio.toFixed(2)),
                estoqueAtual: insumo.estoqueAtual
            };
        });

        return {
            periodo: { start: dateStart, end: dateEnd },
            data: report
        };

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Erro ao gerar relatório: ' + error.message
        });
    }
});
