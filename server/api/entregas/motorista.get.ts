import { db } from "../../database/db";
import { motoristas, ordensServico, orcamentos } from "../../database/schema";
import { eq, and, isNotNull, isNull, gte, lte, or } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pin = query.pin as string;

  if (!pin || pin.length !== 4) {
    throw createError({ statusCode: 400, message: "PIN inválido" });
  }

  try {
    // 1. Validar Motorista
    const motorista = await db.query.motoristas.findFirst({
      where: and(eq(motoristas.pin, pin), eq(motoristas.ativo, 1)),
    });

    if (!motorista) {
      throw createError({
        statusCode: 401,
        message: "Motorista não encontrado ou inativo",
      });
    }

    // 2. Buscar Ordens de Serviço (Cargas) vinculadas ao motorista
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const cargasOs = await db.query.ordensServico.findMany({
      where: and(
        eq(ordensServico.idMotorista, motorista.id),
        gte(ordensServico.createdAt, hoje),
        or(
          eq(ordensServico.status, "AGUARDANDO_SAIDA"),
          eq(ordensServico.status, "EM_TRANSITO"),
          eq(ordensServico.status, "DESCARREGANDO"),
        ),
      ),
      with: {
        orcamento: true,
      },
      orderBy: (os, { asc }) => [asc(os.createdAt)],
    });

    // Mapeia para manter compatibilidade com o frontend se necessário, ou ajusta o frontend
    const cargas = cargasOs.map((os) => ({
      id: os.id,
      idOrcamento: os.idOrcamento,
      numeroTicket: os.numeroTicket,
      nomeCliente: os.orcamento.nomeCliente,
      enderecoEntrega: os.orcamento.enderecoEntrega,
      qtd: os.qtd,
      status: os.status,
      dataEntrega: os.createdAt,
    }));

    return {
      motorista: {
        id: motorista.id,
        nome: motorista.nome,
      },
      cargas,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
