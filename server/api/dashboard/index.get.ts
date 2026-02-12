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

    // Filtro por empresa: Apenas administradores podem alternar entre empresas
    if (query.idEmpresa) {
      const targetId = Number(query.idEmpresa);

      // Se o targetId for diferente da empresa principal do usuário, exige admin
      if (targetId !== user.idEmpresa && user.admin !== 1) {
        throw createError({
          statusCode: 403,
          message: "Apenas administradores podem visualizar dados de outras unidades",
        });
      }

      // Se for admin, verifica se ele tem acesso àquela empresa específica
      // Admins globais (admin === 1) têm acesso a todas as empresas
      const hasAccess =
        user.admin === 1 ||
        user.idEmpresa === targetId ||
        authUser.idEmpresasAcesso?.includes(targetId);

      if (!hasAccess) {
        throw createError({
          statusCode: 403,
          message: "Acesso negado à unidade solicitada",
        });
      }

      idEmpresa = targetId;
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

    const totalAtual = vendasMesAtual[0]?.total ?? 0;
    const totalAnterior = vendasMesAnterior[0]?.total ?? 0;

    let trendFaturamento = "+0.0%";
    if (totalAnterior > 0) {
      const diff = totalAtual - totalAnterior;
      trendFaturamento =
        (diff >= 0 ? "+" : "") +
        ((diff / totalAnterior) * 100).toFixed(1) +
        "%";
    } else if (totalAtual > 0) {
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

    const totalCount = totalVendasFiscal[0]?.count ?? 0;
    const comNotaCount = vendasComNota[0]?.count ?? 0;

    const percentualFiscal = totalCount > 0 
      ? Math.round((comNotaCount / totalCount) * 100)
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

    const countPedidosAtual = pedidosMesAtual[0]?.count ?? 0;
    const countPedidosAnterior = pedidosMesAnterior[0]?.count ?? 0;

    const diffPedidos = countPedidosAtual - countPedidosAnterior;
    const trendPedidos = (diffPedidos >= 0 ? "+" : "") + diffPedidos;

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

    const totalCustosAtual = custosMesAtual[0]?.total ?? 0;
    const totalCustosAnterior = custosMesAnterior[0]?.total ?? 0;

    let trendCustos = "0%";
    if (totalCustosAnterior > 0) {
      const diff = totalCustosAtual - totalCustosAnterior;
      trendCustos =
        (diff >= 0 ? "+" : "") +
        ((diff / totalCustosAnterior) * 100).toFixed(1) +
        "%";
    }

    // VOLUME DE CONCRETO (m³)
    const volumeTotal = await db
      .select({
        total: sql<number>`sum(${orcamentos.qtd})`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .where(and(eq(vendas.idEmpresa, idEmpresa), isNull(vendas.deletedAt)));

    const volumeMesAtual = await db
      .select({ total: sql<number>`sum(${orcamentos.qtd})` })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfMonth),
        ),
      );

    const volumeMesAnterior = await db
      .select({ total: sql<number>`sum(${orcamentos.qtd})` })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfLastMonth),
          lt(vendas.createdAt, firstDayOfMonth),
        ),
      );

    const volAtual = volumeMesAtual[0]?.total ?? 0;
    const volAnterior = volumeMesAnterior[0]?.total ?? 0;
    let trendVolume = "+0.0%";
    if (volAnterior > 0) {
      const diff = volAtual - volAnterior;
      trendVolume = (diff >= 0 ? "+" : "") + ((diff / volAnterior) * 100).toFixed(1) + "%";
    }

    // Ticket Médio
    const totalVendas = statsVendas[0]?.total || 0;
    const countVendas = statsVendas[0]?.count || 0;
    const ticketMedio = countVendas > 0 ? Math.round(totalVendas / countVendas) : 0;

    // Taxa de Conversão
    const countPendentes = statsOrcamentos[0]?.count || 0;
    const totalOrcamentos = countVendas + countPendentes;
    const conversao = totalOrcamentos > 0 ? Math.round((countVendas / totalOrcamentos) * 100) : 0;

    return {
      stats: {
        faturamento: {
          total: totalVendas,
          disponivel: statsPagamentos[0]?.recebido || 0,
          trend: trendFaturamento,
          ticketMedio: ticketMedio,
        },
        pedidos: {
          realizados: countVendas,
          pendentes: countPendentes,
          trend: trendPedidos,
          conversao: conversao,
        },
        volume: {
          total: volumeTotal[0]?.total || 0,
          trend: trendVolume,
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
