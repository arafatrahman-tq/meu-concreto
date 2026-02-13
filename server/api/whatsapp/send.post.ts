import { whatsappService } from '../../utils/whatsapp'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Não autorizado',
      })
    }

    const body = await readBody(event)

    if (!body.to) {
      throw createError({
        statusCode: 400,
        message: 'O campo \'to\' (telefone) é obrigatório.',
      })
    }

    const result = await whatsappService.sendMessage(
      {
        number: body.to,
        text: body.text,
        // Se for PDF, remove o prefixo data URI antes de enviar para a API Evolution
        document: body.document?.includes('base64,')
          ? body.document.split('base64,')[1]
          : body.document,
        fileName: body.fileName,
        mimetype: body.mimetype,
        caption: body.caption,
      },
      user.idEmpresa,
    )

    return {
      success: true,
      data: result,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro interno ao enviar WhatsApp',
    })
  }
})
