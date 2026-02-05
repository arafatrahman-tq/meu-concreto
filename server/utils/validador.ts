import { z } from "zod";

/**
 * Validação de CPF/CNPJ baseada em algoritmos oficiais.
 */
function validarCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfs = cpf.split("").map((el) => +el);
  const rest = (count: number) =>
    ((cpfs.slice(0, count - 12).reduce((s, el, i) => s + el * (count - i), 0) *
      10) %
      11) %
    10;
  return rest(10) === cpfs[9] && rest(11) === cpfs[10];
}

function validarCnpj(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
  const size = cnpj.length - 2;
  const numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let length = size;
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  length = length + 1;
  const numbers2 = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers2.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  return true;
}

export const clienteSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z.string().refine(
    (val) => {
      const clean = val.replace(/[^\d]+/g, "");
      return clean.length === 11
        ? validarCpf(clean)
        : clean.length === 14
          ? validarCnpj(clean)
          : false;
    },
    { message: "CPF ou CNPJ inválido" },
  ),
  endereco: z.string().optional().nullable().or(z.literal("")),
  enderecoEntrega: z.string().optional().nullable().or(z.literal("")),
  bairro: z.string().optional().nullable().or(z.literal("")),
  cidade: z.string().optional().nullable().or(z.literal("")),
  cep: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  estado: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .optional()
    .nullable()
    .or(z.literal("")),
  telefone: z.string().optional().nullable().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  idEmpresa: z.number().int().positive(),
});

export const empresaSchema = z.object({
  empresa: z
    .string()
    .min(3, "O nome da empresa deve ter pelo menos 3 caracteres"),
  cnpj: z.string().refine((val) => validarCnpj(val.replace(/[^\d]+/g, "")), {
    message: "CNPJ inválido",
  }),
  ie: z.string().optional().nullable().or(z.literal("")),
  logo: z.string().optional().nullable().or(z.literal("")),
  endereco: z.string().optional().nullable().or(z.literal("")),
  bairro: z.string().optional().nullable().or(z.literal("")),
  telefone: z.string().optional().nullable().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  filial: z.string().optional().nullable().or(z.literal("")),
  crt: z.number().int().min(1).max(3).optional().default(1),
  codigoServicoMunicipal: z.string().optional().default("07.02"),
});

export const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  usuario: z.string().min(3, "O usuário deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().optional().nullable().or(z.literal("")),
  senha: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  admin: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().positive(),
  idEmpresasAcesso: z.array(z.number()).optional(),
});

export const formaPgtoSchema = z.object({
  formaPagamento: z
    .string()
    .min(3, "A forma de pagamento deve ter pelo menos 3 caracteres"),
  dias: z.union([z.number(), z.string()]),
  tipoAsaas: z
    .enum(["BOLETO", "PIX", "CREDIT_CARD", "UNDEFINED"])
    .optional()
    .default("UNDEFINED"),
});

export const vendedorSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().optional().nullable().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  pin: z
    .string()
    .length(4, "O PIN deve ter 4 dígitos")
    .regex(/^\d+$/, "Apenas números")
    .optional()
    .nullable(),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().positive(),
});

export const produtoSchema = z.object({
  produto: z
    .string()
    .min(2, "O nome do produto deve ter pelo menos 2 caracteres"),
  valorCusto: z.number().min(0).optional().nullable(),
  valorVenda: z.number().min(0).optional().nullable(),
  fck: z.string().optional().nullable().or(z.literal("")),
  slump: z.number().int().min(0).optional().nullable(),
  britaTipo: z.string().optional().nullable().or(z.literal("")),
  aditivo: z.string().optional().nullable().or(z.literal("")),
  unidadeMedida: z.string().optional().default("m³"),
  descricao: z.string().optional().nullable().or(z.literal("")),
  ativo: z.boolean().optional().default(true),
});

