import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from 'bun:test'

import { FiscalService } from '../server/services/fiscal'
import { db } from '../server/database/db'
import { vendas } from '../server/database/schema';

// Mock other Nuxt utilities used in the handler (MUST be before require)
(global as any).defineEventHandler = (fn: any) => fn;
(global as any).getRouterParam = (event: any, param: string) => event.params[param];
(global as any).setResponseStatus = () => {};
(global as any).createError = (err: any) => {
  const e = new Error(err.message) as any
  e.statusCode = err.statusCode
  return e
};
(global as any).readBody = async (event: any) => event.body

// Use require to ensure it picks up the globals defined above
const nfseHandler = require('../server/api/vendas/[id]/nfse.post').default

describe('API: NFS-e Emission Endpoint', () => {
  const handler = nfseHandler
  const mockVenda = {
    id: 1,
    idEmpresa: 1,
    total: 50000,
    orcamento: { id: 10 },
  }

  beforeEach(() => {
    // Mock authentication
    mock.module('../server/utils/auth', () => ({
      requireAuth: () => ({ id: 'user-1', idEmpresa: 1 }),
    }))
  })

  afterEach(() => {
    mock.restore()
  })

  it('should emit NFS-e and update database with results', async () => {
    // 1. Mock DB query to find the sale
    const findFirstSpy = spyOn(db.query.vendas, 'findFirst').mockResolvedValue(mockVenda as any)

    // 2. Mock FiscalService emission
    const emitSpy = spyOn(FiscalService, 'emitNfse').mockResolvedValue({
      sucesso: true,
      numero: 12345,
      link: 'https://nfse.gov.br/visualizar/12345',
    })

    // 3. Mock DB update
    const updateSpy = spyOn(db, 'update').mockReturnValue({
      set: mock().mockReturnValue({
        where: mock().mockResolvedValue({}),
      }),
    } as any)

    const event = {
      params: { id: '1' },
      context: { user: { id: 'user-1' } },
    }

    const result = await handler(event)

    // Verify FiscalService was called
    expect(emitSpy).toHaveBeenCalledWith(mockVenda.idEmpresa, mockVenda)

    // Verify DB update was called with correct values
    expect(updateSpy).toHaveBeenCalledWith(vendas)
    // The spy for .set should have been called with status: 'NF_EMITIDA' and the meta data

    expect(result.message).toBe('NFS-e emitida com sucesso')
    expect(result.numero).toBe(12345)
    expect(result.link).toBe('https://nfse.gov.br/visualizar/12345')
  })

  it('should throw 404 if sale is not found', async () => {
    spyOn(db.query.vendas, 'findFirst').mockResolvedValue(null as any)

    const event = {
      params: { id: '999' },
    }

    expect(handler(event)).rejects.toThrow('Venda não encontrada')
  })

  it('should throw 400 if emission fails', async () => {
    spyOn(db.query.vendas, 'findFirst').mockResolvedValue(mockVenda as any)
    spyOn(FiscalService, 'emitNfse').mockResolvedValue({
      sucesso: false,
      error: 'Falha na comunicação com a prefeitura',
    })

    const event = {
      params: { id: '1' },
    }

    expect(handler(event)).rejects.toThrow('Falha na comunicação com a prefeitura')
  })
})
