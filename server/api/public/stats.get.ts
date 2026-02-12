import { db } from "../../database/db";
import { ordensServico, clientes, caminhoes, bombas } from "../../database/schema";
import { sql, eq, and, isNull } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // Queries are intentionally global (across all companies) for public landing page
    
    // 1. Total Volume Delivered
    const volumeResult = await db
      .select({
        total: sql<number>`sum(${ordensServico.qtd})`,
      })
      .from(ordensServico)
      .where(eq(ordensServico.status, "CONCLUIDA"));

    // 2. Total Clients
    const clientsResult = await db
      .select({
        count: sql<number>`count(${clientes.id})`,
      })
      .from(clientes)
      .where(isNull(clientes.deletedAt));

    // 3. Active Fleet (Trucks + Pumps)
    const trucksResult = await db
      .select({ count: sql<number>`count(${caminhoes.id})` })
      .from(caminhoes)
      .where(isNull(caminhoes.deletedAt));
    
    const pumpsResult = await db
      .select({ count: sql<number>`count(${bombas.id})` })
      .from(bombas)
      .where(isNull(bombas.deletedAt));

    // 4. Precision calculation
    const totalOSResult = await db
      .select({ count: sql<number>`count(${ordensServico.id})` })
      .from(ordensServico);

    const completedOS = await db
      .select({ count: sql<number>`count(${ordensServico.id})` })
      .from(ordensServico)
      .where(eq(ordensServico.status, "CONCLUIDA"));
    
    const totalOS = totalOSResult[0]?.count || 0;
    const completedCount = completedOS[0]?.count || 0;
    
    // Real data from database
    const realVolume = Number(volumeResult[0]?.total || 0);
    const realClients = Number(clientsResult[0]?.count || 0);
    const realTrucks = Number(trucksResult[0]?.count || 0);
    const realPumps = Number(pumpsResult[0]?.count || 0);
    
    const precisionReal = totalOS > 0 ? ((completedCount / totalOS) * 100).toFixed(1) : "0.0";

    return {
      volume: realVolume,
      clientes: realClients,
      frota: realTrucks + realPumps,
      precisao: precisionReal,
    };
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return {
      volume: 0,
      clientes: 0,
      frota: 0,
      precisao: "0.0",
    };
  }
});