export const orcamentoSchema = z.object({
  idCliente: z.number().int().optional().nullable(),
  nomeCliente: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z.string().optional().nullable().or(z.literal("")),
  endereco: z.string().optional().nullable().or(z.literal("")),
  enderecoEntrega: z.string().optional().nullable().or(z.literal("")),
  bairro: z.string().optional().nullable().or(z.literal("")),
  cidade: z.string().optional().nullable().or(z.literal("")),
  cep: z.string().optional().nullable().or(z.literal("")),
  estado: z.string().optional().nullable().or(z.literal("")),
  telefone: z.string().optional().nullable().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  idProduto: z.number().int().positive(),
  produtoNome: z.string().min(2),
  qtd: z.number().positive(),
  valorUnit: z.number().int().min(0),
  total: z.number().int().min(0),
  idVendedor: z.number().int().positive(),
  idFormaPgto: z.number().int().positive(),
  idEmpresa: z.number().int().positive().optional(),
  idUsuario: z.string().optional(),
  validadeOrcamento: z
    .union([z.date(), z.string().pipe(z.coerce.date())])
    .optional()
    .nullable(),
  dataEntrega: z
    .union([z.date(), z.string().pipe(z.coerce.date())])
    .optional()
    .nullable(),
  distanciaObra: z.number().min(0).optional().nullable(),
  idMotorista: z.number().int().optional().nullable(),
  idCaminhao: z.number().int().optional().nullable(),
  idBomba: z.number().int().optional().nullable(),
  bombaNecessaria: z.boolean().optional().default(false),
  valorBomba: z.number().int().min(0).optional().nullable().default(0),
  valorDesconto: z.number().int().min(0).optional().nullable().default(0),
  status: z
    .enum(["PENDENTE", "APROVADO", "CANCELADO", "VENCIDO", "CONCLUIDO"])
    .optional()
    .default("PENDENTE"),
  lacre: z.string().optional().nullable(),
  obs: z.string().optional(),
  itens: z
    .array(
      z.object({
        idProduto: z.number().int().positive(),
        produtoNome: z.string().min(2),
        qtd: z.number().positive(),
        valorUnit: z.number().int().min(0),
        total: z.number().int().min(0),
      }),
    )
    .optional(),
});

export const logSchema = z.object({
  nivel: z.enum(["INFO", "WARN", "ERROR", "DEBUG"]),
  modulo: z.string().min(2),
  mensagem: z.string().min(1),
  dados: z.string().optional(),
  idUsuario: z.string().optional(),
  idEmpresa: z.number().int().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  origem: z.string().optional(),
});

export const vendaSchema = z.object({
  idOrcamento: z.number().int().positive(),
  valorTotal: z.number().int().min(0),
  status: z
    .enum(["ABERTA", "PAGA", "CANCELADA", "NF_EMITIDA"])
    .optional()
    .default("ABERTA"),
  idEmpresa: z.number().int().positive(),
});

export const pagamentoSchema = z.object({
  idVenda: z.number().int().positive(),
  valor: z.number().int().min(0),
  dataVencimento: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  dataPagamento: z
    .union([z.date(), z.string().pipe(z.coerce.date())])
    .optional()
    .nullable(),
  status: z
    .enum(["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"])
    .optional()
    .default("PENDENTE"),
  metodo: z.string().optional().nullable(),
  asaasId: z.string().optional().nullable(),
  asaasUrl: z.string().optional().nullable(),
  idEmpresa: z.number().int().positive(),
});

export const whatsappSchema = z.object({
  instanceUrl: z.string().url("URL da Instância inválida"),
  apiKey: z.string().min(5, "API Key inválida"),
  notificaContasPagar: z.boolean().optional().default(false),
  notificaCobrancas: z.boolean().optional().default(false),
  notificaNovosOrcamentos: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true),
});

export const asaasSchema = z.object({
  apiKey: z.string().min(5, "API Key inválida"),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  webhookToken: z.string().optional().nullable(),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().optional().nullable(),
});

export const blingSchema = z.object({
  apiKey: z.string().min(5, "API Key inválida"),
  clientId: z.string().optional().nullable().or(z.literal("")),
  clientSecret: z.string().optional().nullable().or(z.literal("")),
  accessToken: z.string().optional().nullable().or(z.literal("")),
  refreshToken: z.string().optional().nullable().or(z.literal("")),
  idDeposito: z.string().optional().nullable().or(z.literal("")),
  idCategoria: z.string().optional().nullable().or(z.literal("")),
  naturezaOperacao: z.string().optional().nullable().or(z.literal("")),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().optional().nullable(),
});
export const configuracoesSicoobSchema = z.object({
  clientId: z.string().min(5, "Client ID inválido"),
  clientSecret: z.string().optional().nullable().or(z.literal("")),
  certificate: z.string().optional().nullable().or(z.literal("")),
  privateKey: z.string().optional().nullable().or(z.literal("")),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  chavePix: z.string().optional().nullable().or(z.literal("")),
  contaCorrente: z.string().optional().nullable().or(z.literal("")),
  cooperativa: z.string().optional().nullable().or(z.literal("")),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().optional().nullable(),
});

export const configuracoesPixManualSchema = z.object({
  chavePix: z.string().min(1, "Chave Pix é obrigatória"),
  beneficiario: z.string().min(3, "Beneficiário é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().optional().nullable(),
});

export const nuvemFiscalSchema = z.object({
  clientId: z.string().min(5, "Client ID inválido"),
  clientSecret: z.string().min(5, "Client Secret inválido"),
  certificado: z.string().optional().nullable().or(z.literal("")),
  certificadoSenha: z.string().optional().nullable().or(z.literal("")),
  nfseSerie: z.string().optional().nullable().or(z.literal("")),
  nfseLote: z.number().int().optional().nullable(),
  nfseProximoNumero: z.number().int().optional().nullable(),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().optional().nullable(),
});

export const configuracaoSchema = z.object({
  chave: z.string().min(3),
  valor: z.string(), // Espera string JSON
  descricao: z.string().optional(),
  categoria: z
    .enum(["FEATURE_FLAG", "NEGOCIO", "UI", "GERAL"])
    .default("GERAL"),
  idEmpresa: z.number().int().optional().nullable(),
});

export const motoristaSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().optional().nullable().or(z.literal("")),
  cnh: z.string().optional().nullable().or(z.literal("")),
  pin: z
    .string()
    .length(4, "O PIN deve ter 4 dígitos")
    .regex(/^\d+$/, "Apenas números")
    .optional()
    .nullable(),
  ativo: z.boolean().optional().default(true),
  idCaminhao: z.number().int().optional().nullable(),
  idEmpresa: z.number().int().positive(),
});

