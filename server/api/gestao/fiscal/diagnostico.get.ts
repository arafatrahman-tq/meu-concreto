import { db } from '../../../database/db'
import { empresas, produtos, configuracoesNuvemFiscal } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { eq, isNull, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const empresa = await db.query.empresas.findFirst({
      where: eq(empresas.id, user.idEmpresa),
    })

    const nuvemfiscal = await db.query.configuracoesNuvemFiscal.findFirst({
      where: eq(configuracoesNuvemFiscal.idEmpresa, user.idEmpresa),
    })

    const prodsSemNcm = await db.query.produtos.findMany({
      where: or(isNull(produtos.ncm), eq(produtos.ncm, '')),
    })

    const erros = []
    const avisos = []

    // Verificações de Erro
    if (!empresa?.cnpj) erros.push('CNPJ da empresa não cadastrado.')
    if (!empresa?.endereco || !empresa?.cidade) erros.push('Endereço completo da empresa não cadastrado.')
    if (!nuvemfiscal || !nuvemfiscal.clientId) erros.push('Nuvem Fiscal não configurada.')

    // Verificações de Aviso
    if (prodsSemNcm.length > 0) avisos.push(`${prodsSemNcm.length} produtos estão sem código NCM.`)
    if (!empresa?.ie) avisos.push('Inscrição Estadual (IE) não informada (Obrigatório para NF-e).')

    return {
      status: erros.length === 0 ? 'PRONTO' : 'PENDENTE',
      erros,
      avisos,
      stats: {
        totalProdutos: (await db.query.produtos.findMany()).length,
        produtosSemNcm: prodsSemNcm.length,
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao gerar diagnóstico fiscal',
    })
  }
})
