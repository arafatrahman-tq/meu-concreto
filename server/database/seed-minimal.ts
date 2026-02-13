import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

async function seedMinimal() {
  const dbFile = process.env.DB_FILE_NAME || 'mydb.sqlite'
  console.log(`🌱 Iniciando Seed Mínimo no banco: ${dbFile}`)

  const sqlite = new Database(dbFile)
  const db = drizzle(sqlite, { schema })

  // 1. Criar Empresa Padrão
  let empresa = await db.query.empresas.findFirst()

  if (!empresa) {
    console.log('🏢 Criando empresa inicial...')
    const result = await db
      .insert(schema.empresas)
      .values({
        empresa: 'Minha Empresa Concreto',
        cnpj: '00000000000000',
        email: 'admin@sistema.com',
        crt: 1,
      })
      .returning()
    empresa = result[0]
  }
  else {
    console.log('ℹ️ Empresa já existe.')
  }

  // 2. Criar Usuário Administrador
  const existingAdmin = await db.query.usuarios.findFirst({
    where: eq(schema.usuarios.usuario, 'admin'),
  })

  if (!existingAdmin && empresa) {
    console.log('👤 Criando usuário admin (admin/admin123)...')
    const hashedPassword = await Bun.password.hash('admin123')
    await db.insert(schema.usuarios).values({
      nome: 'Administrador do Sistema',
      usuario: 'admin',
      email: 'admin@sistema.com',
      senha: hashedPassword,
      admin: 1,
      idEmpresa: empresa.id,
      passwordChangeRequired: 0,
    })
  }
  else {
    console.log('ℹ️ Usuário administrador já existe.')
  }

  console.log('✅ Seed mínimo concluído!')
}

seedMinimal().catch(console.error)
