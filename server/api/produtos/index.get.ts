import { db } from "../../database/db";
import { produtos } from "../../database/schema";
import { and, eq, isNull } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const result = await db.query.produtos.findMany({
      where: and(
        isNull(produtos.deletedAt),
        eq(produtos.ativo, 1), // Geralmente produtos listados são os ativos
      ),
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
