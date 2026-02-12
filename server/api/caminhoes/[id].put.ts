import { db } from "../../database/db";
import { caminhoes } from "../../database/schema";
import { caminhaoSharedSchema } from "#shared/schemas";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const id = Number(getRouterParam(event, "id"));
    const body = await readBody(event);
    
    // Validação parcial com schema compartilhado
    const result = caminhaoSharedSchema.partial().safeParse(body);
    
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

    const [caminhao] = await db
      .update(caminhoes)
      .set(updateData)
      .where(and(
        eq(caminhoes.id, id),
        eq(caminhoes.idEmpresa, user.idEmpresa)
      ))
      .returning();

    if (!caminhao) {
      throw createError({
        statusCode: 404,
        statusMessage: "Não Encontrado",
        message: "Caminhão não encontrado",
      });
    }

    await serverLog.info(event, "CAMINHOES", "Caminhão atualizado", {
      id: caminhao.id,
      placa: caminhao.placa,
    });

    return caminhao;
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    await serverLog.error(event, "CAMINHOES", "Erro ao atualizar caminhão", {
      error: error.message,
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao atualizar caminhão",
    });
  }
});
