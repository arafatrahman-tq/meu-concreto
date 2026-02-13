<template>
  <div
    class="min-h-screen bg-background p-6 flex flex-col items-center justify-center"
  >
    <div class="w-full max-w-sm space-y-12">
      <!-- Logo/Header -->
      <div class="text-center space-y-4">
        <div
          class="w-20 h-20 bg-brand/10 text-brand rounded-[2rem] flex items-center justify-center mx-auto mb-6"
        >
          <Truck
            size="40"
            stroke-width="2.5"
          />
        </div>
        <h1
          class="text-4xl font-black text-primary tracking-tighter uppercase leading-none"
        >
          Controle de<br>Carga
        </h1>
        <p
          class="text-xs font-black text-secondary tracking-[0.2em] uppercase opacity-40"
        >
          Área do Motorista
        </p>
      </div>

      <!-- PIN Input Area -->
      <div
        v-if="!motorista"
        class="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700"
      >
        <div class="space-y-2 text-center">
          <label
            class="text-[10px] font-black text-secondary uppercase tracking-widest"
          >Digite seu PIN de 4 dígitos</label>
          <div class="flex justify-center gap-3">
            <input
              v-for="i in 4"
              :id="'pin-' + i"
              :key="i"
              v-model="pinDigits[i - 1]"
              type="password"
              inputmode="numeric"
              maxlength="1"
              class="w-14 h-20 bg-surface border-2 border-border rounded-2xl text-center text-2xl font-black text-primary focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none"
              @input="handlePinInput(i)"
              @keydown.delete="handlePinDelete(i)"
            >
          </div>
        </div>

        <button
          :disabled="pin.length < 4 || loading"
          class="w-full py-6 bg-primary text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3"
          @click="validatePin"
        >
          <span
            v-if="loading"
            class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
          />
          {{ loading ? "Validando..." : "Acessar Cargas" }}
        </button>
      </div>

      <!-- Cargas List Area -->
      <div
        v-else
        class="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500"
      >
        <div
          class="flex items-center justify-between pb-6 border-b border-border"
        >
          <div class="flex flex-col">
            <span
              class="text-[10px] font-black text-brand uppercase tracking-widest"
            >Bem-vindo,</span>
            <span
              class="text-xl font-black text-primary uppercase tracking-tight"
            >{{ motorista.nome }}</span>
          </div>
          <button
            class="p-3 bg-primary/2 text-secondary rounded-2xl hover:text-danger hover:bg-danger/5 transition-all"
            @click="logout"
          >
            <LogOut size="20" />
          </button>
        </div>

        <div class="space-y-4">
          <h3
            class="text-[10px] font-black text-secondary uppercase tracking-[0.3em] ml-2"
          >
            Suas Cargas de Hoje
          </h3>

          <div
            v-if="cargas.length === 0"
            class="p-12 text-center bg-surface rounded-3xl border border-dashed border-border"
          >
            <p
              class="text-[10px] font-black text-secondary uppercase opacity-40"
            >
              Nenhuma carga vinculada para hoje.
            </p>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <button
              v-for="carga in cargas"
              :key="carga.id"
              class="w-full p-6 bg-surface border border-border rounded-3xl text-left hover:border-brand/30 transition-all group relative active:scale-[0.98]"
              @click="navigateTo(`/entregas/${carga.id}`)"
            >
              <div class="flex items-center justify-between mb-4">
                <span
                  class="text-[9px] font-black text-brand uppercase tracking-widest"
                >Entrega {{ formatTime(carga.dataEntrega) }}</span>
                <span
                  class="text-[9px] font-black text-secondary opacity-20 uppercase tracking-widest"
                >#{{ String(carga.id).padStart(4, "0") }}</span>
              </div>
              <h4
                class="text-lg font-black text-primary uppercase tracking-tight leading-tight group-hover:text-brand transition-colors"
              >
                {{ carga.nomeCliente }}
              </h4>
              <div
                class="flex items-center gap-2 mt-2 text-secondary opacity-60"
              >
                <MapPin size="12" />
                <span class="text-[10px] font-bold uppercase truncate">{{
                  carga.enderecoEntrega || "Sem endereço"
                }}</span>
              </div>
              <div class="mt-4 flex items-center justify-between">
                <div
                  class="flex items-center gap-2 px-3 py-2 bg-primary/2 rounded-xl"
                >
                  <Package
                    size="14"
                    class="text-brand"
                  />
                  <span class="text-[10px] font-black text-primary">{{ carga.qtd }} m³</span>
                </div>
                <ChevronRight
                  size="20"
                  class="text-brand opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Truck, MapPin, Package, ChevronRight, LogOut } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'

definePageMeta({ layout: false })

const toast = useToast()
const { info, error: logError } = useLogger()
const loading = ref(false)
const motorista = ref(null)
const cargas = ref([])
const pinDigits = ref(['', '', '', ''])

const pin = computed(() => pinDigits.value.join(''))

const handlePinInput = (index) => {
  if (pinDigits.value[index - 1] && index < 4) {
    document.getElementById(`pin-${index + 1}`).focus()
  }
  if (pin.value.length === 4) {
    validatePin()
  }
}

const handlePinDelete = (index) => {
  if (!pinDigits.value[index - 1] && index > 1) {
    document.getElementById(`pin-${index - 1}`).focus()
  }
}

const validatePin = async () => {
  if (pin.value.length !== 4) return

  loading.value = true
  try {
    const data = await $fetch('/api/entregas/motorista', {
      query: { pin: pin.value },
    })
    motorista.value = data.motorista
    cargas.value = data.cargas

    info('ENTREGAS', `Motorista ${data.motorista.nome} logou via PIN`, {
      motorista: data.motorista.id,
    })

    toast.add({
      title: 'Acesso Liberado',
      description: `Olá, ${data.motorista.nome}`,
      type: 'success',
    })
  }
  catch (e) {
    logError('ENTREGAS', 'Falha de acesso via PIN', { error: e.message })
    toast.add({
      title: 'Erro de Acesso',
      description: e.data?.statusMessage || 'PIN inválido',
      type: 'error',
    })
    pinDigits.value = ['', '', '', '']
    document.getElementById('pin-1').focus()
  }
  finally {
    loading.value = false
  }
}

const logout = () => {
  if (motorista.value) {
    info('ENTREGAS', `Motorista ${motorista.value.nome} desconectou-se`)
  }
  motorista.value = null
  cargas.value = []
  pinDigits.value = ['', '', '', '']
}

const formatTime = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  document.getElementById('pin-1')?.focus()
})
</script>
