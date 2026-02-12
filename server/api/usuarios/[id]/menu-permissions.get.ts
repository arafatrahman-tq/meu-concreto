import { db } from "../../../database/db";
import { usuarios } from "../../../database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAdmin } from "../../../utils/auth";
import { getAvailableMenuItems, getDefaultMenuPermissions, getMenuGroups } from "../../../utils/menu-items";

/**
 * GET /api/usuarios/:id/menu-permissions
 * Retorna as permissões de menu de um usuário específico
 * Apenas administradores podem consultar
 * Respeita o contexto multi-tenant
 */

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event);
  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "ID do usuário é obrigatório",
    });
  }

  try {
    // Verificar se o usuário existe e pertence à mesma empresa (ou empresas que o admin tem acesso)
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
          message: "Você não tem permissão para visualizar usuários desta empresa",
        });
      }
    }

    // Parse das permissões armazenadas
    let permissions: string[] = [];
    try {
      permissions = targetUser.menuPermissions 
        ? JSON.parse(targetUser.menuPermissions)
        : [];
    } catch {
      permissions = [];
    }

    // Se não há permissões definidas, retornar os padrões
    const isTargetAdmin = targetUser.admin === 1;
    const availableItems = getAvailableMenuItems(isTargetAdmin);
    const defaultPermissions = getDefaultMenuPermissions(isTargetAdmin);
    const groups = getMenuGroups(isTargetAdmin);

    // Se não há permissões salvas, usar os padrões
    const effectivePermissions = permissions.length > 0 ? permissions : defaultPermissions;

    return {
      userId,
      permissions: effectivePermissions,
      availableItems,
      groups,
      defaults: defaultPermissions,
      isAdmin: isTargetAdmin,
      meta: {
        hasCustomPermissions: permissions.length > 0,
        totalAvailable: availableItems.length,
        totalGranted: effectivePermissions.length,
      },
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    throw createError({
      statusCode: 500,
      message: error.message || "Erro ao carregar permissões de menu",
    });
  }
});
