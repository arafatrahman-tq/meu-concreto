import { db } from "../../database/db";
import { logs, empresas, usuarios, orcamentos } from "../../database/schema";
import { eq, and, isNull, desc, or, inArray } from "drizzle-orm";
import { getAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    const authUser = getAuthenticatedUser(event);
    if (!authUser) {
      throw createError({ statusCode: 401, message: "Não autorizado" });
    }

    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, authUser.id),
    });

    if (!user || user.admin !== 1) {
      return []; // Retorna lista vazia em vez de erro para não quebrar o layout
    }

    // Busca os últimos 10 logs importantes
    const recentLogs = await db.query.logs.findMany({
      where: or(eq(logs.nivel, "WARN"), eq(logs.nivel, "ERROR")),
      orderBy: [desc(logs.timestamp)],
      limit: 10,
      with: {
        empresa: true,
      },
    });

    // Busca orçamentos pendentes (Aprovações Pendentes)
    const pendingOrcamentos = await db.query.orcamentos.findMany({
      where: and(
        eq(orcamentos.status, "PENDENTE"),
        inArray(orcamentos.idEmpresa, [user.idEmpresa]),
      ),
      orderBy: [desc(orcamentos.createdAt)],
      limit: 5,
    });

    const notifications = [
      ...pendingOrcamentos.map((o) => ({
        id: `orc-${o.id}`,
        title: "Aprovação Pendente",
        message: `Orçamento #${String(o.id).padStart(4, "0")} de ${o.nomeCliente} aguarda aprovação.`,
        type: "WARN",
        time: o.createdAt,
        empresa: user.idEmpresa,
        icon: "FileStack",
      })),
      ...recentLogs.map((n) => ({
        id: `log-${n.id}`,
        title: n.modulo,
        message: n.mensagem,
        type: n.nivel,
        time: n.timestamp,
        empresa: n.empresa?.empresa || "Sistema",
        icon: n.nivel === "ERROR" ? "AlertTriangle" : "Info",
      })),
    ].sort((a, b) => {
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      return timeB - timeA;
    });

    return notifications;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
