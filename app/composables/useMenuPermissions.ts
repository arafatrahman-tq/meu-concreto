import { ref, computed } from 'vue'
import { useFetch, useState } from '#imports'

export interface MenuItem {
  id: string
  name: string
  path: string
  group: string
  icon: string
  adminOnly?: boolean
  requiresAdmin?: boolean
  description?: string
}

export interface MenuGroup {
  id: string
  title: string
  order: number
  adminOnly?: boolean
}

export interface MenuPermissionsState {
  items: MenuItem[]
  groups: MenuGroup[]
  permissions: string[]
  isLoading: boolean
  error: string | null
}

/**
 * Composable para gerenciar permissões de menu
 * Fornece funções para carregar, verificar e atualizar permissões
 */
export const useMenuPermissions = () => {
  const { user } = useAuth()

  // Estado local
  const items = ref<MenuItem[]>([])
  const groups = ref<MenuGroup[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Permissões efetivas do usuário (do user state ou default)
   */
  const userPermissions = computed(() => {
    return user.value?.menuPermissions || []
  })

  /**
   * Verifica se o usuário tem permissão para um item específico
   */
  const hasPermission = (menuId: string): boolean => {
    // Admins sempre têm permissão
    if (user.value?.admin === 1) return true

    // Se não há permissões definidas, assumir que tem acesso (backwards compatibility)
    if (!userPermissions.value || userPermissions.value.length === 0) {
      return true
    }

    return userPermissions.value.includes(menuId)
  }

  /**
   * Verifica se o usuário tem permissão para uma rota específica
   */
  const hasRoutePermission = (path: string): boolean => {
    // Admins sempre têm permissão
    if (user.value?.admin === 1) return true

    // Encontrar o item de menu correspondente à rota
    const menuItem = items.value.find(item => item.path === path)
    if (!menuItem) return true // Se não está no menu, permitir (pode ser rota interna)

    return hasPermission(menuItem.id)
  }

  /**
   * Carrega todos os itens de menu disponíveis
   */
  const fetchMenuItems = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await useFetch('/api/menu-items')
      if (data.value) {
        items.value = data.value.items || []
        groups.value = data.value.groups || []
      }
    }
    catch (err: any) {
      error.value = err.message || 'Erro ao carregar itens de menu'
      console.error('[useMenuPermissions] Error fetching menu items:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega as permissões de um usuário específico (apenas admin)
   */
  const fetchUserPermissions = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await useFetch(`/api/usuarios/${userId}/menu-permissions`)
      return data.value
    }
    catch (err: any) {
      error.value = err.message || 'Erro ao carregar permissões'
      console.error('[useMenuPermissions] Error fetching user permissions:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Atualiza as permissões de um usuário (apenas admin)
   */
  const updateUserPermissions = async (userId: string, permissions: string[]) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/usuarios/${userId}/menu-permissions`, {
        method: 'PUT',
        body: { permissions },
      })
      return response
    }
    catch (err: any) {
      error.value = err.message || 'Erro ao atualizar permissões'
      console.error('[useMenuPermissions] Error updating permissions:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Retorna os itens de menu filtrados por permissões do usuário atual
   */
  const filteredMenuItems = computed(() => {
    // Admins veem tudo
    if (user.value?.admin === 1) return items.value

    // Se não há permissões definidas, mostrar tudo (backwards compatibility)
    if (!userPermissions.value || userPermissions.value.length === 0) {
      return items.value.filter(item => !item.adminOnly)
    }

    return items.value.filter(item =>
      userPermissions.value.includes(item.id) && !item.adminOnly,
    )
  })

  /**
   * Agrupa os itens de menu por grupo, respeitando as permissões
   */
  const groupedMenuItems = computed(() => {
    const filtered = filteredMenuItems.value
    const result: Record<string, { group: MenuGroup, items: MenuItem[] }> = {}

    // Inicializar grupos
    groups.value.forEach((group) => {
      result[group.id] = { group, items: [] }
    })

    // Agrupar items
    filtered.forEach((item) => {
      if (result[item.group]) {
        result[item.group].items.push(item)
      }
    })

    // Retornar apenas grupos que têm items
    return Object.values(result)
      .filter(g => g.items.length > 0)
      .sort((a, b) => a.group.order - b.group.order)
  })

  /**
   * Carrega o histórico de auditoria de um usuário
   */
  const fetchPermissionsAuditoria = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await useFetch(`/api/usuarios/${userId}/menu-permissions-auditoria`)
      return data.value
    }
    catch (err: any) {
      error.value = err.message || 'Erro ao carregar auditoria'
      console.error('[useMenuPermissions] Error fetching auditoria:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Carrega o histórico geral de auditoria (admin)
   */
  const fetchGlobalAuditoria = async (params?: { limit?: number, offset?: number }) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params?.limit) query.set('limit', params.limit.toString())
      if (params?.offset) query.set('offset', params.offset.toString())

      const { data } = await useFetch(`/api/admin/menu-permissions-auditoria?${query}`)
      return data.value
    }
    catch (err: any) {
      error.value = err.message || 'Erro ao carregar auditoria global'
      console.error('[useMenuPermissions] Error fetching global auditoria:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Reseta o estado
   */
  const reset = () => {
    items.value = []
    groups.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    items: readonly(items),
    groups: readonly(groups),
    isLoading: readonly(isLoading),
    error: readonly(error),
    userPermissions,
    filteredMenuItems,
    groupedMenuItems,

    // Methods
    hasPermission,
    hasRoutePermission,
    fetchMenuItems,
    fetchUserPermissions,
    updateUserPermissions,
    fetchPermissionsAuditoria,
    fetchGlobalAuditoria,
    reset,
  }
}
