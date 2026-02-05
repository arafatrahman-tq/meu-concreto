import { nuvemfiscalService } from "../../utils/nuvemfiscal";
import { FiscalCore } from "../../utils/fiscal/core";
import { NuvemfiscalMapper } from "../../utils/fiscal/mappers/nuvemfiscal";
import type { FiscalProvider, FiscalEmitResponse } from "./provider";

export class NuvemfiscalFiscalProvider implements FiscalProvider {
    name = "Nuvem Fiscal";

    async emitNfe(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
        try {
            const ctx = await FiscalCore.getContext(vendaData);
            const mappedData = NuvemfiscalMapper.mapToNfe(ctx);

            const result = await nuvemfiscalService.emitNfe(idEmpresa, mappedData);
            
            // Nuvem Fiscal retorna um objeto com status e identificadores
            return {
                sucesso: true,
                numero: result.numero,
                serie: result.serie,
                chave: result.chave,
                link: result.link_pdf || result.link_visualizacao
            };
        } catch (error: any) {
            return {
                sucesso: false,
                error: error.message
            };
        }
    }

    async emitNfse(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
        try {
            const ctx = await FiscalCore.getContext(vendaData);
            const mappedData = NuvemfiscalMapper.mapToNfse(ctx);

            const result = await nuvemfiscalService.emitNfse(idEmpresa, mappedData);
            return {
                sucesso: true,
                numero: result.numero,
                link: result.link_pdf || result.link_visualizacao
            };
        } catch (error: any) {
            return {
                sucesso: false,
                error: error.message
            };
        }
    }
}
