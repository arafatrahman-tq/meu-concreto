export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  if (!user.value || user.value.admin !== 1) {
    return navigateTo('/')
  }
})
