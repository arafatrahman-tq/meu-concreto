import { describe, it, expect, beforeAll } from 'bun:test'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from '../server/database/schema'
import { and, eq, isNull } from 'drizzle-orm'

describe('Multi-tenancy Runtime Isolation', () => {
  let db: any

  beforeAll(async () => {
    // Setup in-memory DB for tests
    const sqlite = new Database(':memory:')
    db = drizzle(sqlite, { schema })

    // In a real scenario with migrations, we'd run them here.
    // Drizzle-kit push is usually used for this.
    // For this test, let's assume the schema is synced or we focus on logic.
    // Note: bun:sqlite + drizzle might need the tables created.
    // Since I can't run external shell commands to push to memory,
    // I will mock the query behavior if I can't hit the real DB schema.

    // However, Drizzle lets us run raw SQL to setup.
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS empresas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa TEXT NOT NULL,
        cnpj TEXT NOT NULL UNIQUE,
        ie TEXT,
        logo TEXT,
        endereco TEXT,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        cidade_ibge TEXT,
        telefone TEXT,
        email TEXT,
        filial TEXT,
        crt INTEGER DEFAULT 1,
        codigo_servico_municipal TEXT DEFAULT '07.02',
        created_at INTEGER,
        updated_at INTEGER,
        deleted_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT NOT NULL,
        endereco TEXT,
        numero TEXT,
        complemento TEXT,
        endereco_entrega TEXT,
        bairro TEXT,
        cidade TEXT,
        cep TEXT,
        estado TEXT,
        cidade_ibge TEXT,
        telefone TEXT,
        email TEXT,
        id_empresa INTEGER NOT NULL,
        created_at INTEGER,
        updated_at INTEGER,
        deleted_at INTEGER
      );
    `)
  })

  it('should isolate data between different companies', async () => {
    // 1. Arrange: Create two companies
    const [empA] = await db
      .insert(schema.empresas)
      .values([{ empresa: 'Empresa A', cnpj: '111' }])
      .returning()

    const [empB] = await db
      .insert(schema.empresas)
      .values([{ empresa: 'Empresa B', cnpj: '222' }])
      .returning()

    // 2. Arrange: Create clients for both companies
    await db.insert(schema.clientes).values([
      { nome: 'Cliente da A', cpfCnpj: '123', idEmpresa: empA.id },
      { nome: 'Outro da A', cpfCnpj: '456', idEmpresa: empA.id },
      { nome: 'Cliente da B', cpfCnpj: '789', idEmpresa: empB.id },
    ])

    // 3. Act: Simulate a user from Company A fetching clients
    const userA_idEmpresa = empA.id
    const resultForA = await db.query.clientes.findMany({
      where: and(
        eq(schema.clientes.idEmpresa, userA_idEmpresa),
        isNull(schema.clientes.deletedAt),
      ),
    })

    // 4. Assert: User A should ONLY see clients from Company A
    expect(resultForA).toHaveLength(2)
    expect(resultForA.every((c: any) => c.idEmpresa === empA.id)).toBe(true)
    expect(
      resultForA.find((c: any) => c.nome === 'Cliente da B'),
    ).toBeUndefined()

    // 5. Act: Simulate a user from Company B fetching clients
    const userB_idEmpresa = empB.id
    const resultForB = await db.query.clientes.findMany({
      where: and(
        eq(schema.clientes.idEmpresa, userB_idEmpresa),
        isNull(schema.clientes.deletedAt),
      ),
    })

    // 6. Assert: User B should ONLY see clients from Company B
    expect(resultForB).toHaveLength(1)
    expect(resultForB[0].nome).toBe('Cliente da B')
  })

  it('should respect soft-delete (deletedAt)', async () => {
    const [emp] = await db
      .insert(schema.empresas)
      .values([{ empresa: 'Soft Delete Test', cnpj: '333' }])
      .returning()

    const [c1] = await db
      .insert(schema.clientes)
      .values([
        { nome: 'Ativo', cpfCnpj: '1', idEmpresa: emp.id },
        {
          nome: 'Deletado',
          cpfCnpj: '2',
          idEmpresa: emp.id,
          deletedAt: new Date(),
        },
      ])
      .returning()

    const result = await db.query.clientes.findMany({
      where: and(
        eq(schema.clientes.idEmpresa, emp.id),
        isNull(schema.clientes.deletedAt),
      ),
    })

    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('Ativo')
  })
})
