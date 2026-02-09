import { db } from "../../database/db";
import { pagamentos } from "../../database/schema";
import { and, isNull, eq, inArray } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const query = getQuery(event);
    const status = query.status as string;

    const whereConditions = [
      isNull(pagamentos.deletedAt),
      eq(pagamentos.idEmpresa, user.idEmpresa),
    ];

    if (status) {
      whereConditions.push(eq(pagamentos.status, status));
    }

    const result = await db.query.pagamentos.findMany({
      where: and(...whereConditions),
      with: {
        venda: {
          with: {
            orcamento: true,
          },
        },
      },
      orderBy: (pagamentos, { desc }) => [desc(pagamentos.dataVencimento)],
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
