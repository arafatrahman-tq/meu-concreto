import { describe, it, expect } from 'bun:test'
import {
  produtoSharedSchema,
  motoristaSharedSchema,
  caminhaoSharedSchema,
  bombaSharedSchema,
  insumoSharedSchema,
} from '../../../shared/utils/schemas'

describe('Validação de Schemas de Valores', () => {
  describe('produtoSharedSchema', () => {
    it('deve validar produto completo', () => {
      const produto = {
        produto: 'Concreto FCK 25', // campo é 'produto' não 'nome'
        unidadeMedida: 'M3',
        valorCusto: 25000,
        valorVenda: 35000,
        fck: 'FCK25',
        slump: 8,
      }

      const result = produtoSharedSchema.safeParse(produto)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar valor de custo negativo', () => {
      const produto = {
        produto: 'Produto Teste',
        valorCusto: -100,
        valorVenda: 200,
      }

      const result = produtoSharedSchema.safeParse(produto)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar valor de venda negativo', () => {
      const produto = {
        produto: 'Produto Teste',
        valorCusto: 30000,
        valorVenda: -20000,
      }

      const result = produtoSharedSchema.safeParse(produto)
      expect(result.success).toBe(false)
    })

    it('deve aceitar FCK como string', () => {
      const fcksValidos = ['FCK20', 'FCK25', 'FCK30', 'FCK35', 'FCK40', 'QualquerValor']

      for (const fck of fcksValidos) {
        const produto = {
          produto: 'Concreto',
          valorCusto: 20000,
          valorVenda: 30000,
          fck,
        }

        const result = produtoSharedSchema.safeParse(produto)
        expect(result.success).toBe(true)
      }
    })

    it('deve aceitar produto sem FCK (opcional)', () => {
      const produto = {
        produto: 'Concreto',
        valorCusto: 20000,
        valorVenda: 30000,
      }

      const result = produtoSharedSchema.safeParse(produto)
      expect(result.success).toBe(true)
    })

    it('deve usar valores padrão para NCM e CFOP', () => {
      const produto = {
        produto: 'Concreto',
      }

      const result = produtoSharedSchema.safeParse(produto)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.ncm).toBe('38245000')
        expect(result.data.cfop).toBe('5101')
        expect(result.data.unidadeMedida).toBe('m³')
      }
    })
  })

  describe('motoristaSharedSchema', () => {
    it('deve validar motorista completo', () => {
      const motorista = {
        nome: 'José Silva',
        telefone: '(11) 99999-9999',
        cnh: '12345678901',
        pin: '1234', // PIN deve ter exatamente 4 dígitos
        idCaminhao: 1,
        ativo: true,
      }

      const result = motoristaSharedSchema.safeParse(motorista)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar PIN com menos de 4 dígitos', () => {
      const motorista = {
        nome: 'José Silva',
        pin: '123',
        ativo: true,
      }

      const result = motoristaSharedSchema.safeParse(motorista)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar PIN com mais de 4 dígitos', () => {
      const motorista = {
        nome: 'José Silva',
        pin: '123456',
        ativo: true,
      }

      const result = motoristaSharedSchema.safeParse(motorista)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar PIN com letras', () => {
      const motorista = {
        nome: 'José Silva',
        pin: '12ab',
        ativo: true,
      }

      const result = motoristaSharedSchema.safeParse(motorista)
      expect(result.success).toBe(false)
    })

    it('deve aceitar PIN com exatamente 4 dígitos', () => {
      const motorista = {
        nome: 'José Silva',
        pin: '1234',
        ativo: true,
      }

      const result = motoristaSharedSchema.safeParse(motorista)
      expect(result.success).toBe(true)
    })

    it('deve aceitar motorista sem PIN (opcional)', () => {
      const motorista = {
        nome: 'José Silva',
        ativo: true,
      }

      const result = motoristaSharedSchema.safeParse(motorista)
      expect(result.success).toBe(true)
    })
  })

  describe('caminhaoSharedSchema', () => {
    it('deve validar caminhão completo', () => {
      const caminhao = {
        placa: 'ABC1D23',
        modelo: 'Mercedes 2426',
        capacidade: 8,
        ativo: true,
      }

      const result = caminhaoSharedSchema.safeParse(caminhao)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar capacidade zero', () => {
      const caminhao = {
        placa: 'ABC1D23',
        capacidade: 0,
        ativo: true,
      }

      const result = caminhaoSharedSchema.safeParse(caminhao)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar capacidade negativa', () => {
      const caminhao = {
        placa: 'ABC1D23',
        capacidade: -5,
        ativo: true,
      }

      const result = caminhaoSharedSchema.safeParse(caminhao)
      expect(result.success).toBe(false)
    })
  })

  describe('bombaSharedSchema', () => {
    it('deve validar bomba do tipo LANÇA', () => {
      const bomba = {
        nome: 'Bomba Lança 32m',
        tipo: 'LANCA',
        placa: 'ABC1D23',
        ativo: true,
      }

      const result = bombaSharedSchema.safeParse(bomba)
      expect(result.success).toBe(true)
    })

    it('deve validar bomba do tipo ESTACIONÁRIA', () => {
      const bomba = {
        nome: 'Bomba Estacionária',
        tipo: 'ESTACIONARIA',
        ativo: true,
      }

      const result = bombaSharedSchema.safeParse(bomba)
      expect(result.success).toBe(true)
    })

    it('deve validar bomba do tipo REBOQUE', () => {
      const bomba = {
        nome: 'Bomba Reboque',
        tipo: 'REBOQUE',
        placa: 'DEF2G34',
        ativo: true,
      }

      const result = bombaSharedSchema.safeParse(bomba)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar tipo inválido', () => {
      const bomba = {
        nome: 'Bomba Inválida',
        tipo: 'INVALIDO',
        ativo: true,
      }

      const result = bombaSharedSchema.safeParse(bomba)
      expect(result.success).toBe(false)
    })
  })

  describe('insumoSharedSchema', () => {
    it('deve validar insumo completo', () => {
      const insumo = {
        nome: 'Cimento Portland',
        unidadeMedida: 'KG',
        estoqueAtual: 1000,
        estoqueMinimo: 100,
        custoUnitario: 2500,
      }

      const result = insumoSharedSchema.safeParse(insumo)
      expect(result.success).toBe(true)
    })

    it('deve aceitar unidades de medida válidas', () => {
      const unidadesValidas = ['KG', 'LT', 'UN', 'M3', 'TN', 'SACO']

      for (const unidadeMedida of unidadesValidas) {
        const insumo = {
          nome: 'Insumo Teste',
          unidadeMedida,
        }

        const result = insumoSharedSchema.safeParse(insumo)
        expect(result.success).toBe(true)
      }
    })

    it('deve rejeitar unidade de medida vazia', () => {
      const insumo = {
        nome: 'Insumo Teste',
        unidadeMedida: '',
      }

      const result = insumoSharedSchema.safeParse(insumo)
      expect(result.success).toBe(false)
    })

    it('deve rejeitar custo unitário negativo', () => {
      const insumo = {
        nome: 'Insumo Teste',
        unidadeMedida: 'KG',
        custoUnitario: -100,
      }

      const result = insumoSharedSchema.safeParse(insumo)
      expect(result.success).toBe(false)
    })

    it('deve usar valores padrão para estoque', () => {
      const insumo = {
        nome: 'Insumo Teste',
        unidadeMedida: 'KG',
      }

      const result = insumoSharedSchema.safeParse(insumo)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.estoqueAtual).toBe(0)
        expect(result.data.estoqueMinimo).toBe(0)
      }
    })
  })
})
