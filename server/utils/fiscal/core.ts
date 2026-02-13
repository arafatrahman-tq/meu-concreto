import { db } from '../../database/db'
import { tracos, tracoItens, empresas, clientes, produtos } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { FiscalRulesEngine, type FiscalRule } from './rules'

export interface FiscalContext {
  venda: any
  orcamento: any
  empresa: any
  cliente: any
  produto: any
  traco?: any
  infoInsumos: string
  rules: FiscalRule
}

export class FiscalCore {
  /**
     * Coleta todos os dados necessários para qualquer mapeamento fiscal.
     * Agora carrega as regras de forma assíncrona para permitir Patches Dinâmicos da IA.
     */
  static async getContext(venda: any): Promise<FiscalContext> {
    const orcamento = venda.orcamento
    if (!orcamento) throw new Error('Orçamento não encontrado para esta venda')

    const [empresa, cliente, produto] = await Promise.all([
      db.query.empresas.findFirst({ where: eq(empresas.id, venda.idEmpresa) }),
      db.query.clientes.findFirst({ where: eq(clientes.id, orcamento.idCliente) }),
      db.query.produtos.findFirst({ where: eq(produtos.id, orcamento.idProduto) }),
    ])

    if (!empresa) throw new Error('Dados da empresa não encontrados')
    if (!cliente) throw new Error('Dados do cliente não encontrados')
    if (!produto) throw new Error('Produto não encontrado')

    // Carregar regras (Considerando patches dinâmicos em produção)
    const rules = await FiscalRulesEngine.getRulesAsync(
      empresa.id,
      empresa.estado || 'SP',
      cliente.estado || 'SP',
      empresa.crt || 1,
    )

    // Buscar insumos do traço
    const traco = await db.query.tracos.findFirst({
      where: eq(tracos.idProduto, produto.id),
      with: {
        itens: {
          with: {
            insumo: true,
          },
        },
      },
    })

    let infoInsumos = ''
    if (traco && traco.itens && traco.itens.length > 0) {
      infoInsumos = 'Composição: ' + traco.itens.map((it: any) =>
        `${it.insumo.nome}: ${it.quantidade}${it.insumo.unidadeMedida}`,
      ).join('; ')
    }

    return {
      venda,
      orcamento,
      empresa,
      cliente,
      produto,
      traco,
      infoInsumos,
      rules,
    }
  }
}
