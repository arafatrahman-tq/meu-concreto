import { describe, it, expect, mock, spyOn, beforeAll, afterAll } from 'bun:test'
import { BlingFiscalProvider } from '../server/services/fiscal/bling-provider'
import { blingService } from '../server/utils/bling'
import { FiscalCore } from '../server/utils/fiscal/core'

describe('Fiscal Providers', () => {
  const idEmpresa = 1
  const vendaData = {
    id: 100,
    total: 50000,
    orcamento: { id: 1 }, // Adicionado para passar no check básico se houver
    cliente: {
      nome: 'Cliente Teste',
      cpfCnpj: '12345678901',
    },
  }

  let fiscalCoreSpy: any

  beforeAll(() => {
    fiscalCoreSpy = spyOn(FiscalCore, 'getContext').mockResolvedValue({
      venda: vendaData,
      orcamento: { id: 1, total: 50000, qtd: 1, valorUnit: 50000, cidade: 'SP' },
      empresa: { estado: 'SP', cnpj: '123', empresa: 'Corp', cidadeIbge: '3550308' },
      cliente: { estado: 'SP', cpfCnpj: '123', nome: 'Cli' },
      produto: { id: 1, produto: 'Prod', ncm: '123', origem: 0 },
      infoInsumos: 'Mock',
      rules: {
        cfop: '5101', csosn: '102', aliqIBS: 0.001, aliqCBS: 0.009,
        textoComplementar: 'Mock', cstPIS: '01', cstCOFINS: '01', aliqIBPT: 0,
      },
    } as any)
  })

  afterAll(() => {
    fiscalCoreSpy.mockRestore()
  })

  describe('BlingFiscalProvider', () => {
    it('should emit NF-e successfully', async () => {
      const spy = spyOn(blingService, 'emitNfe').mockResolvedValue({
        sucesso: true,
        numero: 1234,
        serie: '1',
        link: 'https://bling.com.br/nfe/mock',
      })

      const provider = new BlingFiscalProvider()
      const response = await provider.emitNfe(idEmpresa, vendaData)

      expect(response.sucesso).toBe(true)
      expect(response.numero).toBe(1234)
      expect(response.serie).toBe('1')
      expect(response.link).toBe('https://bling.com.br/nfe/mock')

      spy.mockRestore()
    })

    it('should emit NFS-e successfully', async () => {
      const spy = spyOn(blingService, 'emitNfse').mockResolvedValue({
        sucesso: true,
        numero: 5678,
        link: 'https://bling.com.br/nfse/mock',
      })

      const provider = new BlingFiscalProvider()
      const response = await provider.emitNfse(idEmpresa, vendaData)

      expect(response.sucesso).toBe(true)
      expect(response.numero).toBe(5678)
      expect(response.link).toBe('https://bling.com.br/nfse/mock')

      spy.mockRestore()
    })

    it('should handle error in NF-e emission', async () => {
      const spy = spyOn(blingService, 'emitNfe').mockRejectedValue(new Error('Erro no Bling'))

      const provider = new BlingFiscalProvider()
      const response = await provider.emitNfe(idEmpresa, vendaData)

      expect(response.sucesso).toBe(false)
      expect(response.error).toBe('Erro no Bling')

      spy.mockRestore()
    })
  })
})
