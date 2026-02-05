import { db } from "../../database/db";
import { logs, usuarios } from "../../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  try {
    const idEmpresa = user.idEmpresa;

    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 50;
    const offset = parseInt(query.offset as string) || 0;
    const nivel = query.nivel as string;
    const modulo = query.modulo as string;

    const whereConditions = [eq(logs.idEmpresa, Number(idEmpresa))];
    if (nivel && nivel !== "") whereConditions.push(eq(logs.nivel, nivel));
    if (modulo && modulo !== "") whereConditions.push(eq(logs.modulo, modulo));

    const result = await db.query.logs.findMany({
      where: and(...whereConditions),
      limit,
      offset,
      orderBy: (logs, { desc }) => [desc(logs.timestamp)],
      with: {
        usuario: {
          columns: {
            nome: true,
            usuario: true,
          },
        },
      },
    });

    return result;
  } catch (error: any) {
    // Preservar o status code se jÃ¡ for um erro do Nuxt
    const statusCode = error.statusCode || 500;
    throw createError({
      statusCode,
      message: error.message || "Erro interno no servidor",
    });
  }
});
