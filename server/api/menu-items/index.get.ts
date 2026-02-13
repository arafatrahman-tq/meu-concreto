import { requireAuth } from '../../utils/auth'
import { getAvailableMenuItems, getMenuGroups, MENU_GROUPS } from '../../utils/menu-items'

/**
 * GET /api/menu-items
 * Retorna todos os itens de menu disponíveis para o usuário logado
 * Respeita o contexto multi-tenant (empresa atual)
 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const isAdmin = user.admin === 1

    const items = getAvailableMenuItems(isAdmin)
    const groups = getMenuGroups(isAdmin)

    // Retornar grupos com items incluídos para facilitar o frontend
    const groupsWithItems = groups.map(group => ({
      ...group,
      items: items.filter(item => item.group === group.id),
    }))

    return {
      items,
      groups: groupsWithItems,
      meta: {
        total: items.length,
        isAdmin,
        idEmpresa: user.idEmpresa,
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao carregar itens de menu',
    })
  }
})
