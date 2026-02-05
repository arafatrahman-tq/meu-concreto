import { db } from "../../database/db";
import { bombas } from "../../database/schema";
import { bombaSchema } from "../../utils/validador";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event);
    const body = await readBody(event);
    const validatedData = bombaSchema.parse(body);

    const result = await db.insert(bombas).values({
      ...validatedData,
      ativo: validatedData.ativo ? 1 : 0,
      idEmpresa: user.idEmpresa,
    }).returning();

    const novaBomba = result[0];
    if (!novaBomba) {
      throw createError({ statusCode: 500, message: "Falha ao criar bomba" });
    }
    
    await serverLog.info(event, 'BOMBAS', `Bomba cadastrada: ${novaBomba.nome}`, { id: novaBomba.id });

    return novaBomba;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Erro de validação: ' + error.issues.map((i: any) => i.message).join(', '),
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao criar bomba',
    });
  }
});
