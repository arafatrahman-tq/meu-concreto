/**
 * Mapa de rotas para IDs de menu
 * Deve corresponder aos IDs definidos em server/utils/menu-items.ts
 */
const routeToMenuId: Record<string, string> = {
  '/': 'dashboard',
  '/gestao': 'analise',
  '/configuracoes/fiscal-ai': 'fiscal-ai',
  '/clientes': 'clientes',
  '/vendedores': 'vendedores',
  '/orcamentos': 'orcamentos',
  '/vendas': 'vendas',
  '/insumos': 'insumos',
  '/tracos': 'tracos',
  '/produtos': 'produtos',
  '/agenda': 'agenda',
  '/bombas/agenda': 'agenda-bombas',
  '/caminhoes': 'caminhoes',
  '/bombas': 'bombas',
  '/motoristas': 'motoristas',
  '/relatorios': 'dashboard-bi',
  '/financeiro': 'financeiro',
  '/pagamentos': 'contas-receber',
  '/financeiro/contas-pagar': 'contas-pagar',
  '/financeiro/inadimplencia': 'inadimplencia',
  '/financeiro/fornecedores': 'fornecedores',
  '/formas-pagamento': 'formas-pagamento',
  '/configuracoes/fiscal': 'centro-fiscal',
  '/configuracoes/whatsapp': 'whatsapp',
  '/configuracoes/bling': 'bling',
  '/configuracoes/asaas': 'asaas',
  '/configuracoes/sicoob': 'sicoob',
  '/configuracoes/pix-manual': 'pix-manual',
  '/configuracoes/empresa': 'empresa',
  '/usuarios': 'usuarios',
  '/empresas': 'filiais',
  '/configuracoes/sistema': 'sistema',
  '/logs': 'logs',
}

// Rotas públicas que não precisam de verificação
const publicRoutes = ['/', '/login', '/forgot-password', '/select-company']

// Rotas que devem ser excluídas da verificação (API, assets, etc)
const excludedPrefixes = ['/api', '/_nuxt', '/__nuxt', '/favicon', '/robots']

/**
 * Middleware global para verificar permissões de menu
 * Bloqueia acesso a rotas que o usuário não tem permissão
 *
 * Este middleware é executado em todas as navegações após o auth.global.ts
 */
export default defineNuxtRouteMiddleware((to) => {
  // Executar apenas no cliente para ter acesso ao estado do usuário
  if (import.meta.server) return

  const { user } = useAuth()

  // Se não está logado, deixa o auth.global.ts lidar
  if (!user.value) return

  // Administradores sempre têm acesso
  if (user.value.admin === 1) return

  const path = to.path

  // Verificar se é uma rota pública
  if (publicRoutes.includes(path)) return

  // Verificar se a rota deve ser excluída
  if (excludedPrefixes.some(prefix => path.startsWith(prefix))) return

  // Verificar correspondência exata primeiro
  let menuId = routeToMenuId[path]

  // Se não encontrou, tentar verificar prefixos para rotas dinâmicas
  if (!menuId) {
    const pathParts = path.split('/').filter(Boolean)
    if (pathParts.length > 1) {
      // Tentar combinações do path (ex: /financeiro/contas-pagar/edit/123 -> /financeiro/contas-pagar)
      for (let i = pathParts.length; i > 0; i--) {
        const testPath = '/' + pathParts.slice(0, i).join('/')
        if (routeToMenuId[testPath]) {
          menuId = routeToMenuId[testPath]
          break
        }
      }
    }
  }

  // Se a rota não está mapeada, permite por padrão (pode ser uma rota interna)
  if (!menuId) return

  // Verificar se o usuário tem permissão
  const permissions = user.value.menuPermissions || []

  // Se não há permissões definidas, permite tudo (backwards compatibility)
  if (permissions.length === 0) return

  if (!permissions.includes(menuId)) {
    // Usuário não tem permissão - redireciona para dashboard
    // Toast e log são opcionais e podem causar erros de hidratação
    console.warn(`[SEGURANÇA] Acesso negado: ${user.value.nome} tentou acessar ${to.path}`)

    // Abortar a navegação e redirecionar para o dashboard
    return navigateTo('/', { replace: true })
  }
})
