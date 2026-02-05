import { ref } from 'vue'
import { useToast } from './useToast'

export const useWhatsApp = () => {
  const loading = ref(false)
  const { add: addToast } = useToast()

  const sendMessage = async (to: string, options: { 
    text?: string, 
    document?: string, 
    fileName?: string, 
    mimetype?: string, 
    caption?: string 
  }) => {
    loading.value = true
    try {
      const response = await $fetch('/api/whatsapp/send', {
        method: 'POST',
        body: {
          to,
          ...options
        }
      })

      addToast({
        title: "WhatsApp Enviado",
        description: "A mensagem foi colocada na fila de envio.",
        type: "success"
      })
      return response
    } catch (error: any) {
      addToast({
        title: "Erro no WhatsApp",
        description: error.data?.statusMessage || "Não foi possível enviar a mensagem.",
        type: "error"
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    sendMessage,
    loading
  }
}
