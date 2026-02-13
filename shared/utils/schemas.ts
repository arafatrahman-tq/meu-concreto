/**
 * Schemas Zod Compartilhados
 *
 * Este arquivo contém schemas de validação que são usados tanto no frontend
 * quanto no backend, garantindo consistência de dados em toda a aplicação.
 *
 * Regras:
 * - Valores monetários: sempre em centavos (integer) no backend
 * - Datas: ISO string no frontend, Date object no backend
 * - Campos opcionais: usar .optional().nullable() para campos não obrigatórios
 */

import { z } from 'zod'

// ==========================================
// Helpers de Validação
// ==========================================

/**
 * Validação de CPF
 */
export function validarCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
  const cpfs = cpf.split('').map(el => +el)
  const rest = (count: number) =>
    ((cpfs.slice(0, count - 12).reduce((s, el, i) => s + el * (count - i), 0)
      * 10)
    % 11)
  % 10
  return rest(10) === cpfs[9] && rest(11) === cpfs[10]
}

/**
 * Validação de CNPJ
 */
export function validarCnpj(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false
  const size = cnpj.length - 2
  const numbers = cnpj.substring(0, size)
  const digits = cnpj.substring(size)
  let length = size
  let sum = 0
  let pos = length - 7
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  length = length + 1
  const numbers2 = cnpj.substring(0, length)
  sum = 0
  pos = length - 7
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers2.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  return true
}

// ==========================================
// Schemas Base
// ==========================================

/**
 * Schema para valores monetários (centavos)
 * Usado em ambos frontend e backend
 */
export const valorMonetarioSchema = z.number().int().min(0, 'Valor não pode ser negativo')

/**
 * Schema para CPF/CNPJ
 */
export const cpfCnpjSchema = z.string().refine(
  (val) => {
    const clean = val.replace(/[^\d]+/g, '')
    if (clean.length === 11) return validarCpf(clean)
    if (clean.length === 14) return validarCnpj(clean)
    return false
  },
  { message: 'CPF ou CNPJ inválido' },
)

/**
 * Schema para telefone brasileiro
 */
export const telefoneSchema = z.string().regex(
  /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}-?[0-9]{4}$/,
  'Telefone inválido',
)

/**
 * Schema para email
 */
export const emailSchema = z.string().email('Email inválido')

/**
 * Schema para CEP
 */
export const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')

/**
 * Schema para PIN de 4 dígitos
 */
export const pinSchema = z.string()
  .length(4, 'O PIN deve ter 4 dígitos')
  .regex(/^\d+$/, 'Apenas números são permitidos')

/**
 * Schema para placa de veículo (Mercosul ou antiga)
 */
export const placaSchema = z.string()
  .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/i, 'Placa inválida')

// ==========================================
// Schemas de Entidades
// ==========================================

/**
 * Cliente - Schema compartilhado
 */
export const clienteSharedSchema = z.object({
  id: z.number().int().optional(),
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  cpfCnpj: cpfCnpjSchema,
  endereco: z.string().optional().nullable(),
  enderecoEntrega: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  cep: cepSchema.optional().nullable().or(z.literal('')),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: emailSchema.optional().nullable().or(z.literal('')),
  cidadeIbge: z.string().optional().nullable(),
})

/**
 * Produto/Traço - Schema compartilhado
 */
export const produtoSharedSchema = z.object({
  id: z.number().int().optional(),
  produto: z.string().min(2, 'O nome do produto deve ter pelo menos 2 caracteres'),
  valorCusto: valorMonetarioSchema.optional().nullable(),
  valorVenda: valorMonetarioSchema.optional().nullable(),
  fck: z.string().optional().nullable(),
  slump: z.number().int().min(0).optional().nullable(),
  britaTipo: z.string().optional().nullable(),
  aditivo: z.string().optional().nullable(),
  unidadeMedida: z.string().default('m³'),
  ncm: z.string().default('38245000'),
  cfop: z.string().default('5101'),
  origem: z.number().default(0),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
})

/**
 * Item de Orçamento - Schema compartilhado
 */
export const orcamentoItemSharedSchema = z.object({
  id: z.number().int().optional(),
  idProduto: z.number().int().positive(),
  produtoNome: z.string().min(2),
  qtd: z.number().positive('Quantidade deve ser positiva'),
  valorUnit: valorMonetarioSchema,
  total: valorMonetarioSchema,
})

/**
 * Orçamento - Schema compartilhado
 */
export const orcamentoSharedSchema = z.object({
  id: z.number().int().optional(),
  idCliente: z.number().int().optional().nullable(),
  nomeCliente: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  cpfCnpj: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  enderecoEntrega: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  idProduto: z.number().int().positive().optional(), // Legacy field
  produtoNome: z.string().min(2).optional(), // Legacy field
  qtd: z.number().positive().optional(), // Legacy field
  valorUnit: valorMonetarioSchema.optional(), // Legacy field
  total: valorMonetarioSchema,
  itens: z.array(orcamentoItemSharedSchema).optional(),
  idVendedor: z.number().int().positive(),
  idFormaPgto: z.number().int().positive(),
  validadeOrcamento: z.union([z.date(), z.string()]).optional().nullable(),
  dataEntrega: z.union([z.date(), z.string()]).optional().nullable(),
  distanciaObra: z.number().min(0).optional().nullable(),
  idMotorista: z.number().int().optional().nullable(),
  idCaminhao: z.number().int().optional().nullable(),
  idBomba: z.number().int().optional().nullable(),
  bombaNecessaria: z.boolean().default(false),
  valorBomba: valorMonetarioSchema.default(0),
  valorDesconto: valorMonetarioSchema.default(0),
  status: z.enum(['PENDENTE', 'APROVADO', 'CANCELADO', 'VENCIDO', 'CONCLUIDO']).default('PENDENTE'),
  lacre: z.string().optional().nullable(),
  obs: z.string().optional().nullable(),
})

