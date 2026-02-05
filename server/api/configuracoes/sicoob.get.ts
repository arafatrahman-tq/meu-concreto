import { db } from "../../database/db";
import { configuracoesSicoob } from "../../database/schema";
import { requireAuth } from "../../utils/auth";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const config = await db.query.configuracoesSicoob.findFirst({
      where: user.idEmpresa
        ? eq(configuracoesSicoob.idEmpresa, user.idEmpresa)
        : undefined,
    });

    const response = config
      ? {
          ...config,
          ativo: config.ativo === 1,
        }
      : {
          clientId: "",
          clientSecret: "",
          certificate: "",
          privateKey: "",
          environment: "sandbox",
          chavePix: "",
          contaCorrente: "",
          cooperativa: "",
          ativo: false,
        };

    // Mascarar campos sensíveis se não for admin master
    if (user.admin !== 1) {
      if (response.clientId)
        response.clientId = response.clientId.substring(0, 5) + "...";
      if (response.clientSecret) response.clientSecret = "********";
      if (response.certificate)
        response.certificate = "[Certificado Configurado]";
      if (response.privateKey)
        response.privateKey = "[Chave Privada Configurada]";
    }

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
