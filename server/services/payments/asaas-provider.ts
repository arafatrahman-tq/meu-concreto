import { asaasService } from "../../utils/asaas";
import type {
  PaymentProvider,
  PaymentOptions,
  PaymentResponse,
} from "./provider";

export class AsaasPaymentProvider implements PaymentProvider {
  name = "Asaas";

  async createPayment(
    idEmpresa: number,
    options: PaymentOptions,
  ): Promise<PaymentResponse> {
    try {
      // 1. Garantir cliente no Asaas
      const customerId = await asaasService.findOrCreateCustomer(idEmpresa, {
        name: options.nomeCliente,
        cpfCnpj: options.cpfCnpj,
        email: options.email,
        phone: options.telefone,
      });

      // 2. Criar cobrança
      const billing = await asaasService.createBilling(idEmpresa, {
        customer: customerId,
        billingType:
          options.tipo === "PIX"
            ? "PIX"
            : options.tipo === "BOLETO"
              ? "BOLETO"
              : "CREDIT_CARD",
        value: options.valor / 100, // Centavos para Reais
        dueDate: options.vencimento.toISOString().split("T")[0]!,
        description: options.descricao,
        externalReference: options.idReferencia,
      });

      return {
        sucesso: true,
        providerId: billing.id,
        link: billing.invoiceUrl,
        qrCode: billing.pixCopiaECola,
      };
    } catch (error: any) {
      return {
        sucesso: false,
        error: error.message || "Erro desconhecido no Asaas",
      };
    }
  }
}
