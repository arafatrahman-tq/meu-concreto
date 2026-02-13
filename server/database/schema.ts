import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'

export const empresas = sqliteTable('empresas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  empresa: text('empresa').notNull(),
  cnpj: text('cnpj').notNull().unique(),
  ie: text('ie'),
  logo: text('logo'),
  endereco: text('endereco'),
  numero: text('numero'),
  complemento: text('complemento'),
  bairro: text('bairro'),
  cidade: text('cidade'),
  estado: text('estado'),
  cep: text('cep'),
  cidadeIbge: text('cidade_ibge'),
  telefone: text('telefone'),
  email: text('email'),
  filial: text('filial'),
  crt: integer('crt').default(1), // 1=Simples, 2=Simples-Excesso, 3=Normal
  codigoServicoMunicipal: text('codigo_servico_municipal').default('07.02'), // Padrão: Edificações e Construção Civil
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, t => ({
  empresaDeletedIdx: index('empresa_deleted_idx').on(t.id, t.deletedAt),
}))

export const empresasRelations = relations(empresas, ({ many, one }) => ({
  clientes: many(clientes),
  usuarios: many(usuarios),
  vendedores: many(vendedores),
  orcamentos: many(orcamentos),
  logs: many(logs),
  vendas: many(vendas),
  pagamentos: many(pagamentos),
  motoristas: many(motoristas),
  caminhoes: many(caminhoes),
  bombas: many(bombas),
  usuariosAcesso: many(usuariosEmpresas),
  asaas: one(configuracoesAsaas),
  sicoob: one(configuracoesSicoob),
  bling: one(configuracoesBling),
  whatsapp: one(configuracoesWhatsapp),
  pixManual: one(configuracoesPixManual),
  nuvemfiscal: one(configuracoesNuvemFiscal),
  configuracoes: many(configuracoes),
  insumos: many(insumos),
  insumosMovimentacoes: many(insumosMovimentacoes),
  tracos: many(tracos),
}))

export const clientes = sqliteTable(
  'clientes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    cpfCnpj: text('cpf_cnpj').notNull(),
    endereco: text('endereco'),
    numero: text('numero'),
    complemento: text('complemento'),
    enderecoEntrega: text('endereco_entrega'),
    bairro: text('bairro'),
    cidade: text('cidade'),
    cep: text('cep'),
    estado: text('estado'),
    cidadeIbge: text('cidade_ibge'),
    telefone: text('telefone'),
    email: text('email'),
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    unq: uniqueIndex('cliente_empresa_cpf_idx').on(t.idEmpresa, t.cpfCnpj),
    empresaIdx: index('cliente_empresa_idx').on(t.idEmpresa),
  }),
)

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [clientes.idEmpresa],
    references: [empresas.id],
  }),
  orcamentos: many(orcamentos),
}))

export const usuarios = sqliteTable('usuarios', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nome: text('nome').notNull(),
  usuario: text('usuario').notNull().unique(),
  email: text('email').notNull().unique(),
  whatsapp: text('whatsapp'),
  senha: text('senha').notNull(),
  admin: integer('admin').default(0), // 0=false, 1=true
  ativo: integer('ativo').default(1), // 0=false, 1=true
  passwordChangeRequired: integer('password_change_required').default(1), // 1=true, 0=false
  menuPermissions: text('menu_permissions').default('[]'), // JSON array de permissões de menu visíveis
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, t => ({
  empresaDeletedIdx: index('usuario_empresa_deleted_idx').on(t.idEmpresa, t.deletedAt),
}))

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [usuarios.idEmpresa],
    references: [empresas.id],
  }),
  orcamentos: many(orcamentos),
  logs: many(logs),
  acessoEmpresas: many(usuariosEmpresas),
}))

export const usuariosEmpresas = sqliteTable(
  'usuarios_empresas',
  {
    idUsuario: text('id_usuario')
      .notNull()
      .references(() => usuarios.id),
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
  },
  t => ({
    pk: primaryKey({ columns: [t.idUsuario, t.idEmpresa] }),
  }),
)

