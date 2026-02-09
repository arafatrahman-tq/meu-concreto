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

    const { senha, ...userWithoutPassword } = user as any;

    // Se a empresa na sessão for diferente da empresa principal do usuário,
    // precisamos ajustar o objeto 'empresa' no retorno para refletir a unidade ativa
    if (sessionUser.idEmpresa !== user.idEmpresa) {
      // Tenta encontrar a empresa ativa na lista de acessos
      const activeAccess = user.acessoEmpresas.find(
        (a) => a.idEmpresa === sessionUser.idEmpresa,
      );

      if (activeAccess) {
        userWithoutPassword.empresa = activeAccess.empresa;
      }
    }

    return userWithoutPassword;
  } catch (e) {
    deleteCookie(event, "auth_session");
    throw createError({
      statusCode: 401,
      message: "Sessão expirada",
    });
  }
});
