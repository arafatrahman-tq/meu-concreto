
import { FiscalCore } from "./core";
import { NuvemfiscalMapper } from "./mappers/nuvemfiscal";

/**
 * Fiscal Mapper Entry Point
 * Centraliza a lógica de mapeamento para diferentes provedores (Nuvem Fiscal, Bling, etc.)
 */
export const fiscalMapper = {
  /**
   * Mapeia uma venda para o formato NFe do provedor configurado.
   */
  async mapVendaToNfe(venda: any, provider: 'nuvemfiscal' | 'bling' | 'asaas' = 'nuvemfiscal') {
    const ctx = await FiscalCore.getContext(venda);

    switch (provider) {
      case 'nuvemfiscal':
        return NuvemfiscalMapper.mapToNfe(ctx);
      default:
        throw new Error(`Mapper para o provedor ${provider} não implementado.`);
    }
  },

  /**
   * Mapeia uma venda para o formato NFSe do provedor configurado.
   */
  async mapVendaToNfse(venda: any, provider: 'nuvemfiscal' | 'bling' | 'asaas' = 'nuvemfiscal') {
    const ctx = await FiscalCore.getContext(venda);

    switch (provider) {
      case 'nuvemfiscal':
        return NuvemfiscalMapper.mapToNfse(ctx);
      default:
        throw new Error(`Mapper para o provedor ${provider} não implementado.`);
    }
  }
};
