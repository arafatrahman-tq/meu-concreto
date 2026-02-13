import { getAuthenticatedUser } from '../utils/auth'
import { db } from '../database/db'
import { usuarios, usuariosEmpresas } from '../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Ignorar rotas que não são da API ou são de autenticação pública
  const url = getRequestURL(event)
  if (
    !url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/api/auth/login')
    || url.pathname.startsWith('/api/auth/forgot-password')
  ) {
    return
  }

  // Popula o contexto com o usuário autenticado
  const sessionUser = getAuthenticatedUser(event)
  if (sessionUser) {
    // Buscar usuário completo no banco para ter admin, idEmpresa e idEmpresasAcesso atualizados
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, sessionUser.id),
      with: {
        acessoEmpresas: true,
      },
    })

    if (user && user.ativo !== 0 && !user.deletedAt) {
      const authUser: any = {
        ...user,
        // Mantém o idEmpresa da sessão (unidade ativa) se o usuário tiver acesso a ela
        idEmpresa:
          user.idEmpresa === sessionUser.idEmpresa
          || user.acessoEmpresas?.some(
            ae => ae.idEmpresa === sessionUser.idEmpresa,
          )
            ? sessionUser.idEmpresa
            : user.idEmpresa,
        idEmpresasAcesso: [
          user.idEmpresa,
          ...(user.acessoEmpresas?.map(e => e.idEmpresa) || []),
        ],
      }
      // Garantir IDs únicos
      authUser.idEmpresasAcesso = Array.from(
        new Set(authUser.idEmpresasAcesso),
      )

      event.context.user = authUser
    }
  }
})
