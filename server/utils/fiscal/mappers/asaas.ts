import { FiscalContext } from "../core";

export class AsaasMapper {
    /**
     * Mapeia para o formato de nota fiscal de serviço (NFS-e) do Asaas
     */
    static mapToNfse(ctx: FiscalContext) {
        const { empresa, cliente, orcamento, rules } = ctx;

        return {
            customer: cliente.asaasId || undefined, // Se já existir no Asaas
            serviceDescription: `Fornecimento de Concreto e Serviços. ${ctx.infoInsumos}. ${rules.textoComplementar}`,
            observations: `Unidade: ${empresa.empresa}`,
            value: orcamento.total / 100,
            deductions: 0,
            effectiveDate: new Date().toISOString().split('T')[0],
            municipalServiceCode: empresa.codigoServicoMunicipal || "07.02",
            // Configurações de impostos para 2026 (IBS municipal/estadual)
            tax: {
                retainIss: false,
                issPercentage: Number((rules.aliqIBS * 100 / 2).toFixed(4)), // Exemplo: divisão IBS entre municipal e estadual
                cofinsPercentage: 0,
                pisPercentage: 0,
                csllPercentage: 0,
                irPercentage: 0,
                inssPercentage: 0
            }
        };
    }
}
