import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'
import { eq, and } from 'drizzle-orm'

async function seed() {
  const sqlite = new Database(process.env.DB_FILE_NAME || 'mydb.sqlite')
  const db = drizzle(sqlite, { schema })

  console.log('🌱 Iniciando Seed - Meu Concreto (Realidade Operacional)...')

  // Limpeza Opcional (CUIDADO EM PRODUÇÃO)
  // console.log("🧹 Limpando dados antigos...");
  // await db.delete(schema.usuariosEmpresas);
  // await db.delete(schema.usuarios);
  // ...

  // 1. Empresa Matriz
  console.log('🏢 Criando Empresas...')

  // Tentar encontrar empresa existente pelo CNPJ para evitar erro UNIQUE
  const existingEmpresa = await db.query.empresas.findFirst({
    where: eq(schema.empresas.cnpj, '12345678000190'),
  })

  let empresaMatriz

  if (existingEmpresa) {
    console.log('ℹ️ Empresa já existe, atualizando...')
    const updated = await db
      .update(schema.empresas)
      .set({
        empresa: 'Concreto Capital Matriz',
        ie: '111222333444',
        endereco: 'Av. Industrial, 1500',
        bairro: 'Distrito Industrial',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000000',
        telefone: '1140041000',
        email: 'matriz@concretocapital.com.br',
        crt: 3,
        codigoServicoMunicipal: '07.02',
      })
      .where(eq(schema.empresas.id, existingEmpresa.id))
      .returning()
    empresaMatriz = updated[0]
  }
  else {
    const empresasResult = await db
      .insert(schema.empresas)
      .values({
        empresa: 'Concreto Capital Matriz',
        cnpj: '12345678000190',
        ie: '111222333444',
        endereco: 'Av. Industrial, 1500',
        bairro: 'Distrito Industrial',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000000',
        telefone: '1140041000',
        email: 'matriz@concretocapital.com.br',
        crt: 3,
        codigoServicoMunicipal: '07.02',
      })
      .returning()
    empresaMatriz = empresasResult[0]
  }

  if (!empresaMatriz) throw new Error('Falha ao gerenciar empresa matriz')

  // 2. Usuários
  console.log('👤 Criando Usuários...')
  const hashedAdminPassword = await Bun.password.hash('Admin123')

  const existingAdmin = await db.query.usuarios.findFirst({
    where: eq(schema.usuarios.usuario, 'admin'),
  })

  if (!existingAdmin) {
    await db.insert(schema.usuarios).values([
      {
        nome: 'Mauro Administrador',
        usuario: 'admin',
        email: 'admin@concretocapital.com.br',
        senha: hashedAdminPassword,
        admin: 1,
        idEmpresa: empresaMatriz.id,
        passwordChangeRequired: 0,
      },
    ])
  }

  // 3. Vendedores
  console.log('💼 Criando Vendedores...')
  const existingVendedor = await db.query.vendedores.findFirst({
    where: and(
      eq(schema.vendedores.idEmpresa, empresaMatriz.id),
      eq(schema.vendedores.nome, 'Ricardo Sales'),
    ),
  })

  let vendedor1
  if (!existingVendedor) {
    const vendedoresResult = await db
      .insert(schema.vendedores)
      .values([
        {
          nome: 'Ricardo Sales',
          email: 'ricardo@concretocapital.com.br',
          telefone: '11988887777',
          pin: '1234',
          idEmpresa: empresaMatriz.id,
        },
      ])
      .returning()
    vendedor1 = vendedoresResult[0]
  }
  else {
    vendedor1 = existingVendedor
  }

  if (!vendedor1) throw new Error('Falha ao gerenciar vendedor')

  // 4. Formas de Pagamento
  console.log('💳 Criando Formas de Pagamento...')
  for (const fp of [
    { formaPagamento: 'PIX Antecipado', dias: '0', tipoAsaas: 'PIX' },
    { formaPagamento: 'Boleto 28 Dias', dias: '28', tipoAsaas: 'BOLETO' },
    {
      formaPagamento: 'Cartão de Crédito 1x',
      dias: '30',
      tipoAsaas: 'CREDIT_CARD',
    },
  ]) {
    const existing = await db.query.formasPagamento.findFirst({
      where: eq(schema.formasPagamento.formaPagamento, fp.formaPagamento),
    })
    if (!existing) await db.insert(schema.formasPagamento).values(fp)
  }

  // 5. Insumos (Estoque Base)
  console.log('🏗️ Criando Insumos...')
  const insumosData = [
    {
      nome: 'Cimento CP II-E-32 (Saco 50kg)',
      unidadeMedida: 'kg',
      estoqueAtual: 50000,
      estoqueMinimo: 10000,
      custoUnitario: 80,
      idEmpresa: empresaMatriz.id,
    },
    {
      nome: 'Areia Média Lavada',
      unidadeMedida: 'kg',
      estoqueAtual: 200000,
      estoqueMinimo: 50000,
      custoUnitario: 12,
      idEmpresa: empresaMatriz.id,
    },
    {
      nome: 'Brita 1 (Granito)',
      unidadeMedida: 'kg',
      estoqueAtual: 150000,
      estoqueMinimo: 30000,
      custoUnitario: 15,
      idEmpresa: empresaMatriz.id,
    },
    {
      nome: 'Brita 0 (Pedrisco)',
      unidadeMedida: 'kg',
      estoqueAtual: 100000,
      estoqueMinimo: 20000,
      custoUnitario: 15,
      idEmpresa: empresaMatriz.id,
    },
    {
      nome: 'Aditivo Polifuncional',
      unidadeMedida: 'L',
      estoqueAtual: 1000,
      estoqueMinimo: 200,
      custoUnitario: 1500,
      idEmpresa: empresaMatriz.id,
    },
    {
      nome: 'Água Tronco',
      unidadeMedida: 'L',
      estoqueAtual: 1000000,
      estoqueMinimo: 50000,
      custoUnitario: 1,
      idEmpresa: empresaMatriz.id,
    },
  ]

  const insumosMap: any = {}
  for (const item of insumosData) {
    const existing = await db.query.insumos.findFirst({
      where: and(
        eq(schema.insumos.idEmpresa, empresaMatriz.id),
        eq(schema.insumos.nome, item.nome),
      ),
    })
    if (existing) {
      insumosMap[item.nome] = existing
    }
    else {
      const inserted = await db.insert(schema.insumos).values(item).returning()
      insumosMap[item.nome] = inserted[0]
    }
  }

  const cimento = insumosMap['Cimento CP II-E-32 (Saco 50kg)']
  const areia = insumosMap['Areia Média Lavada']
  const brita1 = insumosMap['Brita 1 (Granito)']
  const brita0 = insumosMap['Brita 0 (Pedrisco)']
  const aditivo = insumosMap['Aditivo Polifuncional']
  const agua = insumosMap['Água Tronco']

  // 6. Produtos (Concreto p/ Venda)
  console.log('🧪 Criando Produtos...')
  const produtosData = [
    {
      produto: 'Concreto FCK 20 - Bombeável',
      fck: '20',
      slump: 12,
      valorVenda: 38000,
      ativo: 1,
    },
    {
      produto: 'Concreto FCK 25 - Bombeável',
      fck: '25',
      slump: 12,
      valorVenda: 41000,
      ativo: 1,
    },
    {
      produto: 'Concreto FCK 30 - Bombeável',
      fck: '30',
      slump: 12,
      valorVenda: 45000,
      ativo: 1,
    },
  ]

  const produtosMap: any = {}
  for (const item of produtosData) {
    const existing = await db.query.produtos.findFirst({
      where: eq(schema.produtos.produto, item.produto),
    })
    if (existing) {
      produtosMap[item.produto] = existing
    }
    else {
      const inserted = await db
        .insert(schema.produtos)
        .values(item)
        .returning()
      produtosMap[item.produto] = inserted[0]
    }
  }

  const fck25 = produtosMap['Concreto FCK 25 - Bombeável']

  // 7. Configuração de Traços (Consumo por m3)
  const existingTraco = await db.query.tracos.findFirst({
    where: and(
      eq(schema.tracos.idEmpresa, empresaMatriz.id),
      eq(schema.tracos.nome, 'Padrão Brita 0/1 - FCK 25'),
    ),
  })

  let traco25
  if (!existingTraco) {
    const tracosResult = await db
      .insert(schema.tracos)
      .values([
        {
          idProduto: fck25.id,
          nome: 'Padrão Brita 0/1 - FCK 25',
          idEmpresa: empresaMatriz.id,
          ativo: 1,
        },
      ])
      .returning()
    const traco25 = tracosResult[0]
    if (!traco25) throw new Error('Falha ao criar traço')

    await db.insert(schema.tracoItens).values([
      { idTraco: traco25.id, idInsumo: cimento.id, quantidade: 310 },
      { idTraco: traco25.id, idInsumo: areia.id, quantidade: 860 },
      { idTraco: traco25.id, idInsumo: brita0.id, quantidade: 420 },
      { idTraco: traco25.id, idInsumo: brita1.id, quantidade: 580 },
      { idTraco: traco25.id, idInsumo: aditivo.id, quantidade: 1.8 },
      { idTraco: traco25.id, idInsumo: agua.id, quantidade: 165 },
    ])
  }
  else {
    traco25 = existingTraco
  }

  // 8. Logística (Frota e Equipe)
  console.log('🚛 Criando Logística...')
  const caminhoesData = [
    {
      placa: 'CON-1020',
      modelo: 'VW Constellation 24.280 - Mixer 8m3',
      capacidade: 8,
      idEmpresa: empresaMatriz.id,
    },
    {
      placa: 'CON-2030',
      modelo: 'Mercedes-Benz Atego - Mixer 8m3',
      capacidade: 8,
      idEmpresa: empresaMatriz.id,
    },
  ]

  const caminhoesMap: any = {}
  for (const item of caminhoesData) {
    const existing = await db.query.caminhoes.findFirst({
      where: eq(schema.caminhoes.placa, item.placa),
    })
    if (existing) {
      caminhoesMap[item.placa] = existing
    }
    else {
      const inserted = await db
        .insert(schema.caminhoes)
        .values(item)
        .returning()
      caminhoesMap[item.placa] = inserted[0]
    }
  }

  const caminhao1 = caminhoesMap['CON-1020']

  const existingMotorista = await db.query.motoristas.findFirst({
    where: and(
      eq(schema.motoristas.idEmpresa, empresaMatriz.id),
      eq(schema.motoristas.nome, 'Jorge Oliveira'),
    ),
  })

  if (!existingMotorista) {
    await db
      .insert(schema.motoristas)
      .values([
        {
          nome: 'Jorge Oliveira',
          cnh: '123456789',
          telefone: '11977776666',
          idCaminhao: caminhao1.id,
          idEmpresa: empresaMatriz.id,
          pin: '4444',
        },
      ])
  }

  const existingBomba = await db.query.bombas.findFirst({
    where: and(
      eq(schema.bombas.idEmpresa, empresaMatriz.id),
      eq(schema.bombas.nome, 'Bomba Lança 32m'),
    ),
  })

  if (!existingBomba) {
    await db
      .insert(schema.bombas)
      .values([
        {
          nome: 'Bomba Lança 32m',
          tipo: 'LANCA',
          placa: 'PMP-1020',
          descricao: 'Putztmeister M32',
          idEmpresa: empresaMatriz.id,
        },
      ])
  }

  // 9. Clientes Exemplo
  console.log('👥 Criando Clientes...')
  for (const cliente of [
    {
      nome: 'Construtora Horizonte LTDA',
      cpfCnpj: '00111222000133',
      endereco: 'Rua das Obras, 500',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      idEmpresa: empresaMatriz.id,
    },
    {
      nome: 'Marcos Engenharia EIRELI',
      cpfCnpj: '44555666000177',
      idEmpresa: empresaMatriz.id,
    },
  ]) {
    const existing = await db.query.clientes.findFirst({
      where: and(
        eq(schema.clientes.idEmpresa, empresaMatriz.id),
        eq(schema.clientes.cpfCnpj, cliente.cpfCnpj),
      ),
    })
    if (!existing) await db.insert(schema.clientes).values(cliente)
  }

  const cliente1 = await db.query.clientes.findFirst({
    where: and(
      eq(schema.clientes.idEmpresa, empresaMatriz.id),
      eq(schema.clientes.cpfCnpj, '00111222000133'),
    ),
  })

  // 10. Orçamentos e Vendas (Status Operacional)
  console.log('📝 Criando Orçamentos e Vendas...')
  if (cliente1) {
    const existingOrcamento = await db.query.orcamentos.findFirst({
      where: and(
        eq(schema.orcamentos.idCliente, cliente1.id),
        eq(schema.orcamentos.nomeCliente, cliente1.nome),
      ),
    })

    if (!existingOrcamento) {
      const formaPgtoPix = await db.query.formasPagamento.findFirst({
        where: eq(schema.formasPagamento.formaPagamento, 'PIX Antecipado'),
      })

      // Orçamento 1: Em aberto (Pendente)
      await db.insert(schema.orcamentos).values({
        idCliente: cliente1.id,
        nomeCliente: cliente1.nome,
        idProduto: fck25.id,
        produtoNome: fck25.produto,
        qtd: 12,
        valorUnit: 38000,
        total: 12 * 38000,
        idVendedor: vendedor1.id,
        idFormaPgto: formaPgtoPix?.id || 1,
        idEmpresa: empresaMatriz.id,
        idUsuario: existingAdmin?.id || 'admin',
        status: 'PENDENTE',
        bairro: 'Centro',
        cidade: 'São Paulo',
      })

      // Orçamento 2: Concluído (Venda + OS + Pagamento)
      const resultOrc2 = await db
        .insert(schema.orcamentos)
        .values({
          idCliente: cliente1.id,
          nomeCliente: cliente1.nome,
          idProduto: fck25.id,
          produtoNome: fck25.produto,
          qtd: 16, // 2 viagens de 8m3
          valorUnit: 38000,
          total: 16 * 38000,
          idVendedor: vendedor1.id,
          idFormaPgto: formaPgtoPix?.id || 1,
          idEmpresa: empresaMatriz.id,
          idUsuario: existingAdmin?.id || 'admin',
          status: 'CONCLUIDO',
          bairro: 'Centro',
          cidade: 'São Paulo',
        })
        .returning()

      const orc2 = resultOrc2[0]
      if (orc2) {
        // Criar a Venda
        const resultVenda = await db
          .insert(schema.vendas)
          .values({
            idOrcamento: orc2.id,
            valorTotal: orc2.total,
            status: 'PAGA',
            idEmpresa: empresaMatriz.id,
          })
          .returning()

        const venda = resultVenda[0]
        if (venda) {
          // Criar Pagamento
          await db.insert(schema.pagamentos).values({
            idVenda: venda.id,
            valor: venda.valorTotal,
            dataVencimento: new Date(),
            dataPagamento: new Date(),
            status: 'PAGO',
            metodo: 'PIX',
            idEmpresa: empresaMatriz.id,
          })
        }

        // Criar Ordens de Serviço (As 2 viagens)
        const motorista1 = await db.query.motoristas.findFirst({
          where: eq(schema.motoristas.nome, 'Jorge Oliveira'),
        })
        const bomba1 = await db.query.bombas.findFirst({
          where: eq(schema.bombas.nome, 'Bomba Lança 32m'),
        })

        await db.insert(schema.ordensServico).values([
          {
            idOrcamento: orc2.id,
            numeroTicket: 'TK-1001',
            qtd: 8,
            status: 'CONCLUIDA',
            idMotorista: motorista1?.id,
            idCaminhao: caminhao1.id,
            idBomba: bomba1?.id,
            idEmpresa: empresaMatriz.id,
            dataSaida: new Date(),
          },
          {
            idOrcamento: orc2.id,
            numeroTicket: 'TK-1002',
            qtd: 8,
            status: 'CONCLUIDA',
            idMotorista: motorista1?.id,
            idCaminhao: caminhao1.id,
            idBomba: bomba1?.id,
            idEmpresa: empresaMatriz.id,
            dataSaida: new Date(),
          },
        ])
      }
    }
  }

  console.log('✨ Seed Finalizado com Sucesso!')
  console.log('💡 Acesse com usuário \'admin\' e senha \'Admin123\'')
}

seed().catch(console.error)
