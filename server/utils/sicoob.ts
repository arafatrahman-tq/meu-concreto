import { db } from "../database/db";
import { configuracoesSicoob } from "../database/schema";
import { eq } from "drizzle-orm";

export interface SicoobPixOptions {
  valor: number; // em centavos
  expiracao?: number; // em segundos
  chave: string;
  devedor: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
  solicitacaoPagador?: string;
}

const getSicoobConfig = async (idEmpresa: number) => {
  const config = await db.query.configuracoesSicoob.findFirst({
    where: eq(configuracoesSicoob.idEmpresa, idEmpresa),
  });

  if (
    !config ||
    !config.certificate ||
    !config.privateKey ||
    !config.clientId
  ) {
    throw new Error("Configuração Sicoob incompleta para a empresa.");
  }

  const isSandbox = config.environment === "sandbox";

  // URLs baseadas na documentação oficial do Sicoob
  const baseUrl = isSandbox
    ? "https://sandbox.sicoob.com.br/pix/api/v2"
    : "https://api.sicoob.com.br/pix/api/v2";

  const authUrl = isSandbox
    ? "https://sandbox.sicoob.com.br/token"
    : "https://api.sicoob.com.br/token";

  return {
    config,
    baseUrl,
    authUrl,
    tls: {
      cert: config.certificate,
      key: config.privateKey,
    },
  };
};

export const sicoobService = {
  /**
   * Obtém o token OAuth2 usando o certificado MTLS
   */
  async getToken(idEmpresa: number) {
    const { config, authUrl, tls } = await getSicoobConfig(idEmpresa);

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", "cob.write cob.read pix.read");

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        // Sicoob em produção muitas vezes não exige Basic se o certificado estiver correto,
        // mas a documentação padrão de OAuth pede.
        Authorization: `Basic ${Buffer.from(config.clientId + ":").toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      // @ts-ignore - Bun supports tls option in fetch
      tls: tls,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Erro de autenticação Sicoob (${response.status}): ${error}`,
      );
    }

    const data: any = await response.json();
    return data.access_token;
  },

  /**
   * Cria uma cobrança imediata (Pix) no Sicoob
   */
  async createImmediatePix(idEmpresa: number, options: SicoobPixOptions) {
    const { baseUrl, tls, config } = await getSicoobConfig(idEmpresa);
    const token = await this.getToken(idEmpresa);

    // O txid pode ser gerado automaticamente pelo Sicoob se usarmos POST /cob
    // Ou podemos fornecer um txid único se usarmos PUT /cob/{txid}

    const body = {
      calendario: {
        expiracao: options.expiracao || 3600,
      },
      devedor: {
        [options.devedor.cnpj ? "cnpj" : "cpf"]: (
          options.devedor.cnpj || options.devedor.cpf
        )?.replace(/\D/g, ""),
        nome: options.devedor.nome,
      },
      valor: {
        original: (options.valor / 100).toFixed(2),
      },
      chave: options.chave || config.chavePix,
      solicitacaoPagador:
        options.solicitacaoPagador || "Pagamento Meu Concreto",
    };

    const response = await fetch(`${baseUrl}/cob`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // @ts-ignore
      tls: tls,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Erro ao criar Pix no Sicoob (${response.status}): ${error}`,
      );
    }

    const data: any = await response.json();

    return {
      txid: data.txid,
      pixCopiaECola: data.pixCopiaECola, // Se o Sicoob já retornar
      location: data.location,
      status: data.status,
    };
  },

  /**
   * Consulta uma cobrança pelo txid
   */
  async getPixDetails(idEmpresa: number, txid: string) {
    const { baseUrl, tls } = await getSicoobConfig(idEmpresa);
    const token = await this.getToken(idEmpresa);

    const response = await fetch(`${baseUrl}/cob/${txid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // @ts-ignore
      tls: tls,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Erro ao consultar Pix no Sicoob (${response.status}): ${error}`,
      );
    }

    return await response.json();
  },
};
