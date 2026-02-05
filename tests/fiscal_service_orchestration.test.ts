import { describe, it, expect, mock, spyOn, beforeEach, afterEach } from "bun:test";
import { FiscalService } from "../server/services/fiscal";
import { db } from "../server/database/db";
import { BlingFiscalProvider } from "../server/services/fiscal/bling-provider";
import { AsaasFiscalProvider } from "../server/services/fiscal/asaas-provider";
import { NuvemfiscalFiscalProvider } from "../server/services/fiscal/nuvemfiscal-provider";

describe("FiscalService Orchestration", () => {
  const idEmpresa = 1;
  const mockVenda = { id: 100, total: 50000 };

  // Spies for individual providers to verify which one was used
  let blingSpy: any;
  let asaasSpy: any;
  let nuvemfiscalSpy: any;

  beforeEach(() => {
    blingSpy = spyOn(BlingFiscalProvider.prototype, "emitNfse").mockResolvedValue({ sucesso: true, numero: 1 });
    asaasSpy = spyOn(AsaasFiscalProvider.prototype, "emitNfse").mockResolvedValue({ sucesso: true, numero: 2 });
    nuvemfiscalSpy = spyOn(NuvemfiscalFiscalProvider.prototype, "emitNfse").mockResolvedValue({ sucesso: true, numero: 3 });
  });

  afterEach(() => {
    blingSpy.mockRestore();
    asaasSpy.mockRestore();
    nuvemfiscalSpy.mockRestore();
    mock.restore();
  });

  it("should select Bling when active (Priority 1)", async () => {
    // Mock DB to return Bling config
    spyOn(db.query.configuracoesBling, "findFirst").mockResolvedValue({ id: 1, ativo: 1 } as any);
    
    await FiscalService.emitNfse(idEmpresa, mockVenda);

    expect(blingSpy).toHaveBeenCalled();
    expect(asaasSpy).not.toHaveBeenCalled();
    expect(nuvemfiscalSpy).not.toHaveBeenCalled();
  });

  it("should select Asaas when Bling is inactive and Asaas is active (Priority 2)", async () => {
    // Bling returns null
    spyOn(db.query.configuracoesBling, "findFirst").mockResolvedValue(null as any);
    // Asaas returns config
    spyOn(db.query.configuracoesAsaas, "findFirst").mockResolvedValue({ id: 1, ativo: 1 } as any);
    
    await FiscalService.emitNfse(idEmpresa, mockVenda);

    expect(blingSpy).not.toHaveBeenCalled();
    expect(asaasSpy).toHaveBeenCalled();
    expect(nuvemfiscalSpy).not.toHaveBeenCalled();
  });

  it("should select Nuvem Fiscal when others are inactive (Priority 3)", async () => {
    // Bling and Asaas return null
    spyOn(db.query.configuracoesBling, "findFirst").mockResolvedValue(null as any);
    spyOn(db.query.configuracoesAsaas, "findFirst").mockResolvedValue(null as any);
    // Nuvem Fiscal returns config
    spyOn(db.query.configuracoesNuvemFiscal, "findFirst").mockResolvedValue({ id: 1, ativo: 1 } as any);
    
    await FiscalService.emitNfse(idEmpresa, mockVenda);

    expect(blingSpy).not.toHaveBeenCalled();
    expect(asaasSpy).not.toHaveBeenCalled();
    expect(nuvemfiscalSpy).toHaveBeenCalled();
  });

  it("should throw error when no provider is configured", async () => {
    spyOn(db.query.configuracoesBling, "findFirst").mockResolvedValue(null as any);
    spyOn(db.query.configuracoesAsaas, "findFirst").mockResolvedValue(null as any);
    spyOn(db.query.configuracoesNuvemFiscal, "findFirst").mockResolvedValue(null as any);
    
    expect(FiscalService.emitNfse(idEmpresa, mockVenda)).rejects.toThrow("Nenhum provedor fiscal configurado ou ativo para esta empresa.");
  });
});
