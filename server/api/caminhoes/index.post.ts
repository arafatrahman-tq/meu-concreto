import { db } from "../../database/db";
import { caminhoes } from "../../database/schema";
import { caminhaoSharedSchema } from "#shared/schemas";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const body = await readBody(event);
    
    // Validação com schema compartilhado
    const result = caminhaoSharedSchema.safeParse(body);
    
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

    const [caminhao] = await db
      .insert(caminhoes)
      .values({
        placa: data.placa,
        modelo: data.modelo,
        capacidade: data.capacidade,
        ativo: data.ativo ? 1 : 0,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      })
      .returning();

    await serverLog.info(event, "CAMINHOES", "Caminhão cadastrado", {
      id: caminhao.id,
      placa: caminhao.placa,
    });

    setResponseStatus(event, 201);
    return caminhao;
  } catch (error: any) {
    if (error.statusCode) throw error;
    
    await serverLog.error(event, "CAMINHOES", "Erro ao cadastrar caminhão", {
      error: error.message,
    });
    
    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao cadastrar caminhão",
    });
  }
});
