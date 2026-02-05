import { db } from "../../database/db";
import { vendas, pagamentos } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const whereConditions = [isNull(vendas.deletedAt)];

    if (user.idEmpresasAcesso && user.idEmpresasAcesso.length > 0) {
      whereConditions.push(inArray(vendas.idEmpresa, user.idEmpresasAcesso));
    } else {
      whereConditions.push(eq(vendas.idEmpresa, user.idEmpresa));
    }

    const result = await db.query.vendas.findMany({
      where: and(...whereConditions),
      with: {
        orcamento: {
          with: {
            cliente: true,
            itens: true,
          },
        },
        pagamentos: {
          where: isNull(pagamentos.deletedAt),
        },
      },
      orderBy: (vendas, { desc }) => [desc(vendas.createdAt)],
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
