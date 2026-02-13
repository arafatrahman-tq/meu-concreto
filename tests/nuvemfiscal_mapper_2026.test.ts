import { describe, it, expect } from 'bun:test'
import { NuvemfiscalMapper } from '../server/utils/fiscal/mappers/nuvemfiscal'
import type { FiscalContext } from '../server/utils/fiscal/core'

describe('Nuvemfiscal Mapper - Payload Verification 2026', () => {
  const mockContext: FiscalContext = {
    venda: { id: 1, idEmpresa: 1 },
    orcamento: {
      id: 100,
      qtd: 10,
      valorUnit: 35000,
      total: 350000,
      cidade: 'São Paulo',
      valorDesconto: 0,
    },
    empresa: {
      cnpj: '12345678000199',
      empresa: 'Minha Empresa',
      estado: 'SP',
      cidade: 'São Paulo',
      cidadeIbge: '3550308',
      ie: '123456789',
      crt: 1,
    },
    cliente: {
      cpfCnpj: '98765432100',
      nome: 'Cliente Teste',
      estado: 'SP',
      cidade: 'São Paulo',
      cidadeIbge: '3550308',
      email: 'cliente@teste.com',
    },
    produto: {
      id: 1,
      produto: 'Concreto B25',
      fck: '25',
      unidadeMedida: 'm3',
      ncm: '38245000',
      origem: 0,
    },
    infoInsumos: 'Cimento: 300kg; Areia: 0.5m3',
    rules: {
      cfop: '5101',
      csosn: '102',
      cstPIS: '07',
      cstCOFINS: '07',
      aliqIBPT: 0.1345,
      aliqCBS: 0.009,
      aliqIBS: 0.001,
      aliqISS: 0.03,
      textoComplementar: 'REFORMA TRIBUTARIA 2026',
    },
  }

  it('deve gerar o payload da NFe com as novas tags de imposto (IBS/CBS)', () => {
    const payload = NuvemfiscalMapper.mapToNfe(mockContext)

    const imposto = payload.infNFe.det[0].imposto

    // Verificação IBS
    expect(imposto.IBS).toBeDefined()
    expect(imposto.IBS.pIBS).toBe(0.1) // 0.1% em nuvemfiscal é pIBS * 100? No mapper: pIBS: rules.aliqIBS * 100
    // Wait, let me check the mapper again for Nuvem Fiscal
    // rules.aliqIBS is 0.001. 0.001 * 100 = 0.1.

    // Verificação CBS
    expect(imposto.CBS).toBeDefined()
    expect(imposto.CBS.pCBS).toBe(0.9)

    // Verificação Texto Complementar
    expect(payload.infNFe.infAdic.infCpl).toContain('REFORMA TRIBUTARIA')
  })

  it('deve gerar o payload da NFSe para a Nuvem Fiscal', () => {
    const payload = NuvemfiscalMapper.mapToNfse(mockContext)

    // Estrutura DPS Nacional
    expect(payload.infDPS).toBeDefined()
    expect(payload.infDPS.prest.CNPJ).toBe(mockContext.empresa.cnpj)
    expect(payload.infDPS.toma.xNome).toBe(mockContext.cliente.nome)
    expect(payload.infDPS.serv.cServ.xDescServ).toContain(
      mockContext.produto.produto,
    )
    expect(payload.infDPS.valores.vServPrest.vServ).toBe(3500) // 350000 / 100

    // Verificação IBS/CBS na NFSe
    expect(payload.infDPS.IBSCBS.valores.trib.gIBSCBS.vIBS).toBeGreaterThan(0)
    expect(payload.infDPS.IBSCBS.valores.trib.gIBSCBS.pIBS).toBe(0.1)
  })
})