export const usuariosEmpresasRelations = relations(
  usuariosEmpresas,
  ({ one }) => ({
    usuario: one(usuarios, {
      fields: [usuariosEmpresas.idUsuario],
      references: [usuarios.id],
    }),
    empresa: one(empresas, {
      fields: [usuariosEmpresas.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const formasPagamento = sqliteTable('forma_pgto', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formaPagamento: text('forma_pagamento').notNull(),
  dias: text('dias').notNull(),
  tipoAsaas: text('tipo_asaas'), // BOLETO, PIX, CREDIT_CARD, UNDEFINED
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const formasPagamentoRelations = relations(
  formasPagamento,
  ({ many }) => ({
    orcamentos: many(orcamentos),
  }),
)

export const vendedores = sqliteTable(
  'vendedores',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    telefone: text('telefone'),
    email: text('email'),
    pin: text('pin'), // PIN único para identificação mobile (por empresa)
    ativo: integer('ativo').default(1), // 0=false, 1=true
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    unq: uniqueIndex('vendedor_empresa_pin_idx').on(t.idEmpresa, t.pin),
    empresaIdx: index('vendedor_empresa_idx').on(t.idEmpresa),
  }),
)

export const vendedoresRelations = relations(vendedores, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [vendedores.idEmpresa],
    references: [empresas.id],
  }),
  orcamentos: many(orcamentos),
}))

export const produtos = sqliteTable('produtos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  produto: text('produto').notNull(),
  valorCusto: integer('valor_custo'),
  valorVenda: integer('valor_venda'),
  fck: text('fck'),
  slump: integer('slump'),
  britaTipo: text('brita_tipo'),
  aditivo: text('aditivo'),
  unidadeMedida: text('unidade_medida').default('m³'),
  ncm: text('ncm').default('38245000'),
  cfop: text('cfop').default('5101'),
  origem: integer('origem').default(0),
  descricao: text('descricao'),
  ativo: integer('ativo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const produtosRelations = relations(produtos, ({ many, one }) => ({
  orcamentos: many(orcamentos),
  tracos: many(tracos),
}))

export const orcamentos = sqliteTable(
  'orcamentos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    idCliente: integer('id_cliente').references(() => clientes.id),
    nomeCliente: text('nome_cliente').notNull(),
    cpfCnpj: text('cpf_cnpj'),
    endereco: text('endereco'),
    numero: text('numero'),
    complemento: text('complemento'),
    enderecoEntrega: text('endereco_entrega'),
    bairro: text('bairro'),
    cidade: text('cidade'),
    cep: text('cep'),
    estado: text('estado'),
    cidadeIbge: text('cidade_ibge'),
    telefone: text('telefone'),
    email: text('email'),
    idProduto: integer('id_produto')
      .notNull()
      .references(() => produtos.id),
    produtoNome: text('produto_nome').notNull(),
    qtd: real('qtd').notNull(),
    valorUnit: integer('valor_unit').notNull(),
    total: integer('total').notNull(),
    idVendedor: integer('id_vendedor')
      .notNull()
      .references(() => vendedores.id),
    idFormaPgto: integer('id_forma_pgto')
      .notNull()
      .references(() => formasPagamento.id),
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
    idUsuario: text('id_usuario')
      .notNull()
      .references(() => usuarios.id),
    dataOrcamento: integer('data_orcamento', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    validadeOrcamento: integer('validade_orcamento', { mode: 'timestamp' }),
    dataEntrega: integer('data_entrega', { mode: 'timestamp' }),
    distanciaObra: real('distancia_obra'),
    idMotorista: integer('id_motorista').references(() => motoristas.id),
    idCaminhao: integer('id_caminhao').references(() => caminhoes.id),
    idBomba: integer('id_bomba').references(() => bombas.id),
    bombaNecessaria: integer('bomba_necessaria').default(0),
    valorBomba: integer('valor_bomba').default(0),
    valorDesconto: integer('valor_desconto').default(0),
    status: text('status').default('PENDENTE'),
    lacre: text('lacre'),
    tempoCicloTotal: integer('tempo_ciclo_total'), // em minutos
    obs: text('obs'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    empresaIdx: index('orcamento_empresa_idx').on(t.idEmpresa),
    statusIdx: index('orcamento_status_idx').on(t.status),
    clienteIdx: index('orcamento_cliente_idx').on(t.idCliente),
    empresaDeletedIdx: index('orcamento_empresa_deleted_idx').on(
      t.idEmpresa,
      t.deletedAt,
    ),
  }),
)

