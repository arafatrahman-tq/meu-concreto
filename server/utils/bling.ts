import { db } from '../database/db'
import { configuracoesBling } from '../database/schema'
import { eq } from 'drizzle-orm'

const getBlingConfig = async (idEmpresa: number) => {
  const config = await db.query.configuracoesBling.findFirst({
    where: eq(configuracoesBling.idEmpresa, idEmpresa),
  })

  if (!config) {
    throw new Error('Configuração do Bling não encontrada para esta empresa.')
  }

  return config
}

export const blingService = {
  /**
     * Emite uma NF-e (Produto) no Bling
     */
  async emitNfe(idEmpresa: number, vendaData: any) {
    const config = await getBlingConfig(idEmpresa)

    // Simulação da chamada ao Bling V3
    // No futuro, aqui entrará a lógica de montar o XML/JSON e enviar via OAuth2
    console.log(`[Bling] Emitindo NF-e para Venda #${vendaData.id} na Empresa #${idEmpresa}`)

    // Mock de resposta de sucesso
    return {
      sucesso: true,
      numero: Math.floor(Math.random() * 10000),
      serie: '1',
      link: 'https://bling.com.br/relatorios/nfe.php?id=...',
    }
  },

  /**
     * Emite uma NFS-e (Serviço) no Bling
     */
  async emitNfse(idEmpresa: number, vendaData: any) {
    const config = await getBlingConfig(idEmpresa)

    console.log(`[Bling] Emitindo NFS-e para Venda #${vendaData.id} na Empresa #${idEmpresa}`)

    return {
      sucesso: true,
      numero: Math.floor(Math.random() * 10000),
      link: 'https://bling.com.br/relatorios/nfse.php?id=...',
    }
  },
}
