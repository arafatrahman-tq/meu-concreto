import { db } from "../../database/db";
import { bombas } from "../../database/schema";
import { bombaSharedSchema } from "#shared/schemas";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const id = Number(getRouterParam(event, "id"));
    const body = await readBody(event);
    
    // Validação com schema compartilhado (parcial para atualizações)
    const result = bombaSharedSchema.partial().safeParse(body);
    
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: "Dados inválidos",
        data: result.error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    const data = result.data;
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    
    // Converte ativo boolean para integer se presente
    if (data.ativo !== undefined) {
      updateData.ativo = data.ativo ? 1 : 0;
    }
    
    // Remove idEmpresa das atualizações (não deve ser alterado)
    delete updateData.idEmpresa;

    const [bomba] = await db
      .update(bombas)
      .set(updateData)
      .where(and(
        eq(bombas.id, id),
        eq(bombas.idEmpresa, user.idEmpresa)
      ))
      .returning();

    if (!bomba) {
      throw createError({
        statusCode: 404,
        statusMessage: "Não Encontrado",
        message: "Bomba não encontrada",
      });
    }

    await serverLog.info(event, "BOMBAS", "Bomba atualizada", {
      id: bomba.id,
      nome: bomba.nome,
    });

    return bomba;
  } catch (error: any) {
    if (error.statusCode) throw error;

    await serverLog.error(event, "BOMBAS", "Erro ao atualizar bomba", {
      error: error.message,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao atualizar bomba",
    });
  }
});
