import { db } from '../../database/db'
import {
  vendas,
  orcamentos,
  motoristas,
  caminhoes,
  entregaEventos,
  logs,
  usuarios,
  insumos,
} from '../../database/schema'
import { eq, sql, and, isNull, gte, desc, inArray, lte } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  try {
    const query = getQuery(event)
    let idEmpresa = user.idEmpresa

    // Se um idEmpresa específico foi solicitado e o usuário tem acesso
    if (query.idEmpresa) {
      const requestedId = parseInt(query.idEmpresa as string)
      if (user.idEmpresasAcesso.includes(requestedId)) {
        idEmpresa = requestedId
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // 1. Vendas de Hoje
    const vendasHoje = await db
      .select({
        total: sql<number>`sum(${vendas.valorTotal})`,
        count: sql<number>`count(${vendas.id})`,
        volume: sql<number>`sum(${orcamentos.qtd})`,
      })
      .from(vendas)
      .innerJoin(orcamentos, eq(vendas.idOrcamento, orcamentos.id))
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, today),
        ),
      )

    // 1.1 Faturamento Mensal
    const faturamentoMensal = await db
      .select({
        total: sql<number>`sum(${vendas.valorTotal})`,
      })
      .from(vendas)
      .where(
        and(
          eq(vendas.idEmpresa, idEmpresa),
          isNull(vendas.deletedAt),
          gte(vendas.createdAt, firstDayOfMonth),
        ),
      )

    // 2. Orçamentos Pendentes (Total de hoje)
    const orcamentosHoje = await db
      .select({
        total: sql<number>`sum(${orcamentos.total})`,
        count: sql<number>`count(${orcamentos.id})`,
      })
      .from(orcamentos)
      .where(
        and(
          eq(orcamentos.idEmpresa, idEmpresa),
          isNull(orcamentos.deletedAt),
          eq(orcamentos.status, 'PENDENTE'),
          gte(orcamentos.createdAt, today),
        ),
      )

    // 3. Status da Frota
    const frotaTotal = await db
      .select({ count: sql<number>`count(*)` })
      .from(caminhoes)
      .where(and(eq(caminhoes.idEmpresa, idEmpresa), eq(caminhoes.ativo, 1)))

    // 3.1 Insumos Críticos (Abaixo do mínimo)
    const insumosCriticos = await db
      .select({
        id: insumos.id,
        nome: insumos.nome,
        estoqueAtual: insumos.estoqueAtual,
        estoqueMinimo: insumos.estoqueMinimo,
        unidadeMedida: insumos.unidadeMedida,
      })
      .from(insumos)
      .where(
        and(
          eq(insumos.idEmpresa, idEmpresa),
          isNull(insumos.deletedAt),
          sql`${insumos.estoqueAtual} <= ${insumos.estoqueMinimo}`,
        ),
      )

    // 4. Atividade Recente e Cálculo de Frota em Rota
    // Pegamos os eventos de hoje da empresa usando Join para performance e tipagem correta
    const eventosRaw = await db
      .select({
        id: entregaEventos.id,
        tipo: entregaEventos.tipo,
        timestamp: entregaEventos.timestamp,
        idOrcamento: entregaEventos.idOrcamento,
        orcamento: {
          nomeCliente: orcamentos.nomeCliente,
        },
      })
      .from(entregaEventos)
      .innerJoin(orcamentos, eq(entregaEventos.idOrcamento, orcamentos.id))
      .where(
        and(
          eq(orcamentos.idEmpresa, idEmpresa),
          gte(entregaEventos.timestamp, today),
        ),
      )
      .orderBy(desc(entregaEventos.timestamp))

    // Mapear para o formato esperado pelo front
    const eventosFiltrados = eventosRaw.map(e => ({
      ...e,
      timestamp: e.timestamp || new Date(),
    }))

    // Identificar orçamentos em rota (último evento não é RETORNO_USINA)
    const lastEventsByOrcamento = new Map()
    eventosFiltrados.forEach((e) => {
      if (!lastEventsByOrcamento.has(e.idOrcamento)) {
        lastEventsByOrcamento.set(e.idOrcamento, e.tipo)
      }
    })

    const emRotaCount = Array.from(lastEventsByOrcamento.values()).filter(
      tipo => tipo !== 'RETORNO_USINA',
    ).length

    // 5. Logs Recentes (Atividades do sistema da empresa)
    const logsRecentes = await db.query.logs.findMany({
      where: eq(logs.idEmpresa, idEmpresa),
      orderBy: [desc(logs.timestamp)],
      limit: 10,
      with: {
        usuario: {
          columns: {
            nome: true,
          },
        },
      },
    })

    // 6. Verificar Status da Usina (se houve eventos nos últimos 60 min)
    const umHoraAtras = new Date(Date.now() - 60 * 60 * 1000)
    const teveAtividadeRecente = eventosFiltrados.some(
      e => e.timestamp >= umHoraAtras,
    )

    return {
      stats: {
        vendasHoje: {
          valor: Number(vendasHoje[0]?.total) || 0,
          qtd: Number(vendasHoje[0]?.count) || 0,
          volume: Number(vendasHoje[0]?.volume) || 0,
        },
        faturamentoMensal: {
          valor: Number(faturamentoMensal[0]?.total) || 0,
        },
        orcamentosPendentes: {
          valor: Number(orcamentosHoje[0]?.total) || 0,
          qtd: Number(orcamentosHoje[0]?.count) || 0,
        },
        frota: {
          total: Number(frotaTotal[0]?.count) || 0,
          emRota: emRotaCount,
        },
        insumosCriticos: insumosCriticos.length,
        listaInsumosCriticos: insumosCriticos,
        statusUsina: teveAtividadeRecente ? 'OPERACIONAL' : 'OCIOSA',
      },
      eventos: eventosFiltrados.slice(0, 10),
      logs: logsRecentes,
      timestamp: new Date().toISOString(),
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
