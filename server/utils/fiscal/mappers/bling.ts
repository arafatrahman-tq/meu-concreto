import type { FiscalContext } from '../core'

export class BlingMapper {
  /**
     * Mapeia o contexto fiscal para o formato de pedido/nota do Bling V3
     * Incluindo suporte à Reforma Tributária 2026 (IBS/CBS)
     */
  static mapToNfe(ctx: FiscalContext) {
    const { empresa, cliente, produto, orcamento, infoInsumos, rules } = ctx

    return {
      tipo: 'S', // Saída
      format: 'xml', // O Bling aceita XML ou JSON, mas internamente ele prefere converter para o formato dele
      data: new Date().toISOString().split('T')[0],
      contato: {
        nome: cliente.nome,
        tipoPessoa: cliente.cpfCnpj.length > 11 ? 'J' : 'F',
        numeroDocumento: cliente.cpfCnpj.replace(/\D/g, ''),
        email: cliente.email,
        endereco: {
          endereco: cliente.endereco || 'Nao informado',
          numero: cliente.numero || 'SN',
          bairro: cliente.bairro || 'Centro',
          cep: cliente.cep ? cliente.cep.replace(/\D/g, '') : '',
          cidade: cliente.cidade,
          uf: cliente.estado,
        },
      },
      itens: [
        {
          codigo: produto.id.toString(),
          descricao: produto.produto + (produto.fck ? ` FCK ${produto.fck}` : ''),
          unidade: produto.unidadeMedida || 'm3',
          quantidade: orcamento.qtd,
          valor: orcamento.valorUnit / 100,
          ncm: produto.ncm || '38245000',
          origem: produto.origem || 0,
          impostos: {
            icms: {
              origem: produto.origem || 0,
              csosn: rules.csosn,
            },
            // Suporte preliminar Bling para IBS/CBS 2026 via campos customizados ou novos campos da API V3
            ibs: {
              aliquota: Number((rules.aliqIBS * 100).toFixed(4)),
              valor: Number(((orcamento.total / 100) * rules.aliqIBS).toFixed(2)),
            },
            cbs: {
              aliquota: Number((rules.aliqCBS * 100).toFixed(4)),
              valor: Number(((orcamento.total / 100) * rules.aliqCBS).toFixed(2)),
            },
          },
        },
      ],
      obs: `Referente a entrega em ${orcamento.cidade}. ${infoInsumos}. ${rules.textoComplementar}`,
      transporte: {
        modalidade: 0, // Emitente
      },
    }
  }
}
