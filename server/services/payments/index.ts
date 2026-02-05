import { db } from "../../database/db";
import {
  configuracoesSicoob,
  configuracoesAsaas,
  configuracoesPixManual,
} from "../../database/schema";
import { eq, and } from "drizzle-orm";
import { SicoobPaymentProvider } from "./sicoob-provider";
import { AsaasPaymentProvider } from "./asaas-provider";
import { ManualPixProvider } from "./manual-pix-provider";
import type {
  PaymentProvider,
  PaymentOptions,
  PaymentResponse,
} from "./provider";

export class PaymentService {
  /**
   * Resolves the primary payment provider based on type and configuration.
   * Logic:
   * 1. If PIX and Sicoob is active -> Use Sicoob
   * 2. If Asaas is active -> Use Asaas
   * 3. Fallback to Manual Pix
   */
  private static async getProvider(
    idEmpresa: number,
    options: PaymentOptions,
  ): Promise<PaymentProvider> {
    // Try Sicoob for PIX
    if (options.tipo === "PIX") {
      const sicoob = await db.query.configuracoesSicoob.findFirst({
        where: and(
          eq(configuracoesSicoob.idEmpresa, idEmpresa),
          eq(configuracoesSicoob.ativo, 1),
        ),
      });
      if (sicoob) return new SicoobPaymentProvider();
    }

    // Try Asaas
    const asaas = await db.query.configuracoesAsaas.findFirst({
      where: and(
        eq(configuracoesAsaas.idEmpresa, idEmpresa),
        eq(configuracoesAsaas.ativo, 1),
      ),
    });
    if (asaas) return new AsaasPaymentProvider();

    // Default to Manual Pix
    return new ManualPixProvider();
  }

  /**
   * Creates a payment using the best available provider.
   */
  static async createPayment(
    idEmpresa: number,
    options: PaymentOptions,
  ): Promise<PaymentResponse> {
    const provider = await this.getProvider(idEmpresa, options);
    let response = await provider.createPayment(idEmpresa, options);

    // Fallback logic
    if (!response.sucesso) {
      if (provider instanceof SicoobPaymentProvider) {
        console.warn(
          `[PaymentService] Sicoob failed, falling back to Asaas: ${response.error}`,
        );
        const asaas = new AsaasPaymentProvider();
        response = await asaas.createPayment(idEmpresa, options);

        if (!response.sucesso) {
          console.warn(
            `[PaymentService] Asaas fallback failed, trying Manual Pix: ${response.error}`,
          );
          const manual = new ManualPixProvider();
          response = await manual.createPayment(idEmpresa, options);
        }
      } else if (provider instanceof AsaasPaymentProvider) {
        console.warn(
          `[PaymentService] Asaas failed, falling back to Manual Pix: ${response.error}`,
        );
        const manual = new ManualPixProvider();
        response = await manual.createPayment(idEmpresa, options);
      }
    }

    return response;
  }
}
