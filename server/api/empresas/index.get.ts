import { db } from "../../database/db";
import { empresas } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user)
      throw createError({ statusCode: 401, message: "Não autorizado" });

    const whereConditions = [isNull(empresas.deletedAt)];

    const isAdmin = user.admin === 1;

    if (isAdmin) {
      // Admins globais podem ver todas as empresas não deletadas
    } else if (user.idEmpresasAcesso && user.idEmpresasAcesso.length > 0) {
      whereConditions.push(inArray(empresas.id, user.idEmpresasAcesso));
    } else {
      whereConditions.push(eq(empresas.id, user.idEmpresa));
    }

    const result = await db.query.empresas.findMany({
      where: and(...whereConditions),
    });
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
