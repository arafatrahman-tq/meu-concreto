import { db } from "../../../database/db";
import { ordensServico } from "../../../database/schema";
import { and, eq, isNull } from "drizzle-orm";
import { requireAuth } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const query = getQuery(event);

  try {
    const conditions = [eq(ordensServico.idEmpresa, user.idEmpresa)];

    if (query.idOrcamento) {
      conditions.push(eq(ordensServico.idOrcamento, Number(query.idOrcamento)));
    }

    if (query.status) {
      conditions.push(eq(ordensServico.status, query.status as string));
    }

    const result = await db.query.ordensServico.findMany({
      where: and(...conditions),
      orderBy: (os, { desc }) => [desc(os.createdAt)],
      with: {
        motorista: true,
        caminhao: true,
        bomba: true,
      },
    });

    return result;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
