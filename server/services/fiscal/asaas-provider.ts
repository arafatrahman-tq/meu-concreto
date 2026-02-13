import { FiscalCore } from '../../utils/fiscal/core'
import { AsaasMapper } from '../../utils/fiscal/mappers/asaas'
import type { FiscalProvider, FiscalEmitResponse } from './provider'

/**
 * Asaas Fiscal Provider
 * Note: Asaas focus is on NFSe (Service Invoice) linked to payments.
 */
export class AsaasFiscalProvider implements FiscalProvider {
  name = 'Asaas'

  async emitNfe(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
    // Asaas doesn't typically handle NFe (Products), only NFSe (Services)
    return {
      sucesso: false,
      error: 'Asaas não suporta emissão de NF-e (Produtos), apenas NFS-e (Serviços).',
    }
  }

  async emitNfse(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
    try {
      const ctx = await FiscalCore.getContext(vendaData)
      const mappedData = AsaasMapper.mapToNfse(ctx)

      console.log(`[Asaas] Emitindo NFS-e para Venda #${vendaData.id} na Empresa #${idEmpresa}`)

      // Mocking for now: result would come from asaasService.emitNfse(idEmpresa, mappedData)
      return {
        sucesso: true,
        numero: Math.floor(Math.random() * 10000),
        link: 'https://www.asaas.com/nfse/...',
      }
    }
    catch (error: any) {
      return {
        sucesso: false,
        error: error.message,
      }
    }
  }
}
