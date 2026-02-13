import { ref, computed } from 'vue'
import { useCookie, navigateTo, useFetch, useState } from '#imports'

export const useAuth = () => {
  const user = useState<any>('auth_user', () => null)
  const sessionCookie = useCookie('auth_session')

  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async (force = false) => {
    // Se o estado já estiver populado (via SSR), não buscamos novamente no cliente (a menos que seja forçado)
    if (user.value && !force) return user.value

    try {
      const { data } = await useFetch('/api/auth/me', {
        key: 'auth-user-' + (force ? Date.now() : 'static'),
        // O useFetch garante que se o dado veio do servidor, ele não faz o request no cliente
      })
      if (data.value) {
        user.value = data.value
      }
      return data.value
    }
    catch (e) {
      user.value = null
      return null
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    catch (e) {
      console.error('Logout error:', e)
    }
    finally {
      user.value = null
      sessionCookie.value = null
      navigateTo('/login')
    }
  }

  return {
    user,
    isAuthenticated,
    fetchUser,
    logout,
  }
}
