import { ref, computed } from 'vue'

export const useSettings = () => {
  const settings = useState<any[]>('app-settings', () => [])
  const loading = ref(false)

  const fetchSettings = async (isAdmin = false) => {
    // Evita re-fetch se já tiver dados (importante para hidratação)
    if (settings.value.length > 0) return

    try {
      loading.value = true
      const endpoint = isAdmin ? '/api/configuracoes/sistema' : '/api/configuracoes/flags'
      const { data } = await useFetch<any[]>(endpoint, {
        key: `settings-${isAdmin}`,
        // Garantir que os dados sejam sincronizados entre servidor e cliente
      })
      if (data.value) {
        settings.value = data.value
      }
    }
    catch (error) {
      console.error('Erro ao carregar configurações', error)
    }
    finally {
      loading.value = false
    }
  }

  const getSetting = (chave: string, defaultValue: any = null) => {
    const setting = settings.value.find((s: any) => s.chave === chave)
    if (!setting) return defaultValue

    try {
      return JSON.parse(setting.valor)
    }
    catch {
      return setting.valor
    }
  }

  const isFeatureEnabled = (chave: string) => {
    const val = getSetting(chave)
    return val === true || val?.enabled === true
  }

  return {
    settings,
    loading,
    fetchSettings,
    getSetting,
    isFeatureEnabled,
  }
}
