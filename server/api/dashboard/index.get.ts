import { db } from "../../database/db";
import {
  vendas,
  orcamentos,
  produtos,
  vendedores,
  usuarios,
  pagamentos,
} from "../../database/schema";
import { eq, sql, and, isNull, isNotNull, lt, gte, asc } from "drizzle-orm";
import { getAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const period = (query.period as string) || "monthly";

    const authUser = getAuthenticatedUser(event);
    if (!authUser) {
      throw createError({
        statusCode: 401,
        message: "Não autorizado",
      });
    }

    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, authUser.id),
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "UsuÃ¡rio nÃ£o encontrado",
      });
    }

    let idEmpresa = user.idEmpresa;

    // Filtro por empresa para administradores
    if (user.admin === 1 && query.idEmpresa) {
      idEmpresa = Number(query.idEmpresa);
    }

    // Datas para comparaÃ§Ã£o de tendÃªncias
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    // stats principais
    const statsVendas = await db
      .select({
        total: sql<number>`sum(${vendas.valorTotal})`,
        count: sql<number>`count(${vendas.id})`,
      })
      .from(vendas)
      .where(and(eq(vendas.idEmpresa, idEmpresa), isNull(vendas.deletedAt)));

    // Faturamento do mÃªs atual vs anterior para a trend
    const vendasMesAtual = await db
      .select({ total: sql<number>`sum(${vendas.valorTotal})` })
      .from(vendas)
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfMonth),
        ),
      );

    const vendasMesAnterior = await db
      .select({ total: sql<number>`sum(${vendas.valorTotal})` })
      .from(vendas)
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfLastMonth),
          lt(vendas.createdAt, firstDayOfMonth),
        ),
      );

    let trendFaturamento = "+0.0%";
    if (vendasMesAnterior[0]?.total && vendasMesAnterior[0].total > 0) {
      const diff = (vendasMesAtual[0]?.total || 0) - vendasMesAnterior[0].total;
      trendFaturamento =
        (diff >= 0 ? "+" : "") +
        ((diff / vendasMesAnterior[0].total) * 100).toFixed(1) +
        "%";
    } else if (vendasMesAtual[0]?.total && vendasMesAtual[0].total > 0) {
      trendFaturamento = "+100%";
    }

    // Faturamento disponÃ­vel (pagamentos jÃ¡ recebidos)
    const statsPagamentos = await db
      .select({
        recebido: sql<number>`sum(${pagamentos.valor})`,
      })
      .from(pagamentos)
      .where(
        and(
          eq(pagamentos.idEmpresa, idEmpresa),
          eq(pagamentos.status, "PAGO"),
          isNull(pagamentos.deletedAt),
        ),
      );

    const statsOrcamentos = await db
      .select({
        count: sql<number>`count(${orcamentos.id})`,
      })
      .from(orcamentos)
      .where(
        and(
          eq(orcamentos.idEmpresa, idEmpresa),
          eq(orcamentos.status, "PENDENTE"),
          isNull(orcamentos.deletedAt),
        ),
      );

    // Métricas Fiscais (Novas)
    const totalVendasFiscal = await db
      .select({ count: sql<number>`count(${vendas.id})` })
      .from(vendas)
      .where(and(eq(vendas.idEmpresa, idEmpresa), isNull(vendas.deletedAt)));

    const vendasComNota = await db
      .select({ count: sql<number>`count(${vendas.id})` })
      .from(vendas)
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          eq(vendas.status, "NF_EMITIDA"),
          isNull(vendas.deletedAt)
        )
      );

    const percentualFiscal = totalVendasFiscal[0]?.count > 0 
      ? Math.round((vendasComNota[0]?.count / totalVendasFiscal[0].count) * 100)
      : 0;

    // CÃ¡lculo de custos (valorCusto * qtd)
    const totalCusto = await db
      .select({
        total: sql<number>`sum(${produtos.valorCusto} * ${orcamentos.qtd})`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .innerJoin(produtos, eq(orcamentos.idProduto, produtos.id))
      .where(and(eq(vendas.idEmpresa, idEmpresa), isNull(vendas.deletedAt)));

    // Dados para Major Expenses (Top 3 custos por produto)
    const majorExpenses = await db
      .select({
        name: orcamentos.produtoNome,
        value: sql<number>`sum(${produtos.valorCusto} * ${orcamentos.qtd})`,
      })
      .from(orcamentos)
      .innerJoin(produtos, eq(orcamentos.idProduto, produtos.id))
      .where(
        and(
          eq(orcamentos.idEmpresa, idEmpresa),
          isNull(orcamentos.deletedAt),
          sql`exists (select 1 from ${vendas} where ${vendas.idOrcamento} = ${orcamentos.id} and ${vendas.deletedAt} is null)`,
        ),
      )
      .groupBy(orcamentos.produtoNome)
      .orderBy(sql`sum(${produtos.valorCusto} * ${orcamentos.qtd}) DESC`)
      .limit(3);

    // Dados para o grÃ¡fico baseados no perÃ­odo
    let chartSelect;
    let chartWhere = and(
      eq(vendas.idEmpresa, idEmpresa),
      isNull(vendas.deletedAt),
    );
    let chartGroupBy;

    if (period === "daily") {
      chartSelect = {
        label: sql<string>`strftime('%d/%m', datetime(${vendas.createdAt}, 'unixepoch'))`,
        total: sql<number>`sum(${vendas.valorTotal})`,
      };
      chartGroupBy = sql`strftime('%d/%m', datetime(${vendas.createdAt}, 'unixepoch'))`;
      chartWhere = and(
        chartWhere,
        sql`${vendas.createdAt} >= strftime('%s', 'now', '-7 days')`,
      );
    } else if (period === "weekly") {
      chartSelect = {
        label: sql<string>`'Sem ' || strftime('%W', datetime(${vendas.createdAt}, 'unixepoch'))`,
        total: sql<number>`sum(${vendas.valorTotal})`,
      };
      chartGroupBy = sql`strftime('%W', datetime(${vendas.createdAt}, 'unixepoch'))`;
      chartWhere = and(
        chartWhere,
        sql`${vendas.createdAt} >= strftime('%s', 'now', '-56 days')`,
      );
    } else {
      chartSelect = {
        label: sql<string>`strftime('%m', datetime(${vendas.createdAt}, 'unixepoch'))`,
        total: sql<number>`sum(${vendas.valorTotal})`,
      };
      chartGroupBy = sql`strftime('%m', datetime(${vendas.createdAt}, 'unixepoch'))`;
      chartWhere = and(
        chartWhere,
        sql`${vendas.createdAt} >= strftime('%s', 'now', 'start of year')`,
      );
    }

    const chartData = await db
      .select(chartSelect)
      .from(vendas)
      .where(chartWhere)
      .groupBy(chartGroupBy)
      .orderBy(sql`${vendas.createdAt} ASC`);

    // Agenda de entregas (prÃ³ximas 5 entregas/pedidos com data de entrega)
    const recentDeliveries = await db.select({
      id: orcamentos.id,
      nomeCliente: orcamentos.nomeCliente,
      dataEntrega: orcamentos.dataEntrega,
      enderecoEntrega: orcamentos.enderecoEntrega,
      bairro: orcamentos.bairro,
      status: orcamentos.status,
      vendaStatus: vendas.status,
      vendaNfse: vendas.nfseNumero,
    }).from(orcamentos)
    .leftJoin(vendas, eq(vendas.idOrcamento, orcamentos.id))
    .where(
      and(
        eq(orcamentos.idEmpresa, idEmpresa),
        isNull(orcamentos.deletedAt),
        isNotNull(orcamentos.dataEntrega),
      )
    )
    .limit(5)
    .orderBy(asc(orcamentos.dataEntrega));

    // Ranking da equipe (vendedores por total de vendas)
    const teamRanking = await db
      .select({
        id: vendedores.id,
        nome: vendedores.nome,
        orcamentosCount: sql<number>`count(distinct ${orcamentos.id})`,
        vendasCount: sql<number>`count(distinct ${vendas.id})`,
        total: sql<number>`coalesce(sum(${vendas.valorTotal}), 0)`,
      })
      .from(vendedores)
      .leftJoin(
        orcamentos,
        and(
          eq(orcamentos.idVendedor, vendedores.id),
          isNull(orcamentos.deletedAt),
        ),
      )
      .leftJoin(
        vendas,
        and(eq(vendas.idOrcamento, orcamentos.id), isNull(vendas.deletedAt)),
      )
      .where(
        and(eq(vendedores.idEmpresa, idEmpresa), isNull(vendedores.deletedAt)),
      )
      .groupBy(vendedores.id, vendedores.nome)
      .orderBy(sql`sum(${vendas.valorTotal}) desc`)
      .limit(5);

    // Pedidos do mÃªs atual vs anterior para a trend
    const pedidosMesAtual = await db
      .select({ count: sql<number>`count(${vendas.id})` })
      .from(vendas)
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfMonth),
        ),
      );

    const pedidosMesAnterior = await db
      .select({ count: sql<number>`count(${vendas.id})` })
      .from(vendas)
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfLastMonth),
          lt(vendas.createdAt, firstDayOfMonth),
        ),
      );

    let trendPedidos = "0";
    if (
      pedidosMesAtual[0]?.count !== undefined &&
      pedidosMesAnterior[0]?.count !== undefined
    ) {
      const diff = pedidosMesAtual[0].count - pedidosMesAnterior[0].count;
      trendPedidos = (diff >= 0 ? "+" : "") + diff;
    }

    // Custos do mÃªs atual vs anterior para a trend
    const custosMesAtual = await db
      .select({
        total: sql<number>`sum(${produtos.valorCusto} * ${orcamentos.qtd})`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .innerJoin(produtos, eq(orcamentos.idProduto, produtos.id))
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfMonth),
        ),
      );

    const custosMesAnterior = await db
      .select({
        total: sql<number>`sum(${produtos.valorCusto} * ${orcamentos.qtd})`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .innerJoin(produtos, eq(orcamentos.idProduto, produtos.id))
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfLastMonth),
          lt(vendas.createdAt, firstDayOfMonth),
        ),
      );

    let trendCustos = "0%";
    if (custosMesAnterior[0]?.total && custosMesAnterior[0].total > 0) {
      const diff = (custosMesAtual[0]?.total || 0) - custosMesAnterior[0].total;
      trendCustos =
        (diff >= 0 ? "+" : "") +
        ((diff / custosMesAnterior[0].total) * 100).toFixed(1) +
        "%";
    }

    return {
      stats: {
        faturamento: {
          total: statsVendas[0]?.total || 0,
          disponivel: statsPagamentos[0]?.recebido || 0,
          trend: trendFaturamento,
        },
        pedidos: {
          realizados: statsVendas[0]?.count || 0,
          pendentes: statsOrcamentos[0]?.count || 0,
          trend: trendPedidos,
        },
        fiscal: {
          emitidas: vendasComNota[0]?.count || 0,
          total: totalVendasFiscal[0]?.count || 0,
          percentual: percentualFiscal,
        },
        custos: {
          operacao: totalCusto[0]?.total || 0,
          trend: trendCustos,
        },
      },
      chart: chartData,
      recentDeliveries: recentDeliveries.map((d: any) => ({
        id: d.id,
        title: d.nomeCliente,
        time: d.dataEntrega ? new Date(d.dataEntrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
        date: d.dataEntrega ? new Date(d.dataEntrega).toISOString().split('T')[0] : '',
        location: d.bairro || d.enderecoEntrega || 'Endereço não informado',
        tag: d.vendaStatus === "NF_EMITIDA" ? "DOC. EMITIDO" : (d.status === "APROVADO" ? "AGENDADO" : d.status),
        status: d.status,
        hasNf: !!d.vendaNfse
      })),
      teamRanking,
      majorExpenses,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
