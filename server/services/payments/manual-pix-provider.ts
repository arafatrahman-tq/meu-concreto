import { db } from "../../database/db";
import { configuracoesPixManual } from "../../database/schema";
import { eq } from "drizzle-orm";
import type {
  PaymentProvider,
  PaymentOptions,
  PaymentResponse,
} from "./provider";
import { generateStaticPix } from "../../utils/pix";

export class ManualPixProvider implements PaymentProvider {
  name = "MANUAL_PIX";

  async createPayment(
    idEmpresa: number,
    options: PaymentOptions,
  ): Promise<PaymentResponse> {
    try {
      const config = await db.query.configuracoesPixManual.findFirst({
        where: eq(configuracoesPixManual.idEmpresa, idEmpresa),
      });

      if (!config || !config.ativo) {
        return {
          sucesso: false,
          error: "Configuração de Pix Manual não encontrada ou desativada",
        };
      }

      const pixCode = generateStaticPix({
        chave: config.chavePix,
        beneficiario: config.beneficiario,
        cidade: config.cidade,
        valor: options.valor / 100, // converte de centavos para reais
        identificador: options.idReferencia?.substring(0, 25), // Limite do Pix estático
      });

      return {
        sucesso: true,
        providerId: `MANUAL_${Date.now()}`,
        qrCode: pixCode,
      };
    } catch (error: any) {
      return { sucesso: false, error: error.message };
    }
  }
}
