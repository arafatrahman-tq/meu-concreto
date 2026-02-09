import { db } from "../../database/db";
import { bombas } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);

    const whereConditions = [
      isNull(bombas.deletedAt),
      eq(bombas.idEmpresa, user.idEmpresa),
    ];

    const result = await db.query.bombas.findMany({
      where: and(...whereConditions),
      orderBy: (bombas, { asc }) => [asc(bombas.nome)],
      with: {
        empresa: true,
      },
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Erro ao buscar bombas",
    });
  }
});
