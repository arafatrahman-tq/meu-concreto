import { describe, it, expect } from 'bun:test'
import { BlingMapper } from '../server/utils/fiscal/mappers/bling'
import type { FiscalContext } from '../server/utils/fiscal/core'

describe('Bling Mapper - Payload Verification 2026', () => {
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
      textoComplementar: 'REFORMA TRIBUTARIA 2026',
    },
  }

  it('deve gerar o payload da NFe para o Bling V3 com suporte a IBS/CBS', () => {
    const payload = BlingMapper.mapToNfe(mockContext)

    expect(payload.contato.numeroDocumento).toBe('98765432100')
    expect(payload.itens[0].quantidade).toBe(10)
    expect(payload.itens[0].valor).toBe(350) // 35000 / 100

    // Verificação IBS/CBS
    expect(payload.itens[0].impostos.ibs.aliquota).toBe(0.1) // 0.001 * 100
    expect(payload.itens[0].impostos.cbs.aliquota).toBe(0.9) // 0.009 * 100

    expect(payload.obs).toContain('REFORMA TRIBUTARIA 2026')
  })
})
