import { db } from '../../../database/db';
import { usuarios } from '../../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        if (!id) throw createError({ statusCode: 400, message: 'ID não fornecido' });

        const body = await readBody(event);
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            throw createError({ statusCode: 400, message: 'Senhas são obrigatórias' });
        }

        const user = await db.query.usuarios.findFirst({
            where: and(eq(usuarios.id, id), isNull(usuarios.deletedAt))
        });

        if (!user) {
            throw createError({ statusCode: 404, message: 'Usuário não encontrado' });
        }

        // Verificar senha atual
        const isPasswordCorrect = await Bun.password.verify(currentPassword, user.senha);
        if (!isPasswordCorrect) {
            throw createError({ statusCode: 401, message: 'Senha atual incorreta' });
        }

        // Hash da nova senha
        const hashedPassword = await Bun.password.hash(newPassword);

        await db.update(usuarios)
            .set({
                senha: hashedPassword,
                passwordChangeRequired: 0,
                updatedAt: new Date()
            })
            .where(eq(usuarios.id, user.id));

        return { message: 'Senha alterada com sucesso' };

    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
