import { db } from "../../database/db";
import { usuariosEmpresas, usuarios } from "../../database/schema";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUser, signData } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const sessionUser = getAuthenticatedUser(event);
  if (!sessionUser) {
    throw createError({
      statusCode: 401,
      message: "Não autorizado",
    });
  }

  const body = await readBody(event);
  const { idEmpresa } = body;

  if (!idEmpresa) {
    throw createError({
      statusCode: 400,
      message: "ID da empresa é obrigatório",
    });
  }

  // Verificar se o usuário tem acesso a esta empresa
  // O usuário sempre tem acesso à sua empresa primária
  const user = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, sessionUser.id),
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: "Usuário não encontrado",
    });
  }

  const hasAccess =
    user.idEmpresa === idEmpresa ||
    (await db.query.usuariosEmpresas.findFirst({
      where: and(
        eq(usuariosEmpresas.idUsuario, sessionUser.id),
        eq(usuariosEmpresas.idEmpresa, idEmpresa),
      ),
    }));

  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      message: "Você não tem acesso a esta empresa",
    });
  }

  // Atualizar a sessão
  const sessionData = JSON.stringify({
    ...sessionUser,
    idEmpresa: idEmpresa,
  });

  setCookie(event, "auth_session", signData(sessionData), {
    maxAge: 60 * 60 * 24, // 1 dia
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return { success: true };
});
