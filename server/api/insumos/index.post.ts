import { db } from "../../database/db";
import { insumos } from "../../database/schema";
import { insumoSharedSchema } from "#shared/schemas";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const body = await readBody(event);
    
    // Validação com schema compartilhado
    const result = insumoSharedSchema.safeParse(body);
    
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

    const [novoInsumo] = await db
      .insert(insumos)
      .values({
        nome: data.nome,
        unidadeMedida: data.unidadeMedida,
        estoqueAtual: data.estoqueAtual,
        estoqueMinimo: data.estoqueMinimo,
        custoUnitario: data.custoUnitario,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      })
      .returning();

    if (!novoInsumo) {
      throw createError({
        statusCode: 500,
        statusMessage: "Erro Interno",
        message: "Falha ao criar insumo",
      });
    }

    await serverLog.info(event, "INSUMOS", "Insumo cadastrado", {
      id: novoInsumo.id,
      nome: novoInsumo.nome,
    });

    setResponseStatus(event, 201);
    return novoInsumo;
  } catch (error: any) {
    if (error.statusCode) throw error;

    await serverLog.error(event, "INSUMOS", "Erro ao criar insumo", {
      error: error.message,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao criar insumo",
    });
  }
});
