import { db } from "../../../database/db";
import { fornecedores } from "../../../database/schema";
import { fornecedorSharedSchema } from "#shared/schemas";
import { requireAuth } from "../../../utils/auth";
import { serverLog } from "../../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const body = await readBody(event);
    
    // Validação com schema compartilhado
    const result = fornecedorSharedSchema.safeParse(body);
    
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

    const [novoFornecedor] = await db
      .insert(fornecedores)
      .values({
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      })
      .returning();

    if (!novoFornecedor) {
      throw createError({
        statusCode: 500,
        statusMessage: "Erro Interno",
        message: "Falha ao cadastrar fornecedor",
      });
    }

    await serverLog.info(event, "FINANCEIRO", "Fornecedor cadastrado", {
      id: novoFornecedor.id,
      nome: novoFornecedor.nome,
    });

    return novoFornecedor;
  } catch (error: any) {
    if (error.statusCode) throw error;

    await serverLog.error(event, "FINANCEIRO", "Erro ao cadastrar fornecedor", {
      error: error.message,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao cadastrar fornecedor",
    });
  }
});
