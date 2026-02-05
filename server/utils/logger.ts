import { db } from "../database/db";
import { logs } from "../database/schema";
import { logSchema, type LogInput } from "./validador";
import { getAuthenticatedUser } from "./auth";

/**
 * Utilitário centralizado para gravação de logs no servidor (Server-side).
 * Ideal para auditoria de ações críticas, erros de API e rastreamento de segurança.
 */
export const serverLog = {
  async register(event: any, data: Partial<LogInput>) {
    try {
      // Extrai metadados do evento se disponível
      let idUsuario = data.idUsuario;
      let idEmpresa = data.idEmpresa;

      // Se não informado, tenta extrair da sessão do cookie se o evento existir
      if (event && (!idUsuario || !idEmpresa)) {
        const user = getAuthenticatedUser(event);
        if (user) {
          idUsuario = idUsuario || user.id;
          idEmpresa = idEmpresa || user.idEmpresa;
        }
      }

      const payload = {
        nivel: data.nivel || "INFO",
        modulo: data.modulo || "SISTEMA",
        mensagem: data.mensagem || "",
        dados: sanitizeData(data.dados),
        idUsuario: idUsuario ? String(idUsuario) : undefined, // Garante que seja string para o Zod
        idEmpresa: idEmpresa ? Number(idEmpresa) : undefined, // Garante que seja número para o Zod
        ip: event ? getRequestIP(event) : undefined,
        userAgent: event ? getRequestHeader(event, "user-agent") : undefined,
        origem:
          data.origem ||
          (getRequestHeader(event, "x-request-origin")
            ? String(getRequestHeader(event, "x-request-origin"))
            : "WEB"),
      };

      // Valida e insere
      const validated = logSchema.parse(payload);

      await db.insert(logs).values({
        ...validated,
        timestamp: new Date(),
      });
    } catch (err) {
      // Falha silenciosa no log para não quebrar a execução principal,
      // mas imprime no console do servidor
      console.error("CRITICAL: Erro ao registrar log no servidor:", err);
    }
  },

  info(event: any, modulo: string, mensagem: string, dados?: any) {
    return this.register(event, {
      nivel: "INFO",
      modulo,
      mensagem,
      dados: dados ? JSON.stringify(dados) : undefined,
    });
  },

  warn(event: any, modulo: string, mensagem: string, dados?: any) {
    return this.register(event, {
      nivel: "WARN",
      modulo,
      mensagem,
      dados: dados ? JSON.stringify(dados) : undefined,
    });
  },

  error(event: any, modulo: string, mensagem: string, dados?: any) {
    return this.register(event, {
      nivel: "ERROR",
      modulo,
      mensagem,
      dados: dados ? JSON.stringify(dados) : undefined,
    });
  },

  debug(event: any, modulo: string, mensagem: string, dados?: any) {
    return this.register(event, {
      nivel: "DEBUG",
      modulo,
      mensagem,
      dados: dados ? JSON.stringify(dados) : undefined,
    });
  },
};

/**
 * Remove dados sensíveis como senhas e API keys de strings JSON de log.
 */
function sanitizeData(data: string | undefined | null): string | undefined {
  if (!data) return data === null ? undefined : data;

  try {
    const obj = JSON.parse(data);
    const sensitiveKeys = [
      "senha",
      "password",
      "apiKey",
      "token",
      "secret",
      "pin",
    ];

    const maskSensitive = (item: any) => {
      if (typeof item !== "object" || item === null) return;

      for (const key in item) {
        if (
          sensitiveKeys.some((sk) =>
            key.toLowerCase().includes(sk.toLowerCase()),
          )
        ) {
          item[key] = "********";
        } else if (typeof item[key] === "object") {
          maskSensitive(item[key]);
        }
      }
    };

    maskSensitive(obj);
    return JSON.stringify(obj);
  } catch (e) {
    // Se não for JSON, limpa via Regex apenas por segurança
    return data.replace(
      /(senha|password|apiKey|token|secret|pin)["\s:]+[^,\s}]+/gi,
      '$1: "********"',
    );
  }
}