export const ordensServico = sqliteTable('ordens_servico', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idOrcamento: integer('id_orcamento')
    .notNull()
    .references(() => orcamentos.id),
  numeroTicket: text('numero_ticket'),
  qtd: real('qtd').notNull(),
  slump: integer('slump'),
  lacre: text('lacre'),
  idMotorista: integer('id_motorista').references(() => motoristas.id),
  idCaminhao: integer('id_caminhao').references(() => caminhoes.id),
  idBomba: integer('id_bomba').references(() => bombas.id),
  status: text('status').default('AGUARDANDO_SAIDA'),
  dataSaida: integer('data_saida', { mode: 'timestamp' }),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  obs: text('obs'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const entregaEventos = sqliteTable('entrega_eventos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idOrcamento: integer('id_orcamento')
    .notNull()
    .references(() => orcamentos.id),
  idOrdemServico: integer('id_ordem_servico').references(
    () => ordensServico.id,
  ),
  tipo: text('tipo').notNull(), // 'SAIDA_USINA', 'CHEGADA_OBRA', 'INICIO_DESCARGA', 'FIM_DESCARGA', 'RETORNO_USINA'
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  lat: text('lat'),
  lng: text('lng'),
  idUsuario: text('id_usuario').references(() => usuarios.id),
  obs: text('obs'),
})

export const orcamentosRelations = relations(orcamentos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [orcamentos.idCliente],
    references: [clientes.id],
  }),
  produto: one(produtos, {
    fields: [orcamentos.idProduto],
    references: [produtos.id],
  }),
  vendedor: one(vendedores, {
    fields: [orcamentos.idVendedor],
    references: [vendedores.id],
  }),
  formaPgto: one(formasPagamento, {
    fields: [orcamentos.idFormaPgto],
    references: [formasPagamento.id],
  }),
  empresa: one(empresas, {
    fields: [orcamentos.idEmpresa],
    references: [empresas.id],
  }),
  usuario: one(usuarios, {
    fields: [orcamentos.idUsuario],
    references: [usuarios.id],
  }),
  motorista: one(motoristas, {
    fields: [orcamentos.idMotorista],
    references: [motoristas.id],
  }),
  caminhao: one(caminhoes, {
    fields: [orcamentos.idCaminhao],
    references: [caminhoes.id],
  }),
  bomba: one(bombas, {
    fields: [orcamentos.idBomba],
    references: [bombas.id],
  }),
  vendas: many(vendas),
  itens: many(orcamentoItens),
  eventos: many(entregaEventos),
  ordensServico: many(ordensServico),
}))

export const ordensServicoRelations = relations(
  ordensServico,
  ({ one, many }) => ({
    orcamento: one(orcamentos, {
      fields: [ordensServico.idOrcamento],
      references: [orcamentos.id],
    }),
    motorista: one(motoristas, {
      fields: [ordensServico.idMotorista],
      references: [motoristas.id],
    }),
    caminhao: one(caminhoes, {
      fields: [ordensServico.idCaminhao],
      references: [caminhoes.id],
    }),
    bomba: one(bombas, {
      fields: [ordensServico.idBomba],
      references: [bombas.id],
    }),
    empresa: one(empresas, {
      fields: [ordensServico.idEmpresa],
      references: [empresas.id],
    }),
    eventos: many(entregaEventos),
  }),
)

export const entregaEventosRelations = relations(entregaEventos, ({ one }) => ({
  orcamento: one(orcamentos, {
    fields: [entregaEventos.idOrcamento],
    references: [orcamentos.id],
  }),
  ordemServico: one(ordensServico, {
    fields: [entregaEventos.idOrdemServico],
    references: [ordensServico.id],
  }),
  usuario: one(usuarios, {
    fields: [entregaEventos.idUsuario],
    references: [usuarios.id],
  }),
}))

