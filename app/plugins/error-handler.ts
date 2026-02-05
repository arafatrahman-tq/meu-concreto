export default defineNuxtPlugin((nuxtApp) => {
  const { logout } = useAuth();

  // Interceptar erros globais do Nuxt
  nuxtApp.hook("app:error", (error: any) => {
    // Se o backend retornar 401 (Não autorizado), forçamos logout e redirecionamento
    if (error?.statusCode === 401 || error?.status === 401) {
      logout();
    }
  });

  // Interceptando erros globais do $fetch (ofetch)
  // No Nuxt, as requisições de API costumam usar useFetch ou $fetch.
  // Criamos um interceptor aqui para garantir que qualquer erro 401 vindo do $fetch
  // dispare o logout centralizado.
});
