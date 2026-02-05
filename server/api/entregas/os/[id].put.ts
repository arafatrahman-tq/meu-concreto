import { db } from "../../../database/db";
import { ordensServico } from "../../../database/schema";
import { and, eq } from "drizzle-orm";
import { ordemServicoSchema } from "../../../utils/validador";
import { requireAuth } from "../../../utils/auth";
import { serverLog } from "../../../utils/logger";
import { EntregaService } from "../../../services/entrega";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const id = Number(getRouterParam(event, "id"));

  try {
    const body = await readBody(event);
    const validatedData = ordemServicoSchema.partial().parse(body);

    const [updatedOs] = await db
      .update(ordensServico)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(ordensServico.id, id),
          eq(ordensServico.idEmpresa, user.idEmpresa),
        ),
      )
      .returning();

    if (!updatedOs) {
      throw createError({
        statusCode: 404,
        message: "Ordem de Serviço não encontrada",
      });
    }

    // Se a OS foi marcada como CONCLUIDA, processamos a baixa de estoque
    if (validatedData.status === "CONCLUIDA") {
      await EntregaService.processarConclusaoOS(updatedOs.id, user.id);
    }

    await serverLog.info(
      event,
      "ENTREGAS",
      `Ordem de Serviço ${updatedOs.numeroTicket || updatedOs.id} atualizada para: ${updatedOs.status}`,
      { id: updatedOs.id, status: updatedOs.status },
    );

    return updatedOs;
  } catch (error: any) {
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: error.issues
          ? error.issues.map((e: any) => e.message).join(", ")
          : error.message,
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Erro Interno",
      message: error.message,
    });
  }
});
