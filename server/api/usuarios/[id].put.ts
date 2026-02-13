import { db } from '../../database/db'
import { usuarios, usuariosEmpresas } from '../../database/schema'
import { usuarioSchema } from '../../utils/validador'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id)
      throw createError({ statusCode: 400, message: 'ID não fornecido' })

    const body = await readBody(event)
    const { idEmpresasAcesso, ...validatedData } = usuarioSchema.parse(body)

    const updateData: any = {
      ...validatedData,
      admin: validatedData.admin ? 1 : 0,
      ativo: validatedData.ativo ? 1 : 0,
      updatedAt: new Date(),
    }

    // Se a senha foi fornecida, fazemos o hash
    if (validatedData.senha && validatedData.senha.trim() !== '') {
      updateData.senha = await Bun.password.hash(validatedData.senha)
    }
    else {
      delete updateData.senha
    }

    const result = await db
      .update(usuarios)
      .set(updateData)
      .where(and(eq(usuarios.id, id), isNull(usuarios.deletedAt)))
      .returning()

    if (result.length === 0) {
      throw createError({ statusCode: 404, message: 'Usuário não encontrado' })
    }

    // Atualizar acesso a múltiplas empresas
    // Primeiro removemos os acessos atuais
    await db.delete(usuariosEmpresas).where(eq(usuariosEmpresas.idUsuario, id))

    // Depois inserimos os novos se houver
    if (idEmpresasAcesso && idEmpresasAcesso.length > 0) {
      await db.insert(usuariosEmpresas).values(
        idEmpresasAcesso.map(idEmp => ({
          idUsuario: id,
          idEmpresa: idEmp,
        })),
      )
    }

    // Omitimos a senha da resposta
    const { senha, ...userWithoutPassword } = result[0] as any
    return userWithoutPassword
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Erro de validação',
        data: error.errors,
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
