import { describe, it, expect, mock, spyOn } from 'bun:test'
import { AsaasPaymentProvider } from '../server/services/payments/asaas-provider'
import { SicoobPaymentProvider } from '../server/services/payments/sicoob-provider'
import { ManualPixProvider } from '../server/services/payments/manual-pix-provider'
import { asaasService } from '../server/utils/asaas'
import { sicoobService } from '../server/utils/sicoob'
import { db } from '../server/database/db'
import * as pixUtils from '../server/utils/pix'

describe('Payment Providers', () => {
  const idEmpresa = 1
  const paymentOptions = {
    nomeCliente: 'Cliente Teste',
    cpfCnpj: '12345678901',
    email: 'teste@cliente.com',
    telefone: '11999999999',
    valor: 10000, // R$ 100,00
    vencimento: new Date(),
    descricao: 'Teste de Pagamento',
    idReferencia: 'REF123',
    tipo: 'PIX' as const,
  }

  describe('AsaasPaymentProvider', () => {
    it('should create a payment successfully', async () => {
      const spyFind = spyOn(asaasService, 'findOrCreateCustomer').mockResolvedValue('cust_mock_123')
      const spyCreate = spyOn(asaasService, 'createBilling').mockResolvedValue({
        id: 'bill_mock_123',
        invoiceUrl: 'https://asaas.com/i/mock',
        status: 'PENDING',
        pixCopiaECola: 'pix_mock_code',
      })

      const provider = new AsaasPaymentProvider()
      const response = await provider.createPayment(idEmpresa, paymentOptions)

      expect(response.sucesso).toBe(true)
      expect(response.providerId).toBe('bill_mock_123')
      expect(response.link).toBe('https://asaas.com/i/mock')
      expect(response.qrCode).toBe('pix_mock_code')

      spyFind.mockRestore()
      spyCreate.mockRestore()
    })

    it('should handle errors from asaasService', async () => {
      const spyFind = spyOn(asaasService, 'findOrCreateCustomer').mockResolvedValue('cust_123')
      const spyCreate = spyOn(asaasService, 'createBilling').mockRejectedValue(new Error('API Error'))

      const provider = new AsaasPaymentProvider()
      const response = await provider.createPayment(idEmpresa, paymentOptions)

      expect(response.sucesso).toBe(false)
      expect(response.error).toBe('API Error')

      spyFind.mockRestore()
      spyCreate.mockRestore()
    })
  })

  describe('SicoobPaymentProvider', () => {
    it('should create a PIX payment successfully', async () => {
      const spyDb = spyOn(db.query.configuracoesSicoob, 'findFirst').mockResolvedValue({
        ativo: 1,
        chavePix: 'mock@pix.com',
      } as any)
      const spyPix = spyOn(sicoobService, 'createImmediatePix').mockResolvedValue({
        txid: 'sicoob_mock_txid',
        pixCopiaECola: 'sicoob_pix_mock_code',
      } as any)

      const provider = new SicoobPaymentProvider()
      const response = await provider.createPayment(idEmpresa, paymentOptions)

      expect(response.sucesso).toBe(true)
      expect(response.providerId).toBe('sicoob_mock_txid')
      expect(response.qrCode).toBe('sicoob_pix_mock_code')

      spyDb.mockRestore()
      spyPix.mockRestore()
    })

    it('should return error for non-PIX types', async () => {
      const provider = new SicoobPaymentProvider()
      const response = await provider.createPayment(idEmpresa, {
        ...paymentOptions,
        tipo: 'BOLETO' as any,
      })

      expect(response.sucesso).toBe(false)
      expect(response.error).toContain('Sicoob suporta apenas pagamentos via PIX')
    })

    it('should handle inactive configuration', async () => {
      const spyDb = spyOn(db.query.configuracoesSicoob, 'findFirst').mockResolvedValue(null as any)

      const provider = new SicoobPaymentProvider()
      const response = await provider.createPayment(idEmpresa, paymentOptions)

      expect(response.sucesso).toBe(false)
      expect(response.error).toContain('Sicoob não está ativo')

      spyDb.mockRestore()
    })
  })

  describe('ManualPixProvider', () => {
    it('should generate a manual PIX successfully', async () => {
      const spyDb = spyOn(db.query.configuracoesPixManual, 'findFirst').mockResolvedValue({
        ativo: 1,
        chavePix: 'manual@pix.com',
        beneficiario: 'Empresa Mock',
        cidade: 'Sao Paulo',
      } as any)
      const spyGen = spyOn(pixUtils, 'generateStaticPix').mockReturnValue('static_pix_mock_code')

      const provider = new ManualPixProvider()
      const response = await provider.createPayment(idEmpresa, paymentOptions)

      expect(response.sucesso).toBe(true)
      expect(response.providerId).toContain('MANUAL_')
      expect(response.qrCode).toBe('static_pix_mock_code')

      spyDb.mockRestore()
      spyGen.mockRestore()
    })

    it('should return error if manual PIX is not configured', async () => {
      const spyDb = spyOn(db.query.configuracoesPixManual, 'findFirst').mockResolvedValue(null as any)

      const provider = new ManualPixProvider()
      const response = await provider.createPayment(idEmpresa, paymentOptions)

      expect(response.sucesso).toBe(false)
      expect(response.error).toContain('não encontrada ou desativada')

      spyDb.mockRestore()
    })
  })
})