export const orcamentoItens = sqliteTable('orcamento_itens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idOrcamento: integer('id_orcamento')
    .notNull()
    .references(() => orcamentos.id),
  idProduto: integer('id_produto')
    .notNull()
    .references(() => produtos.id),
  produtoNome: text('produto_nome').notNull(),
  qtd: real('qtd').notNull(),
  valorUnit: integer('valor_unit').notNull(),
  total: integer('total').notNull(),
})

export const orcamentoItensRelations = relations(orcamentoItens, ({ one }) => ({
  orcamento: one(orcamentos, {
    fields: [orcamentoItens.idOrcamento],
    references: [orcamentos.id],
  }),
  produto: one(produtos, {
    fields: [orcamentoItens.idProduto],
    references: [produtos.id],
  }),
}))

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  nivel: text('nivel').notNull(),
  modulo: text('modulo').notNull(),
  mensagem: text('mensagem').notNull(),
  dados: text('dados'),
  idUsuario: text('id_usuario').references(() => usuarios.id),
  idEmpresa: integer('id_empresa').references(() => empresas.id),
  ip: text('ip'),
  userAgent: text('user_agent'),
  origem: text('origem'), // WEB, API, MOBILE
})

export const logsRelations = relations(logs, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [logs.idUsuario],
    references: [usuarios.id],
  }),
  empresa: one(empresas, {
    fields: [logs.idEmpresa],
    references: [empresas.id],
  }),
}))

export const vendas = sqliteTable('vendas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idOrcamento: integer('id_orcamento')
    .notNull()
    .references(() => orcamentos.id),
  dataVenda: integer('data_venda', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  valorTotal: integer('valor_total').notNull(),
  status: text('status').default('ABERTA'),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),

  // Dados Fiscais (NFe / NFSe)
  nfeNumero: text('nfe_numero'),
  nfeSerie: text('nfe_serie'),
  nfeChave: text('nfe_chave'),
  nfeLink: text('nfe_link'),
  nfseNumero: text('nfse_numero'),
  nfseLink: text('nfse_link'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, t => ({
  empresaDeletedIdx: index('vendas_real_venda_empresa_deleted_idx').on(t.idEmpresa, t.deletedAt),
}))

export const vendasRelations = relations(vendas, ({ one, many }) => ({
  orcamento: one(orcamentos, {
    fields: [vendas.idOrcamento],
    references: [orcamentos.id],
  }),
  empresa: one(empresas, {
    fields: [vendas.idEmpresa],
    references: [empresas.id],
  }),
  pagamentos: many(pagamentos),
}))

export const pagamentos = sqliteTable(
  'pagamentos',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    idVenda: integer('id_venda')
      .notNull()
      .references(() => vendas.id),
    valor: integer('valor').notNull(),
    dataVencimento: integer('data_vencimento', { mode: 'timestamp' }).notNull(),
    dataPagamento: integer('data_pagamento', { mode: 'timestamp' }),
    status: text('status').default('PENDENTE'),
    metodo: text('metodo'),
    asaasId: text('asaas_id'),
    asaasUrl: text('asaas_url'),
    sicoobId: text('sicoob_id'),
    sicoobQrCode: text('sicoob_qrcode'),
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    empresaIdx: index('pagamento_empresa_idx').on(t.idEmpresa),
    vencimentoIdx: index('pagamento_vencimento_idx').on(t.dataVencimento),
    statusIdx: index('pagamento_status_idx').on(t.status),
    empresaDeletedIdx: index('pagamento_empresa_deleted_idx').on(
      t.idEmpresa,
      t.deletedAt,
    ),
  }),
)

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  venda: one(vendas, { fields: [pagamentos.idVenda], references: [vendas.id] }),
  empresa: one(empresas, {
    fields: [pagamentos.idEmpresa],
    references: [empresas.id],
  }),
}))

