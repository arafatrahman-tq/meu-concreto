import { describe, it, expect, mock, spyOn } from 'bun:test'
import { NuvemfiscalFiscalProvider } from '../server/services/fiscal/nuvemfiscal-provider'
import { nuvemfiscalService } from '../server/utils/nuvemfiscal'
import { FiscalCore } from '../server/utils/fiscal/core'

describe('Nuvem Fiscal Provider', () => {
  const idEmpresa = 1
  const vendaData = {
    id: 1,
    idEmpresa: 1,
    orcamento: { id: 100 }, // Mock mínimo para evitar erro no FiscalCore
  }

  describe('NuvemfiscalFiscalProvider', () => {
    it('should emit NF-e successfully', async () => {
      // Mock do Contexto Fiscal para evitar chamadas de banco reais
      const mockContext: any = {
        empresa: { cnpj: '123', estado: 'SP' },
        cliente: { cpfCnpj: '456', estado: 'SP' },
        produto: { id: 1, produto: 'Teste' },
        orcamento: { id: 100, qtd: 1, total: 1000, valorUnit: 1000 },
        rules: { aliqISS: 0.03, aliqIBS: 0.001, aliqCBS: 0.009 },
      }

      const coreSpy = spyOn(FiscalCore, 'getContext').mockResolvedValue(
        mockContext,
      )

      const apiSpy = spyOn(nuvemfiscalService, 'emitNfe').mockResolvedValue({
        numero: 1001,
        serie: '1',
        chave: 'CHAVE123',
        link_pdf: 'https://pdf.nuvemfiscal.com.br/123',
      })

      const provider = new NuvemfiscalFiscalProvider()
      const response = await provider.emitNfe(idEmpresa, vendaData)

      expect(response.sucesso).toBe(true)
      expect(response.numero).toBe(1001)
      expect(response.chave).toBe('CHAVE123')
      expect(response.link).toBe('https://pdf.nuvemfiscal.com.br/123')

      coreSpy.mockRestore()
      apiSpy.mockRestore()
    })

    it('should handle errors during NF-e emission', async () => {
      const mockContext: any = {
        empresa: {
          id: 1,
          cnpj: '123',
          estado: 'SP',
          empresa: 'T',
          cidadeIbge: '1',
          crt: 1,
        },
        cliente: { cpfCnpj: '456', estado: 'SP', nome: 'C', cidadeIbge: '1' },
        produto: { id: 1, produto: 'P' },
        orcamento: { id: 100, qtd: 1, total: 1000, valorUnit: 1000 },
        rules: { aliqISS: 0.03, aliqIBS: 0.001, aliqCBS: 0.009 },
      }
      const coreSpy = spyOn(FiscalCore, 'getContext').mockResolvedValue(
        mockContext,
      )
      const apiSpy = spyOn(nuvemfiscalService, 'emitNfe').mockRejectedValue(
        new Error('Erro de Conexão'),
      )

      const provider = new NuvemfiscalFiscalProvider()
      const response = await provider.emitNfe(idEmpresa, vendaData)

      expect(response.sucesso).toBe(false)
      expect(response.error).toBe('Erro de Conexão')

      coreSpy.mockRestore()
      apiSpy.mockRestore()
    })

    it('should emit NFS-e successfully', async () => {
      const mockContext: any = {
        empresa: {
          id: 1,
          cnpj: '12345678000199',
          estado: 'SP',
          empresa: 'Teste',
          cidadeIbge: '3550308',
          crt: 1,
        },
        cliente: {
          cpfCnpj: '12345678901',
          nome: 'Teste',
          estado: 'SP',
          cidadeIbge: '3550308',
          email: 'a@a.com',
        },
        produto: { id: 1, produto: 'Concreto', unidadeMedida: 'm3' },
        orcamento: { id: 100, qtd: 1, total: 1000, valorUnit: 1000 },
        infoInsumos: 'insumos',
        rules: {
          aliqISS: 0.03,
          aliqIBS: 0.001,
          aliqCBS: 0.009,
          aliqISS_retido: false,
        },
      }

      const coreSpy = spyOn(FiscalCore, 'getContext').mockResolvedValue(
        mockContext,
      )
      const apiSpy = spyOn(nuvemfiscalService, 'emitNfse').mockResolvedValue({
        numero: '500',
        link_pdf: 'https://nfse.nuvemfiscal.com.br/500',
      })

      const provider = new NuvemfiscalFiscalProvider()
      const response = await provider.emitNfse(idEmpresa, vendaData)

      expect(response.sucesso).toBe(true)
      expect(Number(response.numero)).toBe(500)
      expect(response.link).toBe('https://nfse.nuvemfiscal.com.br/500')

      coreSpy.mockRestore()
      apiSpy.mockRestore()
    })
  })
})
