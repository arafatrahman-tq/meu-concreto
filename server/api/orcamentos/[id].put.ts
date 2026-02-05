import { db } from "../../database/db";
import { orcamentos, orcamentoItens } from "../../database/schema";
import { orcamentoSchema } from "../../utils/validador";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const id = getRouterParam(event, "id");
    if (!id)
      throw createError({ statusCode: 400, message: "ID não fornecido" });

    const body = await readBody(event);
    const { itens, ...validatedData } = orcamentoSchema.partial().parse(body);

    // Impedir alteração de campos sensíveis via body
    delete (validatedData as any).id;
    delete (validatedData as any).idEmpresa;
    delete (validatedData as any).idUsuario;

    const result = await db
      .update(orcamentos)
      .set({
        ...validatedData,
        bombaNecessaria:
          validatedData.bombaNecessaria !== undefined
            ? validatedData.bombaNecessaria
              ? 1
              : 0
            : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orcamentos.id, parseInt(id)),
          eq(orcamentos.idEmpresa, user.idEmpresa),
          isNull(orcamentos.deletedAt),
        ),
      )
      .returning();

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: "Orçamento não encontrado",
      });
    }

    const orcamento = result[0];

    // Sincronizar Itens (Simples: Deleta e insere novamente)
    if (itens) {
      await db
        .delete(orcamentoItens)
        .where(eq(orcamentoItens.idOrcamento, orcamento.id));
      if (itens.length > 0) {
        await db.insert(orcamentoItens).values(
          itens.map((item) => ({
            ...item,
            idOrcamento: orcamento.id,
          })),
        );
      }
    }

    return orcamento;
  } catch (error: any) {
    if (error.name === "ZodError") {
      const messages = error.issues
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      throw createError({
        statusCode: 400,
        statusMessage: "Erro de Validação",
        message: messages,
      });
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Erro Interno",
      message: error.message,
    });
  }
});
