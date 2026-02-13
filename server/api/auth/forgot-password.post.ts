import { db } from '../../database/db'
import { usuarios } from '../../database/schema'
import { eq, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { identity } = body // Pode ser e-mail ou nome de usuário

    if (!identity) {
      throw createError({
        statusCode: 400,
        message: 'Usuário ou E-mail é obrigatório',
      })
    }

    // Buscar usuário por e-mail ou nome de usuário
    const user = await db.query.usuarios.findFirst({
      where: or(
        eq(usuarios.email, identity),
        eq(usuarios.usuario, identity),
      ),
    })

    // Por segurança, sempre retornamos sucesso mesmo que o usuário não exista
    // Isso evita "leaking" de se um e-mail está cadastrado ou não (User Enumeration)

    if (user && user.ativo !== 0 && !user.deletedAt) {
      // Aqui simularíamos o envio de e-mail
      // Em um sistema real:
      // 1. Gerar token único
      // 2. Salvar no banco com expiração
      // 3. Enviar e-mail via SMTP/API

      console.log(`[RECOVERY] Solicitação para usuário: ${user.usuario} (${user.email})`)
    }

    return {
      message: 'Instruções enviadas para seu e-mail cadastrado, se ele existir em nossa base.',
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
