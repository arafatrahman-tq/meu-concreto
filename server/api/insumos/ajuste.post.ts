import { db } from '../../database/db'
import { insumos, insumosMovimentacoes } from '../../database/schema'
import { eq, and, sql } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { z } from 'zod'

const ajusteSchema = z.object({
  idInsumo: z.number().int().positive(),
  tipo: z.enum(['ENTRADA', 'SAIDA_REAL', 'AJUSTE']), // ENTRADA=Compra/Reposição, SAIDA_REAL=Perda identificada, AJUSTE=Inventário
  quantidade: z.number(),
  observacao: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  try {
    const body = await readBody(event)
    const data = ajusteSchema.parse(body)

    return await db.transaction(async (tx) => {
      // 1. Buscar o insumo para validar empresa
      const insumo = await tx.query.insumos.findFirst({
        where: and(
          eq(insumos.id, data.idInsumo),
          eq(insumos.idEmpresa, user.idEmpresa),
        ),
      })

      if (!insumo) {
        throw createError({ statusCode: 404, message: 'Insumo não encontrado' })
      }

      // 2. Calcular novo saldo se for AJUSTE (Inventário Físico)
      // Se for ENTRADA или SAIDA_REAL, a quantidade é relativa.
      // Se for AJUSTE, a quantidade é o novo valor total (absoluto).
      let qtdMovimentacao = data.quantidade
      let novoEstoque = 0

      if (data.tipo === 'AJUSTE') {
        qtdMovimentacao = data.quantidade - (insumo.estoqueAtual || 0)
        novoEstoque = data.quantidade
      }
      else if (data.tipo === 'ENTRADA') {
        novoEstoque = (insumo.estoqueAtual || 0) + data.quantidade
      }
      else { // SAIDA_REAL
        novoEstoque = (insumo.estoqueAtual || 0) - data.quantidade
        qtdMovimentacao = -data.quantidade // Armazenar negativo para saídas reais?
        // Decisão SME: Armazenamos o valor absoluto na coluna quantidade e o 'tipo' define a direção.
      }

      // 3. Atualizar estoque principal
      await tx.update(insumos)
        .set({
          estoqueAtual: novoEstoque,
          updatedAt: new Date(),
        })
        .where(eq(insumos.id, data.idInsumo))

      // 4. Registrar a movimentação
      const [mov] = await tx.insert(insumosMovimentacoes).values({
        idInsumo: data.idInsumo,
        tipo: data.tipo,
        quantidade: data.tipo === 'AJUSTE' ? qtdMovimentacao : data.quantidade,
        origem: 'MANUAL',
        idUsuario: user.id,
        idEmpresa: user.idEmpresa,
        observacao: data.observacao || (data.tipo === 'AJUSTE' ? 'Correção via Inventário' : 'Ajuste manual'),
        createdAt: new Date(),
      }).returning()

      return mov
    })
  }
  catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({ statusCode: 400, message: 'Dados inválidos' })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    })
  }
})