export const motoristas = sqliteTable(
  'motoristas',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nome: text('nome').notNull(),
    telefone: text('telefone'),
    cnh: text('cnh'),
    pin: text('pin'), // PIN único para motorista (por empresa)
    ativo: integer('ativo').default(1),
    idCaminhao: integer('id_caminhao').references(() => caminhoes.id),
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    unq: uniqueIndex('motorista_empresa_pin_idx').on(t.idEmpresa, t.pin),
    empresaIdx: index('motorista_empresa_idx').on(t.idEmpresa),
  }),
)

export const motoristasRelations = relations(motoristas, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [motoristas.idEmpresa],
    references: [empresas.id],
  }),
  orcamentos: many(orcamentos),
}))

export const caminhoes = sqliteTable('caminhoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  placa: text('placa').notNull().unique(),
  modelo: text('modelo'),
  capacidade: real('capacidade').notNull(), // m3
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const caminhoesRelations = relations(caminhoes, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [caminhoes.idEmpresa],
    references: [empresas.id],
  }),
  orcamentos: many(orcamentos),
}))

export const bombas = sqliteTable('bombas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  tipo: text('tipo').notNull().default('LANCA'), // LANCA, ESTACIONARIA, REBOQUE
  placa: text('placa'),
  descricao: text('descricao'),
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const bombasRelations = relations(bombas, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [bombas.idEmpresa],
    references: [empresas.id],
  }),
  orcamentos: many(orcamentos),
}))

