import { db } from "../../database/db";
import { orcamentos } from "../../database/schema";
import { and, eq, isNull, inArray, or, gte, lte, isNotNull } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const query = getQuery(event);

  // Opcional: filtro por data
  const start = query.start
    ? new Date(query.start as string)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const end = query.end
    ? new Date(query.end as string)
    : new Date(new Date().setHours(23, 59, 59, 999));

  try {
    const whereConditions = [
      isNull(orcamentos.deletedAt),
      eq(orcamentos.idEmpresa, user.idEmpresa),
      or(eq(orcamentos.bombaNecessaria, 1), isNotNull(orcamentos.idBomba)),
    ];

    // Filtro por período se fornecido
    if (query.start) whereConditions.push(gte(orcamentos.dataEntrega, start));
    if (query.end) whereConditions.push(lte(orcamentos.dataEntrega, end));

    const result = await db.query.orcamentos.findMany({
      where: and(...whereConditions),
      with: {
        bomba: true,
        cliente: true,
      },
      orderBy: (orcamentos, { asc }) => [asc(orcamentos.dataEntrega)],
    });

    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