/**
 * Venda - Schema compartilhado
 */
export const vendaSharedSchema = z.object({
  id: z.number().int().optional(),
  idOrcamento: z.number().int().positive(),
  dataVenda: z.union([z.date(), z.string()]).optional(),
  valorTotal: valorMonetarioSchema,
  status: z.enum(['ABERTA', 'PAGA', 'CANCELADA', 'NF_EMITIDA']).default('ABERTA'),
  // Dados fiscais
  nfeNumero: z.string().optional().nullable(),
  nfeSerie: z.string().optional().nullable(),
  nfeChave: z.string().optional().nullable(),
  nfeLink: z.string().optional().nullable(),
  nfseNumero: z.string().optional().nullable(),
  nfseLink: z.string().optional().nullable(),
})

/**
 * Pagamento - Schema compartilhado
 */
export const pagamentoSharedSchema = z.object({
  id: z.number().int().optional(),
  idVenda: z.number().int().positive(),
  valor: valorMonetarioSchema,
  dataVencimento: z.union([z.date(), z.string()]),
  dataPagamento: z.union([z.date(), z.string()]).optional().nullable(),
  status: z.enum(['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO']).default('PENDENTE'),
  metodo: z.string().optional().nullable(),
  asaasId: z.string().optional().nullable(),
  asaasUrl: z.string().optional().nullable(),
  sicoobId: z.string().optional().nullable(),
  sicoobQrCode: z.string().optional().nullable(),
})

/**
 * Motorista - Schema compartilhado
 */
export const motoristaSharedSchema = z.object({
  id: z.number().int().optional(),
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().optional().nullable(),
  cnh: z.string().optional().nullable(),
  pin: pinSchema.optional().nullable(),
  ativo: z.boolean().default(true),
  idCaminhao: z.number().int().optional().nullable(),
})

/**
 * Caminhão - Schema compartilhado
 */
export const caminhaoSharedSchema = z.object({
  id: z.number().int().optional(),
  placa: placaSchema,
  modelo: z.string().optional().nullable(),
  capacidade: z.number().positive('Capacidade deve ser positiva'),
  ativo: z.boolean().default(true),
})

/**
 * Bomba - Schema compartilhado
 */
export const bombaSharedSchema = z.object({
  id: z.number().int().optional(),
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  tipo: z.enum(['LANCA', 'ESTACIONARIA', 'REBOQUE']).default('LANCA'),
  placa: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
})

/**
 * Insumo - Schema compartilhado
 */
export const insumoSharedSchema = z.object({
  id: z.number().int().optional(),
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  unidadeMedida: z.string().min(1, 'Unidade de medida é obrigatória'),
  estoqueAtual: z.number().default(0),
  estoqueMinimo: z.number().default(0),
  custoUnitario: valorMonetarioSchema.optional(),
})

/**
 * Fornecedor - Schema compartilhado
 */
export const fornecedorSharedSchema = z.object({
  id: z.number().int().optional(),
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  contato: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: emailSchema.optional().nullable().or(z.literal('')),
})

/**
 * Conta a Pagar - Schema compartilhado
 */
export const contaPagarSharedSchema = z.object({
  id: z.number().int().optional(),
  descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  valor: valorMonetarioSchema,
  dataVencimento: z.union([z.date(), z.string()]),
  dataPagamento: z.union([z.date(), z.string()]).optional().nullable(),
  status: z.enum(['PENDENTE', 'PAGO', 'CANCELADO', 'ATRASADO']).default('PENDENTE'),
  idFornecedor: z.number().int().optional().nullable(),
  categoria: z.string().default('GERAL'),
})

// ==========================================
// Types Inferidos
// ==========================================

export type ClienteShared = z.infer<typeof clienteSharedSchema>
export type ProdutoShared = z.infer<typeof produtoSharedSchema>
export type OrcamentoItemShared = z.infer<typeof orcamentoItemSharedSchema>
export type OrcamentoShared = z.infer<typeof orcamentoSharedSchema>
export type VendaShared = z.infer<typeof vendaSharedSchema>
export type PagamentoShared = z.infer<typeof pagamentoSharedSchema>
export type MotoristaShared = z.infer<typeof motoristaSharedSchema>
export type CaminhaoShared = z.infer<typeof caminhaoSharedSchema>
export type BombaShared = z.infer<typeof bombaSharedSchema>
export type InsumoShared = z.infer<typeof insumoSharedSchema>
export type FornecedorShared = z.infer<typeof fornecedorSharedSchema>
export type ContaPagarShared = z.infer<typeof contaPagarSharedSchema>
