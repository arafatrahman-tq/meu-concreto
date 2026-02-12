import { db } from "../../../database/db";
import { permissoesMenuAuditoria, usuarios } from "../../../database/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { requireAdmin } from "../../../utils/auth";

/**
 * GET /api/usuarios/:id/menu-permissions-auditoria
 * Retorna o histórico de auditoria de permissões de menu de um usuário
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
    // Verificar se o usuário existe
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
          message: "Você não tem permissão para visualizar auditoria desta empresa",
        });
      }
    }

    // Buscar histórico de auditoria
    const auditoria = await db.query.permissoesMenuAuditoria.findMany({
      where: eq(permissoesMenuAuditoria.idUsuario, userId),
      with: {
        alteradoPor: {
          columns: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: [desc(permissoesMenuAuditoria.createdAt)],
      limit: 50, // Limitar a 50 registros mais recentes
    });

    // Parsear JSON e formatar resposta
    const formattedAuditoria = auditoria.map((registro) => {
      let permissoesAntes: string[] = [];
      let permissoesDepois: string[] = [];

      try {
        permissoesAntes = JSON.parse(registro.permissoesAntes);
      } catch {
        permissoesAntes = [];
      }

      try {
        permissoesDepois = JSON.parse(registro.permissoesDepois);
      } catch {
        permissoesDepois = [];
      }

      // Calcular diferenças
      const adicionadas = permissoesDepois.filter(p => !permissoesAntes.includes(p));
      const removidas = permissoesAntes.filter(p => !permissoesDepois.includes(p));

      return {
        id: registro.id,
        idUsuario: registro.idUsuario,
        idUsuarioAlteradoPor: registro.idUsuarioAlteradoPor,
        alteradoPor: registro.alteradoPor,
        tipoAlteracao: registro.tipoAlteracao,
        permissoesAntes,
        permissoesDepois,
        diferencas: {
          adicionadas,
          removidas,
        },
        totalAntes: permissoesAntes.length,
        totalDepois: permissoesDepois.length,
        ipAddress: registro.ipAddress,
        createdAt: registro.createdAt,
      };
    });

    return {
      userId,
      userName: targetUser.nome,
      totalRegistros: formattedAuditoria.length,
      auditoria: formattedAuditoria,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      message: error.message || "Erro ao carregar auditoria de permissões",
    });
  }
});
