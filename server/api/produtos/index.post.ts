import { db } from "../../database/db";
import { produtos } from "../../database/schema";
import { produtoSharedSchema } from "#shared/schemas";
import { requireAuth } from "../../utils/auth";
import { serverLog } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const body = await readBody(event);
    
    // Validar com schema compartilhado
    const result = produtoSharedSchema.safeParse(body);
    
    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: "Dados do produto inválidos",
        data: result.error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    const data = result.data;

    const [novoProduto] = await db
      .insert(produtos)
      .values({
        produto: data.produto,
        valorVenda: data.valorVenda || 0,
        valorCusto: data.valorCusto || 0,
        unidadeMedida: data.unidadeMedida,
        fck: data.fck,
        slump: data.slump,
        britaTipo: data.britaTipo,
        aditivo: data.aditivo,
        descricao: data.descricao,
        ncm: data.ncm,
        cfop: data.cfop,
        origem: data.origem,
        ativo: data.ativo ? 1 : 0,
        createdAt: new Date(),
      })
      .returning();

    // Registrar criação
    await serverLog.info(event, "PRODUTOS", `Novo produto cadastrado: ${data.produto}`, {
      id: novoProduto.id,
    });

    setResponseStatus(event, 201);
    return novoProduto;
  } catch (error: any) {
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error;
    }

    // Log de erro inesperado
    await serverLog.error(event, "PRODUTOS", "Erro inesperado ao criar produto", {
      error: error.message,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao processar a solicitação",
    });
  }
});
