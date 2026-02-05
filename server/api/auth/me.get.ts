import { db } from "../../database/db";
import { usuarios } from "../../database/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const sessionUser = getAuthenticatedUser(event);

  if (!sessionUser) {
    throw createError({
      statusCode: 401,
      message: "Não autorizado",
    });
  }

  try {
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, sessionUser.id),
      with: {
        empresa: true,
        acessoEmpresas: {
          with: {
            empresa: true,
          },
        },
      },
    });

    if (!user || user.ativo === 0 || user.deletedAt) {
      deleteCookie(event, "auth_session");
      throw createError({
        statusCode: 401,
        message: "Sessão inválida",
      });
    }

    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (e) {
    deleteCookie(event, "auth_session");
    throw createError({
      statusCode: 401,
      message: "Sessão expirada",
    });
  }
});
