import { db } from '../../../database/db'
import { permissoesMenuAuditoria, usuarios, empresas } from '../../../database/schema'
import { eq, and, desc, isNull } from 'drizzle-orm'
import { requireAdmin } from '../../../utils/auth'

/**
 * GET /api/admin/menu-permissions-auditoria
 * Retorna o histórico geral de auditoria de permissões de menu
 * Apenas administradores podem consultar
 * Respeita o contexto multi-tenant
 */

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)

  // Query params para paginação
  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const offset = parseInt(query.offset as string) || 0

  try {
    // Buscar IDs das empresas que o admin tem acesso
    const adminUser = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, admin.id),
      with: {
        acessoEmpresas: true,
      },
    })

    const empresaIds = [
      admin.idEmpresa,
      ...(adminUser?.acessoEmpresas?.map(a => a.idEmpresa) || []),
    ]

    // Buscar histórico de auditoria das empresas permitidas
    const auditoria = await db.query.permissoesMenuAuditoria.findMany({
      where: (perm) => {
        // Filtrar por empresas que o admin tem acesso
        return perm.idEmpresa && perm.idEmpresa in empresaIds
      },
      with: {
        usuario: {
          columns: {
            id: true,
            nome: true,
            email: true,
          },
        },
        alteradoPor: {
          columns: {
            id: true,
            nome: true,
            email: true,
          },
        },
        empresa: {
          columns: {
            id: true,
            empresa: true,
            filial: true,
          },
        },
      },
      orderBy: [desc(permissoesMenuAuditoria.createdAt)],
      limit,
      offset,
    })

    // Contar total de registros
    const totalCount = await db.$count(
      permissoesMenuAuditoria,
      and(
        permissoesMenuAuditoria.idEmpresa && permissoesMenuAuditoria.idEmpresa in empresaIds,
      ),
    )

    // Formatar resposta
    const formattedAuditoria = auditoria.map((registro) => {
      let permissoesAntes: string[] = []
      let permissoesDepois: string[] = []

      try {
        permissoesAntes = JSON.parse(registro.permissoesAntes)
      }
      catch {
        permissoesAntes = []
      }

      try {
        permissoesDepois = JSON.parse(registro.permissoesDepois)
      }
      catch {
        permissoesDepois = []
      }

      return {
        id: registro.id,
        usuario: registro.usuario,
        alteradoPor: registro.alteradoPor,
        empresa: registro.empresa,
        tipoAlteracao: registro.tipoAlteracao,
        totalAntes: permissoesAntes.length,
        totalDepois: permissoesDepois.length,
        ipAddress: registro.ipAddress,
        createdAt: registro.createdAt,
      }
    })

    return {
      auditoria: formattedAuditoria,
      meta: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + auditoria.length < totalCount,
      },
    }
  }
  catch (error: any) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao carregar auditoria de permissões',
    })
  }
})
