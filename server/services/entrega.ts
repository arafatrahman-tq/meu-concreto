import { db } from '../database/db'
import {
  ordensServico,
  orcamentos,
  insumos,
  insumosMovimentacoes,
  tracos,
} from '../database/schema'
import { eq, sql, and } from 'drizzle-orm'
import { serverLog } from '../utils/logger'

export const EntregaService = {
  async gerarProximoNumeroTicket(idEmpresa: number) {
    const result = await db.query.ordensServico.findFirst({
      where: (os, { eq }) => eq(os.idEmpresa, idEmpresa),
      orderBy: (os, { desc }) => [desc(os.id)],
    })

    const sequence = result ? result.id + 1 : 1
    const year = new Date().getFullYear()
    return `OS-${year}-${String(sequence).padStart(5, '0')}`
  },

  async processarConclusaoOS(osId: number, idUsuario: string) {
    const os = await db.query.ordensServico.findFirst({
      where: eq(ordensServico.id, osId),
      with: { orcamento: true },
    })

    if (!os || !os.orcamento) return

    // Busca o traço do produto
    const traco = await db.query.tracos.findFirst({
      where: and(
        eq(tracos.idProduto, os.orcamento.idProduto),
        eq(tracos.idEmpresa, os.idEmpresa),
      ),
      with: { itens: true },
    })

    if (!traco || !traco.itens) return

    // Para cada insumo do traço, abate a quantidade proporcional à m3 carregada (os.qtd)
    for (const item of traco.itens) {
      const qtdGasta = item.quantidade * os.qtd

      await db
        .update(insumos)
        .set({
          estoqueAtual: sql`${insumos.estoqueAtual} - ${qtdGasta}`,
          updatedAt: new Date(),
        })
        .where(eq(insumos.id, item.idInsumo))

      await db.insert(insumosMovimentacoes).values({
        idInsumo: item.idInsumo,
        tipo: 'SAIDA_TEORICA',
        quantidade: qtdGasta,
        origem: 'ENTREGA',
        idReferencia: os.id.toString(),
        idUsuario: idUsuario,
        idEmpresa: os.idEmpresa,
        observacao: `Consumo teórico OS ${os.numeroTicket}`,
        createdAt: new Date(),
      })
    }

    // Verificar se o orçamento foi totalmente entregue
    const todasOS = await db.query.ordensServico.findMany({
      where: eq(ordensServico.idOrcamento, os.idOrcamento),
    })

    const totalEntregue = todasOS.reduce((acc, curr) => {
      return curr.status === 'CONCLUIDA' ? acc + curr.qtd : acc
    }, 0)

    const orcamentoFull = await db.query.orcamentos.findFirst({
      where: eq(orcamentos.id, os.idOrcamento),
    })

    if (orcamentoFull && totalEntregue >= orcamentoFull.qtd - 0.1) {
      // Tolerância de 100 litros
      await db
        .update(orcamentos)
        .set({ status: 'CONCLUIDO' })
        .where(eq(orcamentos.id, os.idOrcamento))

      await serverLog.info(
        null,
        'LOGISTICA',
        `Orçamento ${os.idOrcamento} marcado como CONCLUIDO após entrega da OS ${os.id}`,
        { id: os.idOrcamento },
      )
    }
  },
}
