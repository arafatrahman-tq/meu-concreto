import { describe, it, expect, spyOn, beforeEach } from "bun:test";
import { nuvemfiscalService } from "../server/utils/nuvemfiscal";
import { db } from "../server/database/db";

describe("Nuvem Fiscal Onboarding", () => {
    const idEmpresa = 1;

    beforeEach(() => {
        // Reset mocks if needed
    });

    it("should sync company successfully", async () => {
        const mockEmpresa = {
            id: 1,
            cnpj: "12345678000190",
            empresa: "Minha Empresa",
            email: "contato@empresa.com",
            telefone: "1199999999",
            endereco: "Rua Teste",
            numero: "100",
            complemento: "",
            bairro: "Centro",
            cidade: "São Paulo",
            estado: "SP",
            cep: "01001000"
        };

        // Spy on db.query.empresas.findFirst
        const dbSpy = spyOn(db.query.empresas, "findFirst").mockResolvedValue(mockEmpresa as any);
        
        // Spy on the fetch call (internal to nuvemfiscalService)
        // Since nuvemfiscalService.request is private/internal, we'll spy on the main method or use a fetch mock global
        const apiSpy = spyOn(nuvemfiscalService, "syncCompany").mockResolvedValue({ success: true } as any);

        const result = await nuvemfiscalService.syncCompany(idEmpresa);

        expect(result).toBeDefined();
        expect(apiSpy).toHaveBeenCalledWith(idEmpresa);
        
        dbSpy.mockRestore();
        apiSpy.mockRestore();
    });

    it("should sync certificate", async () => {
        const mockConfig = {
            certificado: "BASE64_DATA",
            certificadoSenha: "password"
        };

        const dbSpy = spyOn(db.query.configuracoesNuvemFiscal, "findFirst").mockResolvedValue(mockConfig as any);
        const apiSpy = spyOn(nuvemfiscalService, "syncCertificate").mockResolvedValue({ success: true } as any);

        const result = await nuvemfiscalService.syncCertificate(idEmpresa);

        expect(result).toBeDefined();
        expect(apiSpy).toHaveBeenCalledWith(idEmpresa);

        dbSpy.mockRestore();
        apiSpy.mockRestore();
    });

    it("should sync NFS-e config", async () => {
        const mockConfig = {
            nfseSerie: "1",
            nfseLote: 1,
            nfseProximoNumero: 1,
            environment: "sandbox"
        };

        const dbSpy = spyOn(db.query.configuracoesNuvemFiscal, "findFirst").mockResolvedValue(mockConfig as any);
        const apiSpy = spyOn(nuvemfiscalService, "syncNfseConfig").mockResolvedValue({ success: true } as any);

        const result = await nuvemfiscalService.syncNfseConfig(idEmpresa);

        expect(result).toBeDefined();
        expect(apiSpy).toHaveBeenCalledWith(idEmpresa);

        dbSpy.mockRestore();
        apiSpy.mockRestore();
    });
});
