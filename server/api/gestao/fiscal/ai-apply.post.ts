import { requireAuth } from '../../../utils/auth';
import { serverLog } from '../../../utils/logger';
import { db } from '../../../database/db';
import { configuracoes } from '../../../database/schema';
import fs from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);
    if (user.admin !== 1) {
        throw createError({ statusCode: 403, message: 'Acesso negado' });
    }

    const { suggestion } = await readBody(event);

    if (!suggestion || !suggestion.file || !suggestion.newCode) {
        throw createError({ statusCode: 400, message: 'Sugestão inválida ou incompleta' });
    }

    // Segurança: Apenas arquivos na pasta fiscal podem ser editados via este agente
    const allowedFiles = [
        'server/utils/fiscal/rules.ts',
        'server/utils/fiscal/core.ts'
    ];

    if (!allowedFiles.includes(suggestion.file)) {
        throw createError({ 
            statusCode: 403, 
            message: 'O agente não tem permissão para editar este arquivo específico por segurança.' 
        });
    }

    try {
        const absolutePath = path.resolve(process.cwd(), suggestion.file);
        const fileName = path.basename(absolutePath);
        
        // 1. Identificar se estamos em Build/Produção (Arquivos TS físicos não funcionam em runtime JS compilado)
        const isProd = process.env.NODE_ENV === 'production';

        // 2. Backup de Segurança em pasta externa
        const currentContent = await fs.readFile(absolutePath, 'utf-8');
        const backupDir = path.join(process.cwd(), 'backups_fiscais');
        try { await fs.mkdir(backupDir, { recursive: true }); } catch {}
        const timestamp = new Date().getTime();
        await fs.writeFile(path.join(backupDir, `${fileName}.${timestamp}.backup`), currentContent);

        // 3. Persistência em Banco de Dados (Padrão Antigravity para Hot-Patching)
        // Salva o patch para ser consumido pelo motor fiscal dinamicamente
        await db.insert(configuracoes).values({
            chave: 'AI_FISCAL_PATCH_CORE',
            valor: JSON.stringify({
                file: suggestion.file,
                code: suggestion.newCode,
                overrides: suggestion.overrides || null,
                appliedAt: new Date().toISOString()
            }),
            categoria: 'GERAL',
            descricao: 'Patch fiscal gerado por IA Agent para ambiente de produção',
            idEmpresa: 1, // Empresa mestre
        }).onConflictDoUpdate({
            target: [configuracoes.idEmpresa, configuracoes.chave],
            set: { 
                valor: JSON.stringify({ 
                    file: suggestion.file, 
                    code: suggestion.newCode, 
                    overrides: suggestion.overrides || null,
                    appliedAt: new Date().toISOString() 
                }) 
            }
        });

        // 4. Se for ambiente de DEV, atualiza o arquivo TS físico também
        if (!isProd && suggestion.newCode.length > 50) {
            await fs.writeFile(absolutePath, suggestion.newCode);
        }

        await serverLog.info(event, 'FISCAL_AI', `Atualização aplicada. Ambiente: ${isProd ? 'PROD (DB Patch)' : 'DEV (File + DB)'}`, {
            file: suggestion.file
        });

        return { 
            success: true, 
            message: isProd 
                ? 'Patch fiscal aplicado com sucesso no banco de dados. O motor entrará em modo dinâmico.' 
                : 'Código e Banco de Dados atualizados com sucesso.' 
        };

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Erro ao aplicar alteração: ' + error.message
        });
    }
});
