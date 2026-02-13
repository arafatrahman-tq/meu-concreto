import { sicoobService } from '../../utils/sicoob'
import { db } from '../../database/db'
import { configuracoesSicoob } from '../../database/schema'
import { eq } from 'drizzle-orm'
import type {
  PaymentProvider,
  PaymentOptions,
  PaymentResponse,
} from './provider'

export class SicoobPaymentProvider implements PaymentProvider {
  name = 'Sicoob'

  async createPayment(
    idEmpresa: number,
    options: PaymentOptions,
  ): Promise<PaymentResponse> {
    if (options.tipo !== 'PIX') {
      return {
        sucesso: false,
        error: 'Sicoob suporta apenas pagamentos via PIX nesta integração.',
      }
    }

    try {
      const config = await db.query.configuracoesSicoob.findFirst({
        where: eq(configuracoesSicoob.idEmpresa, idEmpresa),
      })

      if (!config || !config.ativo) {
        throw new Error('Sicoob não está ativo para esta empresa.')
      }

      const pix = await sicoobService.createImmediatePix(idEmpresa, {
        valor: options.valor,
        chave: config.chavePix || '',
        devedor: {
          nome: options.nomeCliente,
          [options.cpfCnpj.replace(/\D/g, '').length === 14 ? 'cnpj' : 'cpf']:
            options.cpfCnpj.replace(/\D/g, ''),
        },
        solicitacaoPagador: options.descricao,
      })

      return {
        sucesso: true,
        providerId: pix.txid,
        qrCode: pix.pixCopiaECola,
      }
    }
    catch (error: any) {
      return {
        sucesso: false,
        error: error.message || 'Erro desconhecido no Sicoob',
      }
    }
  }
}
