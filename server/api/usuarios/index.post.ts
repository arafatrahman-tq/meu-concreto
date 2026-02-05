import { db } from "../../database/db";
import { usuarios, usuariosEmpresas } from "../../database/schema";
import { usuarioSchema } from "../../utils/validador";
import { requireAdmin } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  try {
    const body = await readBody(event);
    const { idEmpresasAcesso, ...userData } = usuarioSchema.parse(body);

    // Hash da senha usando Bun.password
    const hashedPassword = await Bun.password.hash(userData.senha || "");

    const result = await db
      .insert(usuarios)
      .values({
        ...userData,
        senha: hashedPassword,
        admin: userData.admin ? 1 : 0,
        ativo: userData.ativo ? 1 : 0,
        createdAt: new Date(),
      })
      .returning();

    const novoUsuario = result[0];

    // Salvar acesso a múltiplas empresas
    if (idEmpresasAcesso && idEmpresasAcesso.length > 0) {
      await db.insert(usuariosEmpresas).values(
        idEmpresasAcesso.map((idEmpresa) => ({
          idUsuario: novoUsuario.id,
          idEmpresa: idEmpresa,
        })),
      );
    }

    setResponseStatus(event, 201);

    // Omitimos a senha da resposta
    const { senha, ...userWithoutPassword } = novoUsuario as any;
    return userWithoutPassword;
  } catch (error: any) {
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        message: "Erro de validação",
        data: error.errors,
      });
    }
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
