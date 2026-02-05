import { db } from "../database/db";
import { configuracoesAsaas } from "../database/schema";
import { eq } from "drizzle-orm";

export interface AsaasBillingOptions {
  customer: string;
  billingType: "BOLETO" | "PIX" | "CREDIT_CARD" | "UNDEFINED";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
}

const getAsaasConfig = async (idEmpresa?: number) => {
  const config = await db.query.configuracoesAsaas.findFirst({
    where: idEmpresa ? eq(configuracoesAsaas.idEmpresa, idEmpresa) : undefined,
  });

  if (!config || !config.apiKey) {
    throw new Error("Configuração do Asaas (API Key) não encontrada.");
  }

  const baseUrl =
    config.environment === "production"
      ? "https://www.asaas.com/api/v3"
      : "https://sandbox.asaas.com/api/v3";

  return { apiKey: config.apiKey, baseUrl };
};

export const asaasService = {
  /**
   * Busca ou cria um cliente no Asaas pelo CPF/CNPJ
   */
  async findOrCreateCustomer(
    idEmpresa: number,
    customerData: {
      name: string;
      cpfCnpj: string;
      email?: string;
      phone?: string;
    },
  ) {
    const { apiKey, baseUrl } = await getAsaasConfig(idEmpresa);

    // 1. Tentar buscar cliente existente
    const searchUrl = `${baseUrl}/customers?cpfCnpj=${customerData.cpfCnpj.replace(/\D/g, "")}`;
    const searchRes = await fetch(searchUrl, {
      headers: { access_token: apiKey },
    });
    const searchData: any = await searchRes.json();

    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id;
    }

    // 2. Se não existir, criar
    const createRes = await fetch(`${baseUrl}/customers`, {
      method: "POST",
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: customerData.name,
        cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ""),
        email: customerData.email,
        mobilePhone: customerData.phone?.replace(/\D/g, ""),
      }),
    });

    const createdData: any = await createRes.json();
    if (createdData.errors) {
      throw new Error(
        `Erro ao criar cliente no Asaas: ${JSON.stringify(createdData.errors)}`,
      );
    }

    return createdData.id;
  },

  /**
   * Cria uma cobrança (Billing) no Asaas
   */
  async createBilling(idEmpresa: number, options: AsaasBillingOptions) {
    const { apiKey, baseUrl } = await getAsaasConfig(idEmpresa);

    const body = {
      customer: options.customer,
      billingType:
        options.billingType === "UNDEFINED" ? "BOLETO" : options.billingType,
      value: options.value,
      dueDate: options.dueDate,
      description: options.description,
      externalReference: options.externalReference,
      postalService: false,
    };

    const response = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data: any = await response.json();

    if (data.errors) {
      throw new Error(
        `Erro ao criar cobrança no Asaas: ${JSON.stringify(data.errors)}`,
      );
    }

    return {
      id: data.id,
      invoiceUrl: data.invoiceUrl,
      status: data.status,
      pixCopiaECola: data.pixCopiaECola || data.copyAndPaste,
    };
  },

  /**
   * Emite uma nota fiscal de serviço (NFS-e) no Asaas
   */
  async emitNfse(idEmpresa: number, nfseData: any) {
    const { apiKey, baseUrl } = await getAsaasConfig(idEmpresa);

    const response = await fetch(`${baseUrl}/invoices`, {
      method: "POST",
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nfseData),
    });

    const data: any = await response.json();
    if (data.errors) {
      throw new Error(`Erro ao emitir NFS-e no Asaas: ${JSON.stringify(data.errors)}`);
    }

    return {
      sucesso: true,
      id: data.id,
      numero: data.number,
      link: data.pdfUrl || data.xmlUrl,
      status: data.status
    };
  }
};