export const fornecedores = sqliteTable('fornecedores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  contato: text('contato'),
  cnpj: text('cnpj'),
  telefone: text('telefone'),
  email: text('email'),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const fornecedoresRelations = relations(
  fornecedores,
  ({ one, many }) => ({
    empresa: one(empresas, {
      fields: [fornecedores.idEmpresa],
      references: [empresas.id],
    }),
    contasPagar: many(contasPagar),
  }),
)

export const contasPagar = sqliteTable(
  'contas_pagar',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    descricao: text('descricao').notNull(),
    valor: integer('valor').notNull(),
    dataVencimento: integer('data_vencimento', { mode: 'timestamp' }).notNull(),
    dataPagamento: integer('data_pagamento', { mode: 'timestamp' }),
    status: text('status').default('PENDENTE'), // PENDENTE, PAGO, CANCELADO, ATRASADO
    idFornecedor: integer('id_fornecedor').references(() => fornecedores.id),
    categoria: text('categoria').default('GERAL'),
    idEmpresa: integer('id_empresa')
      .notNull()
      .references(() => empresas.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(strftime('%s', 'now'))`,
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    empresaIdx: index('contapag_empresa_idx').on(t.idEmpresa),
    vencimentoIdx: index('contapag_vencimento_idx').on(t.dataVencimento),
    statusIdx: index('contapag_status_idx').on(t.status),
  }),
)

export const contasPagarRelations = relations(contasPagar, ({ one }) => ({
  fornecedor: one(fornecedores, {
    fields: [contasPagar.idFornecedor],
    references: [fornecedores.id],
  }),
  empresa: one(empresas, {
    fields: [contasPagar.idEmpresa],
    references: [empresas.id],
  }),
}))

export const configuracoesWhatsapp = sqliteTable('configuracoes_whatsapp', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  instanceUrl: text('instance_url').notNull(),
  apiKey: text('api_key').notNull(),
  notificaContasPagar: integer('notifica_contas_pagar').default(0), // 0=false, 1=true
  notificaCobrancas: integer('notifica_cobrancas').default(0), // 0=false, 1=true
  notificaNovosOrcamentos: integer('notifica_novos_orcamentos').default(0), // 0=false, 1=true
  ativo: integer('ativo').default(1), // 0=false, 1=true
  idEmpresa: integer('id_empresa')
    .notNull()
    .unique()
    .references(() => empresas.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const configuracoesWhatsappRelations = relations(
  configuracoesWhatsapp,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [configuracoesWhatsapp.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const configuracoesAsaas = sqliteTable('configuracoes_asaas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  apiKey: text('api_key').notNull(),
  environment: text('environment').notNull().default('sandbox'), // sandbox ou production
  webhookToken: text('webhook_token'),
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .unique()
    .references(() => empresas.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const configuracoesAsaasRelations = relations(
  configuracoesAsaas,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [configuracoesAsaas.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const configuracoesSicoob = sqliteTable('configuracoes_sicoob', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: text('client_id').notNull(),
  clientSecret: text('client_secret'), // Alguns fluxos podem não usar
  certificate: text('certificate'), // Conteúdo do certificado .pem
  privateKey: text('private_key'), // Conteúdo da chave .key
  environment: text('environment').notNull().default('sandbox'), // sandbox ou production
  chavePix: text('chave_pix'),
  contaCorrente: text('conta_corrente'),
  cooperativa: text('cooperativa'),
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .unique()
    .references(() => empresas.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const configuracoesSicoobRelations = relations(
  configuracoesSicoob,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [configuracoesSicoob.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const configuracoesBling = sqliteTable('configuracoes_bling', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  apiKey: text('api_key').notNull(),
  clientId: text('client_id'),
  clientSecret: text('client_secret'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }),
  idDeposito: text('id_deposito'), // Depósito padrão para estoque
  idCategoria: text('id_categoria'), // Categoria padrão
  naturezaOperacao: text('natureza_operacao'), // Natureza de operação padrão
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .unique()
    .references(() => empresas.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const configuracoesBlingRelations = relations(
  configuracoesBling,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [configuracoesBling.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const configuracoesPixManual = sqliteTable('configuracoes_pix_manual', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chavePix: text('chave_pix').notNull(),
  beneficiario: text('beneficiario').notNull(),
  cidade: text('cidade').notNull(),
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .unique()
    .references(() => empresas.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export const configuracoesPixManualRelations = relations(
  configuracoesPixManual,
  ({ many, one }) => ({
    empresa: one(empresas, {
      fields: [configuracoesPixManual.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const configuracoesNuvemFiscal = sqliteTable(
  'configuracoes_nuvem_fiscal',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clientId: text('client_id').notNull(),
    clientSecret: text('client_secret').notNull(),
    certificado: text('certificado'), // Base64 do certificado PFX/P12
    certificadoSenha: text('certificado_senha'),
    nfseSerie: text('nfse_serie'),
    nfseLote: integer('nfse_lote'),
    nfseProximoNumero: integer('nfse_proximo_numero'),
    environment: text('environment').notNull().default('sandbox'), // sandbox ou production
    ativo: integer('ativo').default(1),
    idEmpresa: integer('id_empresa')
      .notNull()
      .unique()
      .references(() => empresas.id),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
  },
)

export const configuracoesNuvemFiscalRelations = relations(
  configuracoesNuvemFiscal,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [configuracoesNuvemFiscal.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const configuracoes = sqliteTable(
  'configuracoes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chave: text('chave').notNull(),
    valor: text('valor').notNull(), // Armazena JSON string
    descricao: text('descricao'),
    categoria: text('categoria').default('GERAL'), // ex: FEATURE_FLAG, NEGOCIO, UI
    idEmpresa: integer('id_empresa')
      .references(() => empresas.id),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
  },
  t => ({
    unq: uniqueIndex('config_empresa_chave_idx').on(t.idEmpresa, t.chave),
  }),
)

export const configuracoesRelations = relations(configuracoes, ({ one }) => ({
  empresa: one(empresas, {
    fields: [configuracoes.idEmpresa],
    references: [empresas.id],
  }),
}))

export const insumos = sqliteTable('insumos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  unidadeMedida: text('unidade_medida').notNull(), // kg, m3, un, etc.
  estoqueAtual: real('estoque_atual').default(0),
  estoqueMinimo: real('estoque_minimo').default(0),
  custoUnitario: integer('custo_unitario'), // em centavos
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const insumosMovimentacoes = sqliteTable('insumos_movimentacoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idInsumo: integer('id_insumo')
    .notNull()
    .references(() => insumos.id),
  tipo: text('tipo').notNull(), // 'ENTRADA', 'SAIDA_TEORICA', 'SAIDA_REAL', 'AJUSTE'
  quantidade: real('quantidade').notNull(),
  origem: text('origem'), // 'VENDA', 'MANUAL', 'COMPRA'
  idReferencia: text('id_referencia'), // ID da Venda ou Pedido
  idUsuario: text('id_usuario')
    .notNull()
    .references(() => usuarios.id),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  observacao: text('observacao'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
})

export const insumosRelations = relations(insumos, ({ one, many }) => ({
  empresa: one(empresas, {
    fields: [insumos.idEmpresa],
    references: [empresas.id],
  }),
  tracoItens: many(tracoItens),
  movimentacoes: many(insumosMovimentacoes),
}))

export const insumosMovimentacoesRelations = relations(
  insumosMovimentacoes,
  ({ one }) => ({
    insumo: one(insumos, {
      fields: [insumosMovimentacoes.idInsumo],
      references: [insumos.id],
    }),
    usuario: one(usuarios, {
      fields: [insumosMovimentacoes.idUsuario],
      references: [usuarios.id],
    }),
    empresa: one(empresas, {
      fields: [insumosMovimentacoes.idEmpresa],
      references: [empresas.id],
    }),
  }),
)

export const tracos = sqliteTable('tracos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idProduto: integer('id_produto')
    .notNull()
    .references(() => produtos.id),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  ativo: integer('ativo').default(1),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

export const tracosRelations = relations(tracos, ({ one, many }) => ({
  produto: one(produtos, {
    fields: [tracos.idProduto],
    references: [produtos.id],
  }),
  empresa: one(empresas, {
    fields: [tracos.idEmpresa],
    references: [empresas.id],
  }),
  itens: many(tracoItens),
}))

export const tracoItens = sqliteTable('traco_itens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idTraco: integer('id_traco')
    .notNull()
    .references(() => tracos.id),
  idInsumo: integer('id_insumo')
    .notNull()
    .references(() => insumos.id),
  quantidade: real('quantidade').notNull(), // Qtd do insumo por unidade do produto
})

export const tracoItensRelations = relations(tracoItens, ({ one }) => ({
  traco: one(tracos, {
    fields: [tracoItens.idTraco],
    references: [tracos.id],
  }),
  insumo: one(insumos, {
    fields: [tracoItens.idInsumo],
    references: [insumos.id],
  }),
}))

// ============================================================================
// AUDITORIA DE PERMISSÕES DE MENU
// ============================================================================

export const permissoesMenuAuditoria = sqliteTable('permissoes_menu_auditoria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  idUsuario: text('id_usuario')
    .notNull()
    .references(() => usuarios.id),
  idUsuarioAlteradoPor: text('id_usuario_alterado_por')
    .notNull()
    .references(() => usuarios.id),
  idEmpresa: integer('id_empresa')
    .notNull()
    .references(() => empresas.id),
  permissoesAntes: text('permissoes_antes').notNull(), // JSON array
  permissoesDepois: text('permissoes_depois').notNull(), // JSON array
  tipoAlteracao: text('tipo_alteracao').notNull(), // 'CREATE', 'UPDATE', 'RESET'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
}, t => ({
  usuarioIdx: index('perm_menu_aud_usuario_idx').on(t.idUsuario),
  empresaIdx: index('perm_menu_aud_empresa_idx').on(t.idEmpresa),
  createdAtIdx: index('perm_menu_aud_created_idx').on(t.createdAt),
}))

export const permissoesMenuAuditoriaRelations = relations(
  permissoesMenuAuditoria,
  ({ one }) => ({
    usuario: one(usuarios, {
      fields: [permissoesMenuAuditoria.idUsuario],
      references: [usuarios.id],
    }),
    alteradoPor: one(usuarios, {
      fields: [permissoesMenuAuditoria.idUsuarioAlteradoPor],
      references: [usuarios.id],
    }),
    empresa: one(empresas, {
      fields: [permissoesMenuAuditoria.idEmpresa],
      references: [empresas.id],
    }),
  }),
)
