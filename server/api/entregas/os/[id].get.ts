import { db } from "../../../database/db";
import { ordensServico } from "../../../database/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const id = Number(getRouterParam(event, "id"));

  try {
    const result = await db.query.ordensServico.findFirst({
      where: and(
        eq(ordensServico.id, id),
        eq(ordensServico.idEmpresa, user.idEmpresa),
      ),
      with: {
        orcamento: true,
        motorista: true,
        caminhao: true,
        eventos: true,
      },
    });

    if (!result) {
      throw createError({
        statusCode: 404,
        message: "Ordem de Serviço não encontrada",
      });
    }

    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
