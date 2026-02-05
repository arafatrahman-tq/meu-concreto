import { db } from "../../database/db";
import { orcamentos, orcamentoItens } from "../../database/schema";
import { orcamentoSchema } from "../../utils/validador";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  try {
    const body = await readBody(event);
    const { itens, ...validatedData } = orcamentoSchema.parse(body);

    const [orcamento] = await db
      .insert(orcamentos)
      .values({
        ...validatedData,
        idEmpresa: user.idEmpresa,
        idUsuario: user.id,
        bombaNecessaria: validatedData.bombaNecessaria ? 1 : 0,
        createdAt: new Date(),
      })
      .returning();

    if (itens && itens.length > 0) {
      await db.insert(orcamentoItens).values(
        itens.map((item) => ({
          ...item,
          idOrcamento: orcamento.id,
        })),
      );
    }

    setResponseStatus(event, 201);
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
