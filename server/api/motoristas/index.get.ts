import { db } from "../../database/db";
import { motoristas } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const whereConditions = [isNull(motoristas.deletedAt)];

    if (user.idEmpresasAcesso && user.idEmpresasAcesso.length > 0) {
      whereConditions.push(
        inArray(motoristas.idEmpresa, user.idEmpresasAcesso),
      );
    } else {
      whereConditions.push(eq(motoristas.idEmpresa, user.idEmpresa));
    }

    const result = await db.query.motoristas.findMany({
      where: and(...whereConditions),
      orderBy: (motoristas, { asc }) => [asc(motoristas.nome)],
      with: {
        empresa: true,
      },
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
