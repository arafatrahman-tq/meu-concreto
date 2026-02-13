<template>
  <div
    class="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary/2 font-sans"
  >
    <!-- Background Decorativo -->
    <div class="absolute inset-0 z-0 opacity-40">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]"
      />
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"
      />
    </div>

    <!-- Floating Content Wrapper -->
    <div class="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
      <!-- Brand Header -->
      <div
        class="mb-10 text-center animate-in fade-in slide-in-from-top-10 duration-1000"
      >
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-brand rounded-[2rem] shadow-2xl shadow-brand/20 mb-6 transition-transform hover:scale-110"
        >
          <svg
            viewBox="0 0 100 100"
            class="w-12 h-12 text-white fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Truck Body -->
            <path
              d="M15 45h50v20h-50z"
              opacity="0.8"
            />
            <path d="M65 47h18l4 8v10h-22z" />
            <!-- Concrete Drum -->
            <path d="M22 35c0-10 40-10 40 0l-5 18c0 5-30 5-30 0z" />
            <path
              d="M30 38l25 6"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.5"
            />
            <!-- Wheels -->
            <circle
              cx="28"
              cy="70"
              r="7"
            />
            <circle
              cx="48"
              cy="70"
              r="7"
            />
            <circle
              cx="75"
              cy="70"
              r="7"
            />
            <!-- Windows -->
            <path
              d="M68 50h8l2 5h-10z"
              fill="white"
              opacity="0.3"
            />
          </svg>
        </div>
        <h1 class="text-primary text-4xl font-bold tracking-tight mb-2">
          Meu Concreto
        </h1>
        <p
          class="text-secondary/60 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          Operational Intelligence
        </p>
      </div>

      <!-- Content Card -->
      <div
        class="w-full bg-surface p-10 md:p-14 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-border animate-in zoom-in-95 fade-in duration-700"
      >
        <div v-if="!submitted">
          <div class="mb-10 text-center">
            <h2 class="text-2xl font-bold tracking-tight text-primary">
              Recuperar Acesso
            </h2>
            <p class="text-secondary text-sm font-medium mt-1 leading-relaxed">
              Informe seu e-mail ou usuário para receber as instruções de
              recuperação.
            </p>
          </div>

          <form
            class="space-y-8"
            @submit.prevent="handleSubmit"
          >
            <div class="space-y-2">
              <label class="block text-xs font-bold text-secondary/80 ml-4">Identificação <span class="text-brand">*</span></label>
              <div class="relative group">
                <Mail
                  class="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 group-focus-within:text-brand transition-colors"
                  size="18"
                />
                <input
                  v-model="identity"
                  type="text"
                  class="w-full pl-14 pr-6 py-4 bg-primary/2 border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 transition-all font-semibold placeholder:text-secondary/30 text-sm outline-none"
                  placeholder="E-mail ou Usuário"
                  required
                >
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-4.5 bg-brand text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50"
            >
              <span
                v-if="loading"
                class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"
              />
              {{ loading ? "Sincronizando..." : "Enviar Instruções" }}
            </button>
          </form>

          <div class="mt-10 text-center">
            <NuxtLink
              to="/login"
              class="text-sm font-bold text-brand hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft size="16" />
              Voltar para o Login
            </NuxtLink>
          </div>
        </div>

        <!-- Success State -->
        <div
          v-else
          class="text-center py-4 animate-in fade-in zoom-in duration-500"
        >
          <div
            class="w-20 h-20 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"
          >
            <CheckCircle2
              size="40"
              stroke-width="2.5"
            />
          </div>
          <h3 class="text-2xl font-bold tracking-tight mb-4">
            Solicitação Enviada
          </h3>
          <p class="text-secondary text-base font-medium leading-relaxed mb-10">
            Se as informações coincidirem com nossa base, você receberá
            instruções de acesso em instantes.
          </p>
          <NuxtLink
            to="/login"
            class="inline-block px-10 py-4.5 bg-brand text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand/20 hover:scale-105 transition-transform"
          >
            Entendido
          </NuxtLink>
        </div>
      </div>

      <footer
        class="mt-12 text-center text-secondary/40 text-[10px] font-bold uppercase tracking-[0.2em]"
      >
        &copy; 2024 Meu Concreto • Intelligence Platform
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFetch } from '#imports'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-vue-next'
import { useLogger } from '~/composables/useLogger'

definePageMeta({
  layout: false,
})

const { info, error: logError } = useLogger()
const identity = ref('')
const loading = ref(false)
const submitted = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { identity: identity.value },
    })

    info('AUTH', `Solicitação de recuperação de senha: ${identity.value}`)
    submitted.value = true
  }
  catch (err) {
    // Mesmo em erro, mostramos sucesso por segurança (User Enumeration Prevention)
    logError(
      'AUTH',
      `Falha na solicitação de recuperação de senha: ${identity.value}`,
      { error: err.message },
    )
    submitted.value = true
  }
  finally {
    loading.value = false
  }
}
</script>
