import { blingService } from "../../utils/bling";
import { FiscalCore } from "../../utils/fiscal/core";
import { BlingMapper } from "../../utils/fiscal/mappers/bling";
import type { FiscalProvider, FiscalEmitResponse } from "./provider";

export class BlingFiscalProvider implements FiscalProvider {
    name = "Bling";

    async emitNfe(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
        try {
            const ctx = await FiscalCore.getContext(vendaData);
            const mappedData = BlingMapper.mapToNfe(ctx);
            
            const result = await blingService.emitNfe(idEmpresa, mappedData);
            return {
                sucesso: result.sucesso,
                numero: result.numero,
                serie: result.serie,
                link: result.link
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
            const mappedData = BlingMapper.mapToNfe(ctx);

            const result = await blingService.emitNfse(idEmpresa, mappedData);
            return {
                sucesso: result.sucesso,
                numero: result.numero,
                link: result.link
            };
        } catch (error: any) {
            return {
                sucesso: false,
                error: error.message
            };
        }
    }
}
