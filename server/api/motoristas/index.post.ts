import { db } from "../../database/db";
import { motoristas } from "../../database/schema";
import { motoristaSchema } from "../../utils/validador";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  try {
    const body = await readBody(event);
    const validatedData = motoristaSchema.parse(body);

    const result = await db
      .insert(motoristas)
      .values({
        ...validatedData,
        idEmpresa: user.idEmpresa,
        ativo: validatedData.ativo ? 1 : 0,
        createdAt: new Date(),
      })
      .returning();

    setResponseStatus(event, 201);
    return result[0];
  } catch (error: any) {
    if (error.name === "ZodError") {
      throw createError({
        statusCode: 400,
        message: "Erro de validaÃ§Ã£o",
        data: error.errors,
      });
    }
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
