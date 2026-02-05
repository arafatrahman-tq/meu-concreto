import { db } from "../../database/db";
import { configuracoes } from "../../database/schema";
import { eq, and } from "drizzle-orm";

export interface FiscalRule {
    cfop: string;
    csosn: string;
    cstPIS: string;
    cstCOFINS: string;
    aliqIBPT: number;
    aliqCBS: number;
    aliqIBS: number;
    aliqISS: number;
    cBenef?: string;
    textoComplementar: string;
}

export const UF_CODES: Record<string, string> = {
    "AC": "12", "AL": "27", "AM": "13", "AP": "16", "BA": "29", "CE": "23",
    "DF": "53", "ES": "32", "GO": "52", "MA": "21", "MG": "31", "MS": "50",
    "MT": "51", "PA": "15", "PB": "25", "PE": "26", "PI": "22", "PR": "41",
    "RJ": "33", "RN": "24", "RO": "11", "RR": "14", "RS": "43", "SC": "42",
    "SE": "28", "SP": "35", "TO": "17"
};

export class FiscalRulesEngine {
    /**
     * Versão síncrona original para compatibilidade com legível/mappers simples.
     */
    static getRules(origemUF: string, destinoUF: string, crt: number = 1): FiscalRule {
        const isInterestadual = origemUF.toUpperCase() !== destinoUF.toUpperCase();
        
        // Regras baseadas na transição 2026 (EC 132/23)
        const rule: FiscalRule = {
            cfop: isInterestadual ? "6101" : "5101",
            csosn: crt === 1 ? "102" : "101", 
            cstPIS: "07",
            cstCOFINS: "07",
            aliqIBPT: 0.1345,
            aliqCBS: 0.009, // 0.9% para 2026
            aliqIBS: 0.001, // 0.1% para 2026
            aliqISS: 0.03, // 3% padrão para concreteiras em muitos municípios
            textoComplementar: "DOC. EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI. TRANSICAO REFORMA TRIBUTARIA: CBS 0,9% E IBS 0,1% NOS TERMOS DA EC 132/23."
        };

        // Tratamento de Benefícios Fiscais Estaduais
        if (destinoUF.toUpperCase() === "SP" && !isInterestadual) {
            rule.cBenef = "SP806342";
        }

        if (destinoUF.toUpperCase() === "PR" && !isInterestadual) {
            rule.cBenef = "PR850001";
        }

        return rule;
    }

    /**
     * Versão assíncrona que verifica patches dinâmicos da IA em produção.
     */
    static async getRulesAsync(idEmpresa: number, origemUF: string, destinoUF: string, crt: number = 1): Promise<FiscalRule> {
        // Primeiro pega a regra estática base
        const rule = this.getRules(origemUF, destinoUF, crt);

        try {
            // Tenta buscar um patch dinâmico no banco de dados
            const patch = await db.query.configuracoes.findFirst({
                where: and(
                    eq(configuracoes.idEmpresa, 1), // Configurações globais/master
                    eq(configuracoes.chave, 'AI_FISCAL_PATCH_CORE')
                )
            });

            if (patch && patch.valor) {
                const patchData = JSON.parse(patch.valor);
                // Se o patch for um objeto de dados (mais seguro que eval)
                if (patchData.overrides) {
                    const key = `${origemUF}-${destinoUF}`;
                    if (patchData.overrides[key]) {
                        return { ...rule, ...patchData.overrides[key] };
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao carregar patch fiscal dinâmico:", e);
        }

        return rule;
    }

    static getUfCode(uf: string): string {
        return UF_CODES[uf.toUpperCase()] || "35";
    }
}