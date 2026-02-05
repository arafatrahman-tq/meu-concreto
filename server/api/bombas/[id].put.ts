import { db } from "../../database/db";
import { bombas } from "../../database/schema";
import { bombaSchema } from "../../utils/validador";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const id = Number(event.context.params?.id);
    const body = await readBody(event);
    const validatedData = bombaSchema.parse(body);

    const result = await db.update(bombas)
      .set({
        ...validatedData,
        ativo: validatedData.ativo !== undefined ? (validatedData.ativo ? 1 : 0) : undefined,
        updatedAt: new Date(),
      })
      .where(and(
        eq(bombas.id, id),
        eq(bombas.idEmpresa, user.idEmpresa)
      ))
      .returning();

    if (!result.length || !result[0]) {
      throw createError({ statusCode: 404, message: 'Bomba não encontrada' });
    }

    await serverLog.info(event, 'BOMBAS', `Bomba atualizada: ${result[0].nome}`, { id });

    return result[0];
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Erro de validação: ' + error.issues.map((i: any) => i.message).join(', '),
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar bomba',
    });
  }
});
