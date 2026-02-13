import { db } from '../../database/db'
import { usuarios } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { serverLog } from '../../utils/logger'
import { signData } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password, rememberMe } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: 'Usuário e senha são obrigatórios',
      })
    }

    // Buscar usuário
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.usuario, username),
      with: {
        acessoEmpresas: true,
      },
    })

    if (!user || user.ativo === 0 || user.deletedAt) {
      throw createError({
        statusCode: 401,
        message: 'Credenciais inválidas ou usuário inativo',
      })
    }

    // Verificar senha
    const isPasswordCorrect = await Bun.password.verify(password, user.senha)
    if (!isPasswordCorrect) {
      // Registrar tentativa de login inválida usando utility centralizado
      await serverLog.warn(
        event,
        'AUTH',
        `Tentativa de login falhou para o usuário: ${username}`,
        { username }
      )

      throw createError({
        statusCode: 401,
        message: 'Credenciais inválidas',
      })
    }

    // Registrar sucesso usando utility centralizado
    await serverLog.info(
      event,
      'AUTH',
      `Usuário ${user.usuario} realizou login no sistema`
    )

    // Omitir senha da resposta
    const { senha, ...userWithoutPassword } = user as any

    // Dados para a sessão
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 dias ou 1 dia
    const sessionData = JSON.stringify({
      id: user.id,
      idEmpresa: user.idEmpresa,
      nome: user.nome,
      email: user.email,
      admin: user.admin,
      exp: Date.now() + maxAge * 1000,
    })

    // Definir cookie de sessão assinado
    setCookie(event, 'auth_session', signData(sessionData), {
      maxAge,
      httpOnly: true, // Protege contra XSS (impede que JavaScript acesse o cookie)
      secure: process.env.NODE_ENV === 'production', // Protege contra interceptação MitM
      sameSite: 'strict', // Previne CSRF
      path: '/',
    })

    return {
      user: userWithoutPassword,
      message: 'Login realizado com sucesso',
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
