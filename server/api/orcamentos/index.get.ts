import { db } from "../../database/db";
import { orcamentos } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const whereConditions = [isNull(orcamentos.deletedAt)];

    if (user.idEmpresasAcesso && user.idEmpresasAcesso.length > 0) {
      whereConditions.push(
        inArray(orcamentos.idEmpresa, user.idEmpresasAcesso),
      );
    } else {
      whereConditions.push(eq(orcamentos.idEmpresa, user.idEmpresa));
    }

    const result = await db.query.orcamentos.findMany({
      where: and(...whereConditions),
      with: {
        itens: true,
        motorista: true,
        caminhao: true,
      },
      orderBy: (orcamentos, { desc }) => [desc(orcamentos.createdAt)],
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
