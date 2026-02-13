<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-md bg-surface p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-300 mx-4"
    >
      <div class="mb-6 md:mb-8 text-center">
        <h3
          class="text-xl md:text-2xl font-black uppercase tracking-tight text-primary"
        >
          Segurança Exigida
        </h3>
        <p
          class="text-secondary mt-2 text-xs md:text-sm font-medium uppercase tracking-wider"
        >
          Por favor, defina uma nova senha para continuar o acesso ao portal.
        </p>
      </div>

      <form
        class="space-y-4 md:space-y-5"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-1">
          <label
            class="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary ml-2"
          >Senha Atual <span class="text-brand">*</span></label>
          <input
            v-model="form.currentPassword"
            type="password"
            class="w-full px-5 md:px-6 py-3 md:py-4 bg-primary/2 border border-border rounded-xl md:rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 transition-all font-bold placeholder:text-secondary/30 text-primary text-sm outline-none"
            placeholder="••••••••"
            required
          >
        </div>

        <div class="space-y-1">
          <label
            class="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary ml-2"
          >Nova Senha <span class="text-brand">*</span></label>
          <input
            v-model="form.newPassword"
            type="password"
            class="w-full px-5 md:px-6 py-3 md:py-4 bg-primary/2 border border-border rounded-xl md:rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 transition-all font-bold placeholder:text-secondary/30 text-primary text-sm outline-none"
            placeholder="••••••••"
            required
          >
        </div>

        <div class="space-y-1">
          <label
            class="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary ml-2"
          >Confirmar Nova Senha <span class="text-brand">*</span></label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="w-full px-5 md:px-6 py-3 md:py-4 bg-primary/2 border border-border rounded-xl md:rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 transition-all font-bold placeholder:text-secondary/30 text-primary text-sm outline-none"
            placeholder="••••••••"
            required
          >
        </div>

        <div
          v-if="error"
          class="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-[10px] md:text-xs border border-rose-100 dark:border-rose-500/20 font-bold uppercase tracking-wide"
        >
          <span>{{ error }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-4 md:py-5 bg-brand text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 shadow-xl shadow-brand/20"
        >
          <span
            v-if="loading"
            class="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin"
          />
          {{ loading ? "Sincronizando..." : "Atualizar e Acessar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useFetch } from '#imports'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['success'])
const { add: addToast } = useToast()
const { info, error: logError } = useLogger()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (form.newPassword !== form.confirmPassword) {
    error.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch(`/api/usuarios/${props.userId}/password`, {
      method: 'PUT',
      body: {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      },
    })

    addToast('Senha atualizada com sucesso!', 'success')
    info('USUARIOS', `Senha do usuário #${props.userId} atualizada`)
    emit('success')
  }
  catch (err) {
    const msg = err.data?.message || err.message || 'Erro ao atualizar senha.'
    addToast(msg, 'error')
    error.value = msg
    logError(
      'USUARIOS',
      `Erro ao atualizar senha do usuário #${props.userId}`,
      { error: msg },
    )
  }
  finally {
    loading.value = false
  }
}
</script>
