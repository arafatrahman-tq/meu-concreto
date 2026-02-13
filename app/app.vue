<template>
  <div class="min-h-screen bg-background text-primary">
    <NuxtRouteAnnouncer />

    <div
      v-if="isMaintenance"
      class="fixed inset-0 z-9999 bg-surface flex flex-col items-center justify-center p-6 text-center"
    >
      <div
        class="w-24 h-24 bg-brand/10 rounded-3xl flex items-center justify-center mb-8 animate-pulse"
      >
        <Settings class="text-brand w-12 h-12" />
      </div>
      <h1 class="text-4xl font-black tracking-tighter text-primary mb-4">
        Sistema em Manutenção
      </h1>
      <p class="text-secondary max-w-md font-medium">
        Estamos realizando atualizações importantes para melhorar sua
        experiência. Voltaremos em breve!
      </p>
      <div
        class="mt-12 text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-40"
      >
        {{
          useState("maint_date", () => new Date().toLocaleDateString()).value
        }}
        • Central de Operações
      </div>
    </div>

    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <BaseToast />
    </ClientOnly>
  </div>
</template>

<script setup>
import { Settings } from 'lucide-vue-next'

const { user, fetchUser } = useAuth()
const { fetchSettings, isFeatureEnabled } = useSettings()

// Busca configurações e usuário no lado do servidor e cliente
// O uso de top-level await aqui garante consistência na hidratação
await Promise.all([fetchUser(), fetchSettings()])

const isMaintenance = computed(() => {
  // Admins podem ignorar o modo manutenção para testar o sistema
  if (user.value?.admin === 1) return false
  return isFeatureEnabled('MAINTENANCE_MODE')
})
</script>

<style>
@import "~/assets/css/main.css";
</style>
