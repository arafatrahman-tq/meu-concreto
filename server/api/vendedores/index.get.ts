import { db } from "../../database/db";
import { vendedores } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const whereConditions = [
      isNull(vendedores.deletedAt),
      eq(vendedores.idEmpresa, user.idEmpresa),
    ];

    const result = await db.query.vendedores.findMany({
      where: and(...whereConditions),
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
