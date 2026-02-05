import { db } from "../../database/db";
import { usuarios } from "../../database/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { requireAdmin } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);

  try {
    const whereConditions = [isNull(usuarios.deletedAt)];

    if (user.idEmpresasAcesso && user.idEmpresasAcesso.length > 0) {
      whereConditions.push(inArray(usuarios.idEmpresa, user.idEmpresasAcesso));
    } else {
      whereConditions.push(eq(usuarios.idEmpresa, user.idEmpresa));
    }

    const result = await db.query.usuarios.findMany({
      where: and(...whereConditions),
      // Omitimos a senha por segurança
      columns: {
        senha: false,
      },
      with: {
        acessoEmpresas: {
          with: {
            empresa: true,
          },
        },
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
