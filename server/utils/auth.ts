import { H3Event } from "h3";
import { createHmac, timingSafeEqual } from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET não configurado nas variáveis de ambiente.");
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  admin: number;
  idEmpresa: number;
  idEmpresasAcesso?: number[];
  exp?: number; // Expiração da sessão (timestamp em ms)
}

/**
 * Assina um dado para evitar falsificação (Base64 + Signature)
 */
export const signData = (data: string): string => {
  const base64Data = Buffer.from(data).toString("base64");
  const hmac = createHmac("sha256", AUTH_SECRET);
  hmac.update(base64Data);
  const signature = hmac.digest("hex");
  return `${base64Data}.${signature}`;
};

/**
 * Verifica a assinatura de um dado (Base64 + Signature)
 */
export const verifyData = (signedData: string): string | null => {
  const parts = signedData.split(".");
  if (parts.length !== 2) return null;

  const base64Data = parts[0];
  const signature = parts[1];

  if (!base64Data || !signature) return null;

  const hmac = createHmac("sha256", AUTH_SECRET);
  hmac.update(base64Data);
  const expectedSignature = hmac.digest("hex");

  // timingSafeEqual para evitar ataques de timing
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    try {
      return Buffer.from(base64Data, "base64").toString("utf-8");
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getAuthenticatedUser = (event: H3Event): AuthUser | null => {
  const session = getCookie(event, "auth_session");
  if (!session) return null;

  try {
    const verifiedData = verifyData(session);
    if (!verifiedData) return null;

    const user = JSON.parse(verifiedData) as AuthUser;

    // Verificar se a sessão expirou
    if (user.exp && Date.now() > user.exp) {
      return null;
    }

    return user;
  } catch (e) {
    return null;
  }
};

export const requireAdmin = (event: H3Event) => {
  // Preferir usuário já autenticado e carregado no context pelo middleware
  const user = event.context.user || getAuthenticatedUser(event);

  if (!user || user.admin !== 1) {
    throw createError({
      statusCode: 403,
      message: "Acesso negado: Requer privilégios de administrador",
    });
  }
  return user;
};

export const requireAuth = (event: H3Event) => {
  // Preferir usuário já autenticado e carregado no context pelo middleware
  const user = event.context.user || getAuthenticatedUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Não autorizado",
    });
  }
  return user;
};