export const caminhaoSchema = z.object({
  placa: z.string().min(7, "Placa inválida"),
  modelo: z.string().optional().nullable().or(z.literal("")),
  capacidade: z.number().positive("Capacidade deve ser positiva"),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().positive(),
});

export const bombaSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  tipo: z.enum(["LANCA", "ESTACIONARIA", "REBOQUE"]).default("LANCA"),
  placa: z.string().optional().nullable().or(z.literal("")),
  descricao: z.string().optional().nullable().or(z.literal("")),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().positive(),
});

export const fornecedorSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  contato: z.string().optional().nullable().or(z.literal("")),
  cnpj: z.string().optional().nullable().or(z.literal("")),
  telefone: z.string().optional().nullable().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  idEmpresa: z.number().int().positive(),
});

export const contaPagarSchema = z.object({
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
  valor: z.number().int().min(0, "O valor deve ser maior ou igual a 0"),
  dataVencimento: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  dataPagamento: z
    .union([z.date(), z.string().pipe(z.coerce.date())])
    .optional()
    .nullable(),
  status: z
    .enum(["PENDENTE", "PAGO", "CANCELADO", "ATRASADO"])
    .optional()
    .default("PENDENTE"),
  idFornecedor: z.number().int().optional().nullable(),
  categoria: z.string().optional().default("GERAL"),
  idEmpresa: z.number().int().positive(),
});

export const insumoSchema = z.object({
  nome: z.string().min(2, "O nome do insumo deve ter pelo menos 2 caracteres"),
  unidadeMedida: z.string().min(1, "Unidade de medida é obrigatória"),
  estoqueAtual: z.number().default(0),
  estoqueMinimo: z.number().default(0),
  custoUnitario: z.number().int().min(0).optional(),
  idEmpresa: z.number().int().positive(),
});

export const tracoSchema = z.object({
  idProduto: z.number().int().positive(),
  nome: z.string().min(2, "O nome do traço deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().optional().default(true),
  idEmpresa: z.number().int().positive(),
  itens: z
    .array(
      z.object({
        idInsumo: z.number().int().positive(),
        quantidade: z.number().positive(),
      }),
    )
    .min(1, "O traço deve ter pelo menos um insumo"),
});

export const ordemServicoSchema = z.object({
  idOrcamento: z.number().int().positive(),
  numeroTicket: z.string().optional().nullable(),
  qtd: z.number().positive(),
  slump: z.number().int().optional().nullable(),
  lacre: z.string().optional().nullable(),
  idMotorista: z.number().int().optional().nullable(),
  idCaminhao: z.number().int().optional().nullable(),
  idBomba: z.number().int().optional().nullable(),
  status: z
    .enum([
      "AGUARDANDO_SAIDA",
      "EM_TRANSITO",
      "DESCARREGANDO",
      "CONCLUIDA",
      "CANCELADA",
    ])
    .optional()
    .default("AGUARDANDO_SAIDA"),
  dataSaida: z
    .union([z.date(), z.string().pipe(z.coerce.date())])
    .optional()
    .nullable(),
  idEmpresa: z.number().int().positive(),
  obs: z.string().optional().nullable(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
export type EmpresaInput = z.infer<typeof empresaSchema>;
export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type FormaPgtoInput = z.infer<typeof formaPgtoSchema>;
export type VendedorInput = z.infer<typeof vendedorSchema>;
export type ProdutoInput = z.infer<typeof produtoSchema>;
export type OrcamentoInput = z.infer<typeof orcamentoSchema>;
export type LogInput = z.infer<typeof logSchema>;
export type VendaInput = z.infer<typeof vendaSchema>;
export type PagamentoInput = z.infer<typeof pagamentoSchema>;
export type FornecedorInput = z.infer<typeof fornecedorSchema>;
export type ContaPagarInput = z.infer<typeof contaPagarSchema>;
export type MotoristaInput = z.infer<typeof motoristaSchema>;
export type BombaInput = z.infer<typeof bombaSchema>;
export type CaminhaoInput = z.infer<typeof caminhaoSchema>;
export type OrdemServicoInput = z.infer<typeof ordemServicoSchema>;
