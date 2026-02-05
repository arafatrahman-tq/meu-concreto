import { db } from "../../database/db";
import { configuracoesBling, configuracoesAsaas, configuracoesNuvemFiscal } from "../../database/schema";
import { eq, and } from "drizzle-orm";
import { BlingFiscalProvider } from "./bling-provider";
import { AsaasFiscalProvider } from "./asaas-provider";
import { NuvemfiscalFiscalProvider } from "./nuvemfiscal-provider";
import type { FiscalProvider, FiscalEmitResponse } from "./provider";

/**
 * Centralized service for fiscal operations.
 * Coordinates between different providers (Bling, Asaas, Nuvem Fiscal) based on company configuration.
 */
export class FiscalService {
    /**
     * Resolves the active fiscal provider for a given company.
     * Priority: 1. Bling, 2. Asaas, 3. Nuvem Fiscal
     */
    private static async getProvider(idEmpresa: number): Promise<FiscalProvider> {
        // Check for active Bling configuration
        const bling = await db.query.configuracoesBling.findFirst({
            where: and(eq(configuracoesBling.idEmpresa, idEmpresa), eq(configuracoesBling.ativo, 1))
        });
        if (bling) return new BlingFiscalProvider();

        // Check for active Asaas configuration
        const asaas = await db.query.configuracoesAsaas.findFirst({
            where: and(eq(configuracoesAsaas.idEmpresa, idEmpresa), eq(configuracoesAsaas.ativo, 1))
        });
        if (asaas) return new AsaasFiscalProvider();

        // Check for active Nuvem Fiscal configuration
        const nuvemfiscal = await db.query.configuracoesNuvemFiscal.findFirst({
            where: and(eq(configuracoesNuvemFiscal.idEmpresa, idEmpresa), eq(configuracoesNuvemFiscal.ativo, 1))
        });
        if (nuvemfiscal) return new NuvemfiscalFiscalProvider();

        throw new Error("Nenhum provedor fiscal configurado ou ativo para esta empresa.");
    }

    /**
     * Emits a Product Invoice (NF-e)
     */
    static async emitNfe(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
        const provider = await this.getProvider(idEmpresa);
        return provider.emitNfe(idEmpresa, vendaData);
    }

    /**
     * Emits a Service Invoice (NFS-e)
     */
    static async emitNfse(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse> {
        const provider = await this.getProvider(idEmpresa);
        return provider.emitNfse(idEmpresa, vendaData);
    }
}
