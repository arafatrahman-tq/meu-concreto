import { db } from "../database/db";
import { configuracoesWhatsapp, empresas } from "../database/schema";
import { eq, and } from "drizzle-orm";

export interface WhatsAppMessageOptions {
  number: string;
  text?: string;
  document?: string; // Base64
  image?: string; // Base64
  fileName?: string;
  mimetype?: string;
  caption?: string;
}

export const whatsappService = {
  /**
   * Envia uma mensagem ou documento via WhatsApp usando a API Evolution.
   * Suporta instâncias globais ou por empresa selecionada.
   */
  async sendMessage(options: WhatsAppMessageOptions, idEmpresa?: number) {
    try {
      let config = null;

      // Se informada uma empresa, tenta buscar a configuração específica dela
      if (idEmpresa) {
        config = await db.query.configuracoesWhatsapp.findFirst({
          where: and(
            eq(configuracoesWhatsapp.ativo, 1),
            eq(configuracoesWhatsapp.idEmpresa, idEmpresa),
          ),
        });
      }

      // Se não houver configuração específica, busca a primeira configuração ativa (Global)
      if (!config) {
        config = await db.query.configuracoesWhatsapp.findFirst({
          where: eq(configuracoesWhatsapp.ativo, 1),
        });
      }

      if (!config || !config.apiKey || !config.instanceUrl) {
        throw new Error(
          "Configuração de WhatsApp não encontrada ou incompleta.",
        );
      }

      // 1. Extrair Instance e Base URL
      // Tratamento para diversos formatos de URL da Evolution API e Custom APIs
      let baseUrl = config.instanceUrl.trim();
      if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

      let instanceName = "default";

      // Padrão Evolution v1/v2 ou Custom Connections API
      if (baseUrl.includes("/connections/")) {
        const parts = baseUrl.split("/connections/");
        baseUrl = parts[0] || baseUrl;
        instanceName = parts[1] || "default";
      } else if (baseUrl.includes("/instance/")) {
        const parts = baseUrl.split("/instance/");
        baseUrl = parts[0] || baseUrl;
        instanceName = parts[1] || "default";
      } else {
        // Fallback: tenta pegar a última parte se for um caminho simples
        const lastSlash = baseUrl.lastIndexOf("/");
        if (lastSlash > 8) {
          instanceName = baseUrl.substring(lastSlash + 1);
          baseUrl = baseUrl.substring(0, lastSlash);
        }
      }

      // Limpar instanceName de possíveis barras extras
      instanceName = instanceName.replace(/\/$/, "");

      const isConnectionsApi = config.instanceUrl.includes("/connections/");

      // Ajuste para Baileys-API (Connections): Exige o prefixo '+' no path caso seja um número
      if (isConnectionsApi && /^\d+$/.test(instanceName)) {
        instanceName = `+${instanceName}`;
      }

      // 2. Formatar Número e JID
      let cleanTo = options.number.replace(/\D/g, "");
      if (cleanTo.length === 10 || cleanTo.length === 11) {
        cleanTo = `55${cleanTo}`;
      }
      const jid = `${cleanTo}@s.whatsapp.net`;

      // Função auxiliar para limpar base64 (remover prefixo data:image/...)
      const cleanBase64 = (base64?: string) => {
        if (!base64) return "";
        return base64.replace(/^data:.*?;base64,/, "");
      };

      // 3. Definir Endpoint e Payload conforme Documentação
      let endpoint = "";
      let body: any = {};

      if (isConnectionsApi) {
        // PADRÃO @fazer-ai/baileys-api (Conforme OpenAPI YAML fornecido)
        endpoint = `/connections/${instanceName}/send-message`;

        if (options.document) {
          body = {
            jid: jid,
            messageContent: {
              document: cleanBase64(options.document),
              fileName: options.fileName || "documento.pdf",
              mimetype: options.mimetype || "application/pdf",
              caption: options.caption || options.text || "",
            },
          };
        } else if (options.image) {
          body = {
            jid: jid,
            messageContent: {
              image: cleanBase64(options.image),
              caption: options.caption || options.text || "",
              mimetype: options.mimetype || "image/png",
            },
          };
        } else {
          body = {
            jid: jid,
            messageContent: {
              text: options.text || "",
            },
          };
        }
      } else {
        const encodedInstance = encodeURIComponent(instanceName);
        if (options.document) {
          endpoint = `/message/sendMedia/${encodedInstance}`;
          body = {
            number: cleanTo,
            mediaMessage: {
              mediatype: "document",
              fileName: options.fileName || "documento.pdf",
              caption: options.caption || options.text || "",
              media: cleanBase64(options.document),
            },
          };
        } else if (options.image) {
          endpoint = `/message/sendMedia/${encodedInstance}`;
          body = {
            number: cleanTo,
            mediaMessage: {
              mediatype: "image",
              caption: options.caption || options.text || "",
              media: cleanBase64(options.image),
            },
          };
        } else {
          endpoint = `/message/sendText/${encodedInstance}`;
          body = {
            number: cleanTo,
            textMessage: { text: options.text || "" },
          };
        }
      }

      const sendUrl = `${baseUrl.replace(/\/$/, "")}${endpoint}`;
      console.log(`[WhatsApp] Chamando API: ${sendUrl}`);

      const response = await fetch(sendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey, // Header da imagem
          apikey: config.apiKey, // Fallback para compatibilidade
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[WhatsApp] Erro na resposta da API:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        const statusMsg = errorData.message || response.statusText;
        throw new Error(
          `Erro na API WhatsApp (${response.status}): ${statusMsg}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("Erro ao enviar WhatsApp:", error.message);
      throw error;
    }
  },
};

export const sendWhatsAppMessage = async (
  to: string,
  options: Partial<WhatsAppMessageOptions>,
) => {
  return await whatsappService.sendMessage({
    number: to,
    ...options,
  } as WhatsAppMessageOptions);
};

const getEmpresaHeader = async (idEmpresa?: number) => {
  if (!idEmpresa) return "";
  const emp = await db.query.empresas.findFirst({
    where: eq(empresas.id, idEmpresa),
  });
  if (!emp) return "";
  return `*${emp.empresa}${emp.filial ? ` - ${emp.filial}` : ""}*\n\n`.toUpperCase();
};

export const sendPaymentLink = async (
  to: string,
  clienteNome: string,
  valor: number,
  link: string,
  idEmpresa?: number,
) => {
  const formatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor / 100);

  const header = await getEmpresaHeader(idEmpresa);
  const text = `${header}Olá *${clienteNome}*,\n\nSegue o link para o pagamento do seu pedido no valor de *${formatado}*:\n\n${link}\n\nSe tiver qualquer dúvida, estamos à disposição!`;

  return await whatsappService.sendMessage({ number: to, text }, idEmpresa);
};

export const sendPixCode = async (
  to: string,
  clienteNome: string,
  valor: number,
  pixCode: string,
  idEmpresa?: number,
) => {
  const formatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor / 100);

  const header = await getEmpresaHeader(idEmpresa);

  // 1. Enviar QR Code como Imagem
  try {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(pixCode)}`;
    const response = await fetch(qrCodeUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    await whatsappService.sendMessage(
      {
        number: to,
        image: `data:image/png;base64,${base64}`,
        caption: `${header}Olá *${clienteNome}*,\n\nPara facilitar o seu pagamento no valor de *${formatado}*, utilize o QR Code acima ou o código Pix abaixo.`,
      },
      idEmpresa,
    );
  } catch (err) {
    console.error("Erro ao enviar QR Code:", err);
    // Se falhar a imagem, envia apenas o texto de introdução
    await whatsappService.sendMessage(
      {
        number: to,
        text: `Olá *${clienteNome}*,\n\nSegue os dados para o seu pagamento no valor de *${formatado}*:`,
      },
      idEmpresa,
    );
  }

  // Pequeno delay entre mensagens para garantir ordem e UX
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 2. Enviar mensagem explicativa
  await whatsappService.sendMessage(
    {
      number: to,
      text: "Copie o código abaixo e cole no aplicativo do seu banco (opção Pix Copia e Cola):",
    },
    idEmpresa,
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  // 3. Enviar apenas o código (FACILITA COPIAR NO WHATSAPP)
  return await whatsappService.sendMessage(
    {
      number: to,
      text: pixCode.trim(),
    },
    idEmpresa,
  );
};
