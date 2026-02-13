export interface PaymentOptions {
  valor: number // em centavos
  nomeCliente: string
  cpfCnpj: string
  email?: string
  telefone?: string
  descricao: string
  vencimento: Date
  tipo: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  idReferencia?: string // ex: VENDA_123
}

export interface PaymentResponse {
  sucesso: boolean
  providerId?: string
  qrCode?: string // Para Pix Copia e Cola
  link?: string // Para link de fatura (Asaas)
  error?: string
}

export interface PaymentProvider {
  name: string
  createPayment(
    idEmpresa: number,
    options: PaymentOptions,
  ): Promise<PaymentResponse>
}
