import { db } from '../../database/db';
import { configuracoesWhatsapp } from '../../database/schema';
import { whatsappSchema } from '../../utils/validador';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const user = requireAdmin(event);
    
    try {
        const body = await readBody(event);
        const validatedData = whatsappSchema.parse(body);

        const existing = await db.query.configuracoesWhatsapp.findFirst({
            where: user.idEmpresa ? eq(configuracoesWhatsapp.idEmpresa, user.idEmpresa) : undefined
        });

        const dataToSave = {
            ...validatedData,
            notificaContasPagar: validatedData.notificaContasPagar ? 1 : 0,
            notificaCobrancas: validatedData.notificaCobrancas ? 1 : 0,
            notificaNovosOrcamentos: validatedData.notificaNovosOrcamentos ? 1 : 0,
            ativo: validatedData.ativo ? 1 : 0,
            idEmpresa: user.idEmpresa,
            updatedAt: new Date(),
        };

        if (existing) {
            await db.update(configuracoesWhatsapp)
                .set(dataToSave)
                .where(eq(configuracoesWhatsapp.id, existing.id));
            return { message: 'Configurações atualizadas' };
        } else {
            await db.insert(configuracoesWhatsapp).values(dataToSave);
            return { message: 'Configurações criadas' };
        }
    } catch (error: any) {
        if (error.name === 'ZodError') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Erro de Validação',
                message: error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message,
                data: error.issues || error.errors,
            });
        }
        throw createError({
            statusCode: 500,
            message: error.message,
        });
    }
});
