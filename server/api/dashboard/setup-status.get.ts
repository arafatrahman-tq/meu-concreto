import { db } from '../../database/db'
import {
  empresas,
  vendedores,
  motoristas,
  caminhoes,
  bombas,
  formasPagamento,
  produtos,
  insumos,
  tracos,
  configuracoesAsaas,
  configuracoesNuvemFiscal,
  configuracoesWhatsapp,
  usuarios,
} from '../../database/schema'
import { eq, sql, isNull, and, count } from 'drizzle-orm'
import { getAuthenticatedUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const authUser = getAuthenticatedUser(event)
  if (!authUser) {
    throw createError({
      statusCode: 401,
      message: 'Não autorizado',
    })
  }

  const query = getQuery(event)
  let idEmpresa = authUser.idEmpresa

  // Se for admin, permite consultar outra empresa do grupo
  if (authUser.admin === 1 && query.idEmpresa) {
    idEmpresa = Number(query.idEmpresa)
  }

  // 1. Dados da Empresa
  const empresa = await db.query.empresas.findFirst({
    where: eq(empresas.id, idEmpresa),
  })

  const setupEmpresa = {
    title: 'Dados da Empresa',
    description: 'Informações básicas e fiscais da unidade',
    status: empresa?.cnpj && empresa?.cidade ? 'completed' : 'pending',
    path: '/configuracoes/empresa',
  }

  // 2. Equipe (Vendedores e Motoristas)
  const countVendedores = await db
    .select({ count: count() })
    .from(vendedores)
    .where(
      and(eq(vendedores.idEmpresa, idEmpresa), isNull(vendedores.deletedAt)),
    )

  const countMotoristas = await db
    .select({ count: count() })
    .from(motoristas)
    .where(
      and(eq(motoristas.idEmpresa, idEmpresa), isNull(motoristas.deletedAt)),
    )

  const setupEquipe = {
    title: 'Equipe Operacional',
    description: 'Cadastre seus vendedores e motoristas',
    status:
      (countVendedores[0]?.count || 0) > 0
      && (countMotoristas[0]?.count || 0) > 0
        ? 'completed'
        : 'pending',
    stats: `${countVendedores[0]?.count || 0} vend, ${countMotoristas[0]?.count || 0} mot`,
    path: '/vendedores',
  }

  // 3. Frota (Caminhões e Bombas)
  const countCaminhoes = await db
    .select({ count: count() })
    .from(caminhoes)
    .where(
      and(eq(caminhoes.idEmpresa, idEmpresa), isNull(caminhoes.deletedAt)),
    )

  const countBombas = await db
    .select({ count: count() })
    .from(bombas)
    .where(and(eq(bombas.idEmpresa, idEmpresa), isNull(bombas.deletedAt)))

  const setupFrota = {
    title: 'Frota de Veículos',
    description: 'Caminhões betoneira e bombas',
    status: (countCaminhoes[0]?.count || 0) > 0 ? 'completed' : 'pending',
    stats: `${countCaminhoes[0]?.count || 0} cam, ${countBombas[0]?.count || 0} bom`,
    path: '/caminhoes',
  }

  // 4. Insumos e Traços
  const countInsumos = await db
    .select({ count: count() })
    .from(insumos)
    .where(and(eq(insumos.idEmpresa, idEmpresa), isNull(insumos.deletedAt)))

  const countTracos = await db
    .select({ count: count() })
    .from(tracos)
    .where(and(eq(tracos.idEmpresa, idEmpresa), isNull(tracos.deletedAt)))

  const setupOperacional = {
    title: 'Materiais e Traços',
    description: 'Insumos e receitas de concreto',
    status:
      (countInsumos[0]?.count || 0) > 0 && (countTracos[0]?.count || 0) > 0
        ? 'completed'
        : 'pending',
    stats: `${countInsumos[0]?.count || 0} ins, ${countTracos[0]?.count || 0} traç`,
    path: '/insumos',
  }

  // 5. Comercial (Produtos e Formas de Pagamento)
  const countProdutos = await db
    .select({ count: count() })
    .from(produtos)
    .where(isNull(produtos.deletedAt)) // Produtos são globais ou por empresa? No schema não tem idEmpresa em produtos

  const countFormas = await db
    .select({ count: count() })
    .from(formasPagamento)
    .where(isNull(formasPagamento.deletedAt))

  const setupComercial = {
    title: 'Catálogo e Preços',
    description: 'Tabela de preços e formas de pagamento',
    status:
      (countProdutos[0]?.count || 0) > 0 && (countFormas[0]?.count || 0) > 0
        ? 'completed'
        : 'pending',
    stats: `${countProdutos[0]?.count || 0} prod, ${countFormas[0]?.count || 0} pgto`,
    path: '/produtos',
  }

  // 6. Integrações
  const asaas = await db.query.configuracoesAsaas.findFirst({
    where: eq(configuracoesAsaas.idEmpresa, idEmpresa),
  })
  const nf = await db.query.configuracoesNuvemFiscal.findFirst({
    where: eq(configuracoesNuvemFiscal.idEmpresa, idEmpresa),
  })
  const wpp = await db.query.configuracoesWhatsapp.findFirst({
    where: eq(configuracoesWhatsapp.idEmpresa, idEmpresa),
  })

  const setupIntegracoes = {
    title: 'Integrações Fiscais/Financeiras',
    description: 'Configuração de Notas, Pagamentos e WhatsApp',
    status:
      asaas?.apiKey || nf?.clientId || wpp?.apiKey ? 'completed' : 'pending',
    path: '/configuracoes/asaas',
  }

  const steps = [
    setupEmpresa,
    setupComercial,
    setupEquipe,
    setupFrota,
    setupOperacional,
    setupIntegracoes,
  ]

  const completed = steps.filter(s => s.status === 'completed').length
  const total = steps.length
  const percentage = Math.round((completed / total) * 100)

  return {
    percentage,
    completed,
    total,
    steps,
    isFullyConfigured: percentage === 100,
  }
})
