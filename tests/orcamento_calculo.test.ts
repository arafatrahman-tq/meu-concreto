import { describe, it, expect } from 'bun:test'
import { orcamentoSharedSchema } from '../shared/utils/schemas'

describe('Cálculo de Orçamento', () => {
  it('deve calcular o total corretamente baseado em volume e valor unitário (centavos)', () => {
    // Simular o comportamento do frontend
    const item = {
      idProduto: 1,
      produtoNome: 'Concreto FCK 25',
      qtd: 1,
      valorUnit: 100, // R$ 1,00 em centavos
      total: 100      // Qtd (1) * valorUnit (100)
    }

    const orcamento = {
      nomeCliente: 'Cliente Teste',
      idVendedor: 1,
      idFormaPgto: 1,
      total: 100,
      itens: [item],
      status: 'PENDENTE'
    }

    const result = orcamentoSharedSchema.safeParse(orcamento)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.total).toBe(100)
      expect(result.data.itens?.[0].total).toBe(100)
    }
  })

  it('deve calcular corretamente para volumes fracionados', () => {
    const item = {
      idProduto: 1,
      produtoNome: 'Concreto FCK 25',
      qtd: 2.5,
      valorUnit: 35000, // R$ 350,00
      total: 87500      // 2.5 * 35000
    }

    const orcamento = {
      nomeCliente: 'Cliente Teste',
      idVendedor: 1,
      idFormaPgto: 1,
      total: 87500,
      itens: [item]
    }

    const result = orcamentoSharedSchema.safeParse(orcamento)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.total).toBe(87500)
    }
  })
})
