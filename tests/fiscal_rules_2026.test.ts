
import { describe, it, expect } from "bun:test";
import { FiscalRulesEngine } from "../server/utils/fiscal/rules";

describe("Fiscal Rules Engine - Reforma Tributária 2026", () => {
    
    it("deve aplicar as alíquotas de transição IBS e CBS para 2026", () => {
        const rules = FiscalRulesEngine.getRules("SP", "SP");
        
        expect(rules.aliqCBS).toBe(0.009); // 0.9%
        expect(rules.aliqIBS).toBe(0.001); // 0.1%
        expect(rules.textoComplementar).toContain("CBS (0,9%)");
        expect(rules.textoComplementar).toContain("IBS (0,1%)");
    });

    it("deve configurar CFOP 5101 para operações internas (SP -> SP)", () => {
        const rules = FiscalRulesEngine.getRules("SP", "SP");
        
        expect(rules.cfop).toBe("5101");
        expect(rules.cBenef).toBe("SP806342"); // Benefício específico de SP
    });

    it("deve configurar CFOP 5101 para operações internas (PR -> PR)", () => {
        const rules = FiscalRulesEngine.getRules("PR", "PR");
        
        expect(rules.cfop).toBe("5101");
        expect(rules.cBenef).toBe("PR850001"); // Benefício específico do PR
    });

    it("deve configurar CFOP 6101 para operações interestaduais (SP -> PR)", () => {
        const rules = FiscalRulesEngine.getRules("SP", "PR");
        
        expect(rules.cfop).toBe("6101");
        // Em operações interestaduais, geralmente o cBenef de redução interna não se aplica ou muda
        expect(rules.cBenef).toBeUndefined(); 
    });

    it("deve retornar o código IBGE correto para os estados", () => {
        expect(FiscalRulesEngine.getUfCode("SP")).toBe("35");
        expect(FiscalRulesEngine.getUfCode("PR")).toBe("41");
        expect(FiscalRulesEngine.getUfCode("RJ")).toBe("33");
    });

    it("deve usar SP (35) como padrão para UFs desconhecidas", () => {
        expect(FiscalRulesEngine.getUfCode("XX")).toBe("35");
    });

    it("deve garantir que o CSOSN padrão seja 102 para Simples Nacional", () => {
        const rules = FiscalRulesEngine.getRules("SP", "RJ");
        expect(rules.csosn).toBe("102");
    });
});
