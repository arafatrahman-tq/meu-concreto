import { db } from "../database/db";
import { configuracoesNuvemFiscal, empresas } from "../database/schema";
import { eq } from "drizzle-orm";

export interface NuvemfiscalTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

const getNuvemFiscalConfig = async (idEmpresa: number) => {
  const config = await db.query.configuracoesNuvemFiscal.findFirst({
    where: eq(configuracoesNuvemFiscal.idEmpresa, idEmpresa),
  });

  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error("Configuração da Nuvem Fiscal incompleta para a empresa.");
  }

  const isSandbox = config.environment === "sandbox";
  const baseUrl = isSandbox
    ? "https://api.sandbox.nuvemfiscal.com.br"
    : "https://api.nuvemfiscal.com.br";
  
  const authUrl = "https://auth.nuvemfiscal.com.br/oauth/token";

  return { config, baseUrl, authUrl };
};

// Cache de tokens em memória para evitar múltiplas requisições de autenticação
const tokenCache = new Map<number, { token: string, expiresAt: number }>();

export const nuvemfiscalService = {
  /**
   * Obtém o token OAuth2 usando Client Credentials
   */
  async getToken(idEmpresa: number): Promise<string> {
    // 1. Verificar cache
    const cached = tokenCache.get(idEmpresa);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    const { config, authUrl } = await getNuvemFiscalConfig(idEmpresa);

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", config.clientId);
    params.append("client_secret", config.clientSecret);
    // Escopos: empresa (singular conforme painel), nfse/nfe (emissão), cep/cnpj (consultas)
    params.append("scope", "nfe nfse empresa cep cnpj");

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // Forçar %20 em vez de + para espaços, conforme documentação
      body: params.toString().replace(/\+/g, "%20"),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      if (errorBody.error === 'access_denied') {
          throw new Error(`Permissão insuficiente na Nuvem Fiscal. Certifique-se de habilitar os escopos 'empresa', 'nfse', 'nfe' e 'cep' no seu Client ID no Console da Nuvem Fiscal.`);
      }
      throw new Error(`Erro de autenticação Nuvem Fiscal (${response.status}): ${JSON.stringify(errorBody)}`);
    }

    const data = (await response.json()) as NuvemfiscalTokenResponse;
    
    // 2. Armazenar no cache (com margem de segurança de 5 minutos)
    const expiresAt = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
    tokenCache.set(idEmpresa, { token: data.access_token, expiresAt });

    return data.access_token;
  },

  /**
   * Sincroniza os dados da empresa na Nuvem Fiscal (Cadastro/Atualização)
   */
  async syncCompany(idEmpresa: number) {
    const { baseUrl } = await getNuvemFiscalConfig(idEmpresa);
    const token = await this.getToken(idEmpresa);

    const empresaData = await db.query.empresas.findFirst({
      where: eq(empresas.id, idEmpresa),
    });

    if (!empresaData) throw new Error("Empresa não encontrada no banco local.");

    const payload = {
      cpf_cnpj: empresaData.cnpj.replace(/\D/g, ""),
      nome_razao_social: empresaData.empresa,
      inscricao_estadual: empresaData.ie?.replace(/\D/g, ""),
      inscricao_municipal: empresaData.codigoServicoMunicipal, // Usando como IM temporariamente se não houver campo específico
      email: empresaData.email,
      fone: empresaData.telefone?.replace(/\D/g, ""),
      endereco: {
        logradouro: empresaData.endereco,
        numero: empresaData.numero,
        complemento: empresaData.complemento,
        bairro: empresaData.bairro,
        codigo_municipio: empresaData.cidadeIbge,
        cidade: empresaData.cidade,
        uf: empresaData.estado,
        cep: empresaData.cep?.replace(/\D/g, ""),
      }
    };

    // Tenta obter a empresa para ver se já existe
    const checkRes = await fetch(`${baseUrl}/empresas/${payload.cpf_cnpj}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const method = checkRes.ok ? "PUT" : "POST";
    const url = checkRes.ok ? `${baseUrl}/empresas/${payload.cpf_cnpj}` : `${baseUrl}/empresas`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao sincronizar empresa na Nuvem Fiscal: ${error}`);
    }

    return await response.json();
  },

  /**
   * Atualiza o certificado digital na Nuvem Fiscal
   */
  async syncCertificate(idEmpresa: number) {
    const { baseUrl, config } = await getNuvemFiscalConfig(idEmpresa);
    if (!config.certificado) return;

    const token = await this.getToken(idEmpresa);
    const cnpj = (await db.query.empresas.findFirst({
      where: eq(empresas.id, idEmpresa)
    }))?.cnpj.replace(/\D/g, "");

    const response = await fetch(`${baseUrl}/empresas/${cnpj}/certificado`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        certificado: config.certificado,
        password: config.certificadoSenha,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao enviar certificado para Nuvem Fiscal: ${error}`);
    }

    return await response.json();
  },

  /**
   * Configura o serviço de NFS-e na Nuvem Fiscal
   */
  async syncNfseConfig(idEmpresa: number) {
    const { baseUrl, config } = await getNuvemFiscalConfig(idEmpresa);
    const token = await this.getToken(idEmpresa);
    const cnpj = (await db.query.empresas.findFirst({
      where: eq(empresas.id, idEmpresa)
    }))?.cnpj.replace(/\D/g, "");

    const payload = {
      rps: {
        lote: config.nfseLote || 1,
        serie: config.nfseSerie || "1",
        numero: config.nfseProximoNumero || 1
      },
      ambiente: config.environment === "sandbox" ? "homologacao" : "producao"
    };

    const response = await fetch(`${baseUrl}/empresas/${cnpj}/nfse`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao configurar NFS-e na Nuvem Fiscal: ${error}`);
    }

    return await response.json();
  },

  /**
   * Emite uma NF-e
   */
  async emitNfe(idEmpresa: number, vendaData: any) {
    const { baseUrl, config } = await getNuvemFiscalConfig(idEmpresa);
    const token = await this.getToken(idEmpresa);

    const response = await fetch(`${baseUrl}/nfe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...vendaData,
        ambiente: config.environment === "sandbox" ? "homologacao" : "producao",
      }),
    });

    const data: any = await response.json();
    
    if (!response.ok) {
        throw new Error(`Erro ao emitir NF-e na Nuvem Fiscal: ${JSON.stringify(data.error || data)}`);
    }

    return data;
  },

  /**
   * Emite uma NFS-e usando o padrão DPS (padrão atual da Nuvem Fiscal)
   */
  async emitNfse(idEmpresa: number, dpsData: any) {
    const { baseUrl, config } = await getNuvemFiscalConfig(idEmpresa);
    const token = await this.getToken(idEmpresa);

    const isSandbox = config.environment === "sandbox";
    const payload = {
      ...dpsData
    };

    // Sincroniza o tpAmb dentro do infDPS com o ambiente do root
    // 1 = Produção, 2 = Homologação (Padrão Nacional)
    if (payload.infDPS) {
      payload.infDPS.tpAmb = isSandbox ? 2 : 1;
    }

    const response = await fetch(`${baseUrl}/nfse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json();

    if (!response.ok) {
        throw new Error(`Erro ao emitir NFS-e na Nuvem Fiscal: ${JSON.stringify(data.error || data)}`);
    }

    return data;
  }
};
