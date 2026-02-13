import { describe, it, expect } from 'bun:test'
import { orcamentoSharedSchema } from '../../../shared/utils/schemas'

describe('orcamentoSharedSchema', () => {
  const orcamentoValido = {
    idCliente: 1,
    nomeCliente: 'João Silva',
    cpfCnpj: '529.982.247-25',
    telefone: '(11) 99999-9999',
    email: 'joao@example.com',
    idVendedor: 1,
    idFormaPgto: 1,
    validadeOrcamento: '2026-12-31',
    dataEntrega: '2026-02-15T10:00:00',
    idCaminhao: null,
    idMotorista: null,
    idBomba: null,
    valorBomba: 0,
    valorDesconto: 0,
    total: 500000, // Total obrigatório
    obs: 'Observação de teste',
    itens: [
      {
        idProduto: 1,
        produtoNome: 'Concreto Usinado FCK 25',
        qtd: 10,
        valorUnit: 50000,
        total: 500000,
      },
    ],
  }

  describe('Validação de campos obrigatórios', () => {
    it('deve validar orçamento completo válido', () => {
      const result = orcamentoSharedSchema.safeParse(orcamentoValido)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar orçamento sem nome do cliente', () => {
      const orcamento = { ...orcamentoValido, nomeCliente: '' }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar orçamento com nome muito curto', () => {
      const orcamento = { ...orcamentoValido, nomeCliente: 'Jo' }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar orçamento sem vendedor', () => {
      const orcamento = { ...orcamentoValido, idVendedor: null }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar orçamento sem forma de pagamento', () => {
      const orcamento = { ...orcamentoValido, idFormaPgto: null }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar orçamento sem total', () => {
      const orcamento = { ...orcamentoValido, total: undefined }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve aceitar orçamento sem itens (campo opcional)', () => {
      const orcamento = { ...orcamentoValido, itens: undefined }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })
  })

  describe('Validação de itens', () => {
    it('deve validar item completo', () => {
      const orcamento = {
        ...orcamentoValido,
        itens: [
          { idProduto: 1, produtoNome: 'Produto 1', qtd: 5, valorUnit: 30000, total: 150000 },
        ],
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar item com quantidade zero', () => {
      const orcamento = {
        ...orcamentoValido,
        itens: [{ idProduto: 1, produtoNome: 'Produto', qtd: 0, valorUnit: 100, total: 0 }],
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar item com valor unitário negativo', () => {
      const orcamento = {
        ...orcamentoValido,
        itens: [{ idProduto: 1, produtoNome: 'Produto', qtd: 1, valorUnit: -100, total: -100 }],
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve aceitar múltiplos itens', () => {
      const orcamento = {
        ...orcamentoValido,
        itens: [
          { idProduto: 1, produtoNome: 'Produto 1', qtd: 5, valorUnit: 30000, total: 150000 },
          { idProduto: 2, produtoNome: 'Produto 2', qtd: 3, valorUnit: 45000, total: 135000 },
        ],
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })
  })

  describe('Validação de datas', () => {
    it('deve aceitar data no formato ISO', () => {
      const orcamento = {
        ...orcamentoValido,
        dataEntrega: '2026-02-15T14:30:00.000Z',
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })

    it('deve aceitar data no formato date-only', () => {
      const orcamento = {
        ...orcamentoValido,
        validadeOrcamento: '2026-12-31',
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })

    it('deve aceitar data sem validade (opcional)', () => {
      const orcamento = {
        ...orcamentoValido,
        validadeOrcamento: null,
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })
  })

  describe('Validação de valores monetários', () => {
    it('deve aceitar valores em centavos (inteiros)', () => {
      const orcamento = {
        ...orcamentoValido,
        total: 100000,
        valorBomba: 15000,
        valorDesconto: 5000,
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar valores decimais', () => {
      const orcamento = {
        ...orcamentoValido,
        total: 1000.5,
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(false)
    })

    it('deve aceitar valor zero para bomba e desconto', () => {
      const orcamento = {
        ...orcamentoValido,
        valorBomba: 0,
        valorDesconto: 0,
      }
      const result = orcamentoSharedSchema.safeParse(orcamento)
      expect(result.success).toBe(true)
    })
  })

  describe('Validação de schema parcial (update)', () => {
    it('deve permitir atualização parcial de status', () => {
      const update = {
        obs: 'Orçamento aprovado pelo cliente',
      }

      const result = orcamentoSharedSchema.partial().safeParse(update)
      expect(result.success).toBe(true)
    })

    it('deve permitir atualização apenas do total', () => {
      const update = {
        total: 600000,
      }

      const result = orcamentoSharedSchema.partial().safeParse(update)
      expect(result.success).toBe(true)
    })
  })
})
