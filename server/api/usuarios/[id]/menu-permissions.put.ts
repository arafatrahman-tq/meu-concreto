import { db } from "../../../database/db";
import { usuarios, permissoesMenuAuditoria } from "../../../database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAdmin } from "../../../utils/auth";
import { getAvailableMenuItems, getDefaultMenuPermissions } from "../../../utils/menu-items";
import { z } from "zod";

/**
 * PUT /api/usuarios/:id/menu-permissions
 * Atualiza as permissões de menu de um usuário específico
 * Apenas administradores podem alterar permissões
 * Respeita o contexto multi-tenant
 * Registra auditoria das alterações
 */

const updateMenuPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, "Selecione pelo menos um item de menu"),
});

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event);
  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "ID do usuário é obrigatório",
    });
  }

  // Não permitir que um admin altere suas próprias permissões de menu
  // (admins sempre têm acesso a tudo)
  if (userId === admin.id) {
    throw createError({
      statusCode: 403,
      message: "Administradores não podem alterar suas próprias permissões de menu",
    });
  }

  const body = await readBody(event);
  const result = updateMenuPermissionsSchema.safeParse(body);

  if (!result.success) {
    const issues = result.error.issues;
    throw createError({
      statusCode: 400,
      message: issues[0]?.message || "Dados inválidos",
      data: issues,
    });
  }

  const { permissions } = result.data;

  try {
    // Verificar se o usuário existe e pertence à mesma empresa
    const targetUser = await db.query.usuarios.findFirst({
      where: and(
        eq(usuarios.id, userId),
        isNull(usuarios.deletedAt)
      ),
    });

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: "Usuário não encontrado",
      });
    }

    // Verificar se o admin tem acesso à empresa do usuário
    if (targetUser.idEmpresa !== admin.idEmpresa) {
      // Verificar se o admin tem acesso multi-empresa a esta empresa
      const adminUser = await db.query.usuarios.findFirst({
        where: eq(usuarios.id, admin.id),
        with: {
          acessoEmpresas: true,
        },
      });

      const hasAccess = adminUser?.acessoEmpresas?.some(
        (a) => a.idEmpresa === targetUser.idEmpresa
      );

      if (!hasAccess) {
        throw createError({
          statusCode: 403,
          message: "Você não tem permissão para gerenciar usuários desta empresa",
        });
      }
    }

    // Validar que as permissões são válidas para o tipo de usuário
    const availableItems = getAvailableMenuItems(targetUser.admin === 1);
    const validIds = availableItems.map((item) => item.id);
    const invalidPermissions = permissions.filter((p) => !validIds.includes(p));

    if (invalidPermissions.length > 0) {
      throw createError({
        statusCode: 400,
        message: `Permissões inválidas: ${invalidPermissions.join(", ")}`,
      });
    }

    // Guardar permissões anteriores para auditoria
    let permissoesAntes: string[] = [];
    try {
      permissoesAntes = targetUser.menuPermissions 
        ? JSON.parse(targetUser.menuPermissions)
        : getDefaultMenuPermissions(targetUser.admin === 1);
    } catch {
      permissoesAntes = getDefaultMenuPermissions(targetUser.admin === 1);
    }

    // Determinar tipo de alteração
    const tipoAlteracao = permissoesAntes.length === 0 ? "CREATE" : "UPDATE";

    // Atualizar as permissões do usuário
    await db
      .update(usuarios)
      .set({
        menuPermissions: JSON.stringify(permissions),
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, userId));

    // Registrar auditoria
    const headers = getRequestHeaders(event);
    const ipAddress = getRequestIP(event) || headers["x-forwarded-for"] || headers["x-real-ip"] || null;
    const userAgent = headers["user-agent"] || null;

    await db.insert(permissoesMenuAuditoria).values({
      idUsuario: userId,
      idUsuarioAlteradoPor: admin.id,
      idEmpresa: targetUser.idEmpresa,
      permissoesAntes: JSON.stringify(permissoesAntes),
      permissoesDepois: JSON.stringify(permissions),
      tipoAlteracao,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Permissões de menu atualizadas com sucesso",
      data: {
        userId,
        permissions,
        updatedBy: admin.id,
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    throw createError({
      statusCode: 500,
      message: error.message || "Erro ao atualizar permissões de menu",
    });
  }
});
