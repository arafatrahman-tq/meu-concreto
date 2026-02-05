import { db } from '../../database/db';
import { usuarios } from '../../database/schema';
import { eq, or } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { identity } = body; // Pode ser e-mail ou nome de usuÃ¡rio

        if (!identity) {
            throw createError({
                statusCode: 400,
                message: 'UsuÃ¡rio ou E-mail Ã© obrigatÃ³rio',
            });
        }

        // Buscar usuÃ¡rio por e-mail ou nome de usuÃ¡rio
        const user = await db.query.usuarios.findFirst({
            where: or(
                eq(usuarios.email, identity),
                eq(usuarios.usuario, identity)
            ),
        });

        // Por seguranÃ§a, sempre retornamos sucesso mesmo que o usuÃ¡rio nÃ£o exista
        // Isso evita "leaking" de se um e-mail estÃ¡ cadastrado ou nÃ£o (User Enumeration)

        if (user && user.ativo !== 0 && !user.deletedAt) {
            // Aqui simularÃ­amos o envio de e-mail
            // Em um sistema real: 
            // 1. Gerar token Ãºnico
            // 2. Salvar no banco com expiraÃ§Ã£o
            // 3. Enviar e-mail via SMTP/API

            console.log(`[RECOVERY] SolicitaÃ§Ã£o para usuÃ¡rio: ${user.usuario} (${user.email})`);
        }

        return {
            message: 'InstruÃ§Ãµes enviadas para seu e-mail cadastrado, se ele existir em nossa base.',
        };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message,
        });
    }
});
