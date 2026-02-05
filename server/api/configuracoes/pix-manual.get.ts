import { db } from "../../database/db";
import { configuracoesPixManual } from "../../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const config = await db.query.configuracoesPixManual.findFirst({
    where: eq(configuracoesPixManual.idEmpresa, user.idEmpresa),
  });

  return (
    config || {
      chavePix: "",
      beneficiario: "",
      cidade: "",
      ativo: 0,
    }
  );
});
