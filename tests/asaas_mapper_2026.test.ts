
import { describe, it, expect } from "bun:test";
import { AsaasMapper } from "../server/utils/fiscal/mappers/asaas";
import { FiscalContext } from "../server/utils/fiscal/core";

describe("Asaas Mapper - Payload Verification 2026", () => {
    
    const mockContext: FiscalContext = {
        venda: { id: 1, idEmpresa: 1 },
        orcamento: { 
            id: 100, 
            qtd: 10, 
            valorUnit: 35000, 
            total: 350000, 
            cidade: "São Paulo",
            valorDesconto: 0 
        },
        empresa: { 
            cnpj: "12345678000199", 
            empresa: "Minha Empresa", 
            estado: "SP", 
            cidade: "São Paulo", 
            cidadeIbge: "3550308",
            ie: "123456789",
            crt: 1 
        },
        cliente: { 
            cpfCnpj: "98765432100", 
            nome: "Cliente Teste", 
            estado: "SP", 
            cidade: "São Paulo", 
            cidadeIbge: "3550308",
            email: "cliente@teste.com"
        },
        produto: { 
            id: 1, 
            produto: "Concreto B25", 
            fck: "25",
            unidadeMedida: "m3",
            ncm: "38245000",
            origem: 0 
        },
        infoInsumos: "Cimento: 300kg; Areia: 0.5m3",
        rules: {
            cfop: "5101",
            csosn: "102",
            cstPIS: "07",
            cstCOFINS: "07",
            aliqIBPT: 0.1345,
            aliqCBS: 0.009,
            aliqIBS: 0.001,
            textoComplementar: "REFORMA TRIBUTARIA 2026"
        }
    };

    it("deve gerar o payload da NFSe para o Asaas com suporte a IBS", () => {
        const payload = AsaasMapper.mapToNfse(mockContext);
        
        expect(payload.value).toBe(3500); // 350000 / 100
        expect(payload.serviceDescription).toContain("Cimento: 300kg");
        expect(payload.serviceDescription).toContain("REFORMA TRIBUTARIA 2026");
        
        // Verificação IBS (mapeado como ISS no Asaas por enquanto)
        // No mapper: issPercentage: rules.aliqIBS * 100 / 2
        // rules.aliqIBS = 0.001 -> 0.1 / 2 = 0.05
        expect(payload.tax.issPercentage).toBe(0.05);
    });
});
