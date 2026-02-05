import { requireAuth } from '../../../utils/auth';
import fs from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
    const user = requireAuth(event);
    if (user.admin !== 1) {
        throw createError({ statusCode: 403, message: 'Acesso negado' });
    }

    const backupDir = path.join(process.cwd(), 'backups_fiscais');

    try {
        await fs.access(backupDir);
        const files = await fs.readdir(backupDir);
        
        const backups = files.filter(f => f.endsWith('.backup')).map(f => {
            const parts = f.split('.');
            const ts = parts[2] ? parseInt(parts[2]) : 0;
            return {
                filename: f, // Nome para o useFetch no frontend
                target: parts[0] + '.' + parts[1],
                timestamp: ts,
                formattedDate: ts ? new Date(ts).toLocaleString('pt-BR') : 'Data desconhecida'
            };
        }).sort((a, b) => b.timestamp - a.timestamp);

        return backups;
    } catch (error) {
        return [];
    }
});
