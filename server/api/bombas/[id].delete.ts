import { db } from "../../database/db";
import { bombas } from "../../database/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const id = Number(event.context.params?.id);

    const result = await db.update(bombas)
      .set({
        deletedAt: new Date(),
        ativo: 0,
      })
      .where(and(
        eq(bombas.id, id),
        eq(bombas.idEmpresa, user.idEmpresa)
      ))
      .returning();

    if (!result.length || !result[0]) {
      throw createError({ statusCode: 404, message: 'Bomba não encontrada' });
    }

    await serverLog.warn(event, 'BOMBAS', `Bomba excluída: ${result[0].nome}`, { id });

    return { message: 'Bomba excluída com sucesso' };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir bomba',
    });
  }
});
