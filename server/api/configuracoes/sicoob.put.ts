import { db } from "../../database/db";
import { configuracoesSicoob } from "../../database/schema";
import { configuracoesSicoobSchema } from "../../utils/validador";
import { requireAdmin } from "../../utils/auth";
import { serverLog } from "../../utils/logger";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Apenas admins podem alterar integrações financeiras
  const user = requireAdmin(event);

  try {
    const body = await readBody(event);
    const validatedData = configuracoesSicoobSchema.parse(body);

    // Buscar configuração existente para a empresa do usuário
    const existing = await db.query.configuracoesSicoob.findFirst({
      where: user.idEmpresa
        ? eq(configuracoesSicoob.idEmpresa, user.idEmpresa)
        : undefined,
    });

    const dataToSave = {
      clientId: validatedData.clientId,
      clientSecret: validatedData.clientSecret,
      certificate: validatedData.certificate,
      privateKey: validatedData.privateKey,
      environment: validatedData.environment,
      chavePix: validatedData.chavePix,
      contaCorrente: validatedData.contaCorrente,
      cooperativa: validatedData.cooperativa,
      ativo: validatedData.ativo ? 1 : 0,
      idEmpresa: user.idEmpresa,
    };

    if (existing) {
      await db
        .update(configuracoesSicoob)
        .set({
          ...dataToSave,
          updatedAt: new Date(),
        })
        .where(eq(configuracoesSicoob.id, existing.id));

      await serverLog.info(
        event,
        "INTEGRACOES",
        `Configuração Sicoob atualizada para empresa ${user.idEmpresa}`,
      );
    } else {
      await db.insert(configuracoesSicoob).values(dataToSave);
      await serverLog.info(
        event,
        "INTEGRACOES",
        `Nova configuração Sicoob criada para empresa ${user.idEmpresa}`,
      );
    }

    return { message: "Configurações de Sicoob salvas com sucesso" };
  } catch (error: any) {
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: error.issues
          ? error.issues.map((e: any) => e.message).join(", ")
          : error.message,
        data: error.issues || error.errors,
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
