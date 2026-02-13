import { requireAuth } from '../../../utils/auth'
import { serverLog } from '../../../utils/logger'
import { db } from '../../../database/db'
import { configuracoes } from '../../../database/schema'
import { eq, and } from 'drizzle-orm'
import fs from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  if (user.admin !== 1) {
    throw createError({ statusCode: 403, message: 'Acesso negado' })
  }

  const { backupId } = await readBody(event)

  if (!backupId) {
    throw createError({ statusCode: 400, message: 'ID do backup é obrigatório' })
  }

  const backupDir = path.join(process.cwd(), 'backups_fiscais')
  const backupPath = path.join(backupDir, backupId)

  try {
    const content = await fs.readFile(backupPath, 'utf-8')
    const parts = backupId.split('.')
    const targetFile = parts[0] + '.' + parts[1] // server/utils/fiscal/rules.ts
    const absoluteTargetPath = path.resolve(process.cwd(), targetFile)

    // 1. Restaurar arquivo físico (se em DEV)
    if (process.env.NODE_ENV !== 'production') {
      await fs.writeFile(absoluteTargetPath, content)
    }

    // 2. Restaurar no Banco de Dados (Para Produção)
    await db.insert(configuracoes).values({
      chave: 'AI_FISCAL_PATCH_CORE',
      valor: JSON.stringify({
        file: targetFile,
        code: content,
        appliedAt: new Date().toISOString(),
        rollbackFrom: backupId,
      }),
      categoria: 'GERAL',
      descricao: 'Rollback fiscal aplicado via histórico',
      idEmpresa: 1,
    }).onConflictDoUpdate({
      target: [configuracoes.idEmpresa, configuracoes.chave],
      set: {
        valor: JSON.stringify({
          file: targetFile,
          code: content,
          appliedAt: new Date().toISOString(),
          rollbackFrom: backupId,
        }),
      },
    })

    await serverLog.info(event, 'FISCAL_AI', `Rollback fiscal aplicado com sucesso. Origem: ${backupId}`)

    return { success: true, message: 'Rollback concluído com sucesso.' }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao realizar rollback: ' + error.message,
    })
  }
})
