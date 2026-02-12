import { db } from "../../../database/db";
import { contasPagar } from "../../../database/schema";
import { contaPagarSharedSchema } from "#shared/schemas";
import { requireAuth } from "../../../utils/auth";
import { serverLog } from "../../../utils/logger";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  
  try {
    const body = await readBody(event);
    
    // Validação com schema compartilhado
    const result = contaPagarSharedSchema.safeParse(body);
    
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

    const [novaConta] = await db
      .insert(contasPagar)
      .values({
        descricao: data.descricao,
        idFornecedor: data.idFornecedor,
        valor: data.valor,
        dataVencimento: data.dataVencimento,
        dataPagamento: data.dataPagamento,
        status: data.status,
        idEmpresa: user.idEmpresa,
        createdAt: new Date(),
      })
      .returning();

    if (!novaConta) {
      throw createError({
        statusCode: 500,
        statusMessage: "Erro Interno",
        message: "Falha ao cadastrar conta a pagar",
      });
    }

    await serverLog.info(event, "FINANCEIRO", "Conta a pagar cadastrada", {
      id: novaConta.id,
      descricao: novaConta.descricao,
    });

    return novaConta;
  } catch (error: any) {
    if (error.statusCode) throw error;

    await serverLog.error(event, "FINANCEIRO", "Erro ao cadastrar conta a pagar", {
      error: error.message,
    });

    throw createError({
      statusCode: 500,
      statusMessage: "Erro Interno",
      message: "Erro ao cadastrar conta a pagar",
    });
  }
});
