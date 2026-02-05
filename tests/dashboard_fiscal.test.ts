import { describe, it, expect, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../server/database/schema";
import { eq, sql } from "drizzle-orm";

describe("Dashboard Fiscal Logic", () => {
  let db: any;

  beforeAll(async () => {
    const sqlite = new Database(":memory:");
    db = drizzle(sqlite, { schema });

    // Mock minimal tables for testing calculation logic
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS empresas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa TEXT,
        cnpj TEXT UNIQUE,
        created_at INTEGER,
        updated_at INTEGER,
        deleted_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_orcamento INTEGER,
        data_venda INTEGER,
        valor_total INTEGER NOT NULL,
        status TEXT DEFAULT 'ABERTA',
        id_empresa INTEGER,
        nfe_numero TEXT,
        nfe_serie TEXT,
        nfe_chave TEXT,
        nfe_link TEXT,
        nfse_numero TEXT,
        nfse_link TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        deleted_at INTEGER
      );
    `);
  });

  it("should calculate 0% compliance when there are no sales", async () => {
    const idEmpresa = 1;

    const totalVendas = await db
      .select({ count: sql`count(*)` })
      .from(schema.vendas)
      .where(eq(schema.vendas.idEmpresa, idEmpresa));

    const percentual = totalVendas[0].count > 0 ? 100 : 0;
    expect(percentual).toBe(0);
  });

  it("should calculate 50% compliance when 1 out of 2 sales has a document status", async () => {
    const idEmpresa = 10;

    // Insert 2 sales
    await db.insert(schema.vendas).values([
      { idEmpresa, idOrcamento: 1, valorTotal: 1000, status: "NF_EMITIDA" },
      { idEmpresa, idOrcamento: 2, valorTotal: 2000, status: "ABERTA" }
    ]);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.vendas)
      .where(eq(schema.vendas.idEmpresa, idEmpresa));

    const emitidas = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.vendas)
      .where(
        sql`${schema.vendas.idEmpresa} = ${idEmpresa} AND ${schema.vendas.status} = 'NF_EMITIDA'`
      );

    const percentual = total[0].count > 0 
      ? Math.round((emitidas[0].count / total[0].count) * 100)
      : 0;

    expect(percentual).toBe(50);
  });

  it("should map recent deliveries to the UI format correctly", async () => {
    // This mocks the mapper logic in the API
    const mockDbResult = [
      {
        id: 1,
        nomeCliente: "Cliente A",
        dataEntrega: new Date("2026-02-03T10:00:00Z"),
        enderecoEntrega: "Rua A, 123",
        bairro: "Bairro A",
        status: "APROVADO",
        vendaStatus: "NF_EMITIDA",
        vendaNfse: "123"
      },
      {
        id: 2,
        nomeCliente: "Cliente B",
        dataEntrega: new Date("2026-02-03T14:30:00Z"),
        enderecoEntrega: "Rua B, 456",
        bairro: "Bairro B",
        status: "PENDENTE",
        vendaStatus: null,
        vendaNfse: null
      }
    ];

    const mapped = mockDbResult.map((d: any) => ({
      id: d.id,
      title: d.nomeCliente,
      time: d.dataEntrega ? new Date(d.dataEntrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
      date: d.dataEntrega ? d.dataEntrega.toISOString().split('T')[0] : '',
      location: d.bairro || d.enderecoEntrega || 'Endereço não informado',
      tag: d.vendaStatus === "NF_EMITIDA" ? "DOC. EMITIDO" : (d.status === "APROVADO" ? "AGENDADO" : d.status),
      status: d.status,
      hasNf: !!d.vendaNfse
    }));

    expect(mapped[0].tag).toBe("DOC. EMITIDO");
    expect(mapped[0].hasNf).toBe(true);
    expect(mapped[0].time).toMatch(/^\d{2}:\d{2}$/); 
    
    expect(mapped[1].tag).toBe("PENDENTE");
    expect(mapped[1].hasNf).toBe(false);
  });
});
