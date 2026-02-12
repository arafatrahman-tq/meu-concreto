import { db } from "../database/db";

/**
 * Healthcheck endpoint para monitoramento
 * Retorna status 200 se a aplicação está funcionando
 */
export default defineEventHandler(async () => {
  try {
    // Verificar conexão com banco de dados
    // Test query simples
    await db.query.empresas.findFirst();
    
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      version: "1.0.0",
    };
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      data: {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});
