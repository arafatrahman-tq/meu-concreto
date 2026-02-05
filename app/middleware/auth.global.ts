export default defineNuxtRouteMiddleware(async (to: any) => {
  const { user, fetchUser } = useAuth();

  // Public routes that don't need auth
  const publicRoutes = ["/login", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(to.path);

  // No cliente, se não tivermos o usuário, tentamos buscar
  // O sessionCookie (httpOnly) não é visível no cliente, então dependemos da resposta do servidor
  if (!user.value) {
    await fetchUser();
  }

  // Redirect to login if trying to access private route without auth
  if (!user.value && !isPublicRoute) {
    return navigateTo("/login");
  }

  // Redirect to home if trying to access public route while logged in
  if (user.value && isPublicRoute) {
    return navigateTo("/");
  }
});
