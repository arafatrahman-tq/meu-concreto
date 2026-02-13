<template>
  <div class="min-h-screen bg-background pb-32">
    <!-- Header -->
    <header
      class="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border px-6 py-6 flex items-center justify-between"
    >
      <button
        class="p-2 -ml-2 text-secondary hover:text-primary transition-colors"
        @click="navigateTo('/entregas')"
      >
        <ArrowLeft size="24" />
      </button>
      <div class="text-center">
        <h2 class="text-lg font-black tracking-tighter text-primary uppercase">
          Controle de Carga
        </h2>
        <p class="text-[9px] font-black text-brand uppercase tracking-[0.2em]">
          Execução Logística
        </p>
      </div>
      <div class="w-10" />
    </header>

    <main
      v-if="os"
      class="p-6 max-w-lg mx-auto space-y-8"
    >
      <!-- Info Card -->
      <div
        class="bg-surface border border-border rounded-3xl p-6 shadow-sm overflow-hidden relative"
      >
        <div class="absolute top-0 right-0 p-6 opacity-5 text-brand">
          <Truck size="80" />
        </div>
        <div class="relative z-10 flex flex-col gap-1">
          <span
            class="text-[10px] font-black text-secondary tracking-widest uppercase"
          >
            {{
              os.numeroTicket
                ? "Ticket " + os.numeroTicket
                : "Carga #" + String(os.id).padStart(4, "0")
            }}
          </span>
          <h1
            class="text-2xl font-black text-primary tracking-tighter uppercase leading-none mt-1"
          >
            {{ os.orcamento?.nomeCliente || "Cliente não identificado" }}
          </h1>
          <p
            class="text-xs font-bold text-secondary mt-2 flex items-center gap-2"
          >
            <MapPin
              size="14"
              class="text-brand"
            />
            {{ os.orcamento?.enderecoEntrega || "Retirada na Usina" }}
          </p>
          <div class="mt-4 flex gap-4 border-t border-border pt-4">
            <div>
              <p
                class="text-[8px] font-black text-secondary uppercase tracking-widest"
              >
                Produto
              </p>
              <p class="text-xs font-black text-primary uppercase">
                {{ os.orcamento?.produtoNome || "Concreto" }}
              </p>
            </div>
            <div>
              <p
                class="text-[8px] font-black text-secondary uppercase tracking-widest"
              >
                Volume Carga
              </p>
              <p class="text-xs font-black text-primary uppercase">
                {{ os.qtd }} m³
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons (Steps) -->
      <div class="grid grid-cols-1 gap-4">
        <button
          v-for="step in executionSteps"
          :key="step.tipo"
          :disabled="isStepDisabled(step.tipo) || loadingStep === step.tipo"
          class="relative overflow-hidden group p-6 rounded-[2rem] border transition-all flex items-center justify-between disabled:opacity-50 disabled:grayscale"
          :class="[
            isStepCompleted(step.tipo)
              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'
              : 'bg-surface border-border hover:border-brand/30 text-primary',
          ]"
          @click="registerEvent(step.tipo)"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
              :class="
                isStepCompleted(step.tipo)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary/5 group-hover:bg-brand/10 group-hover:text-brand'
              "
            >
              <component
                :is="getIcon(step.icon)"
                size="24"
              />
            </div>
            <div class="text-left">
              <span
                class="text-[10px] font-black uppercase tracking-widest block opacity-40"
              >{{ step.labelSmall }}</span>
              <span class="text-sm font-black uppercase tracking-tight">{{
                step.label
              }}</span>
            </div>
          </div>

          <div
            v-if="isStepCompleted(step.tipo)"
            class="flex flex-col items-end"
          >
            <CheckCircle
              size="20"
              class="text-emerald-500"
            />
            <span class="text-[9px] font-black mt-1 opacity-60">{{
              formatTime(getEventTime(step.tipo))
            }}</span>
          </div>
          <div
            v-else-if="loadingStep === step.tipo"
            class="w-5 h-5 border-2 border-brand/20 border-t-brand rounded-full animate-spin"
          />
          <ChevronRight
            v-else
            size="20"
            class="opacity-20"
          />
        </button>
      </div>

      <!-- Timeline / History -->
      <div
        v-if="eventos.length > 0"
        class="space-y-4"
      >
        <h3
          class="text-[10px] font-black text-secondary uppercase tracking-[0.3em] ml-2"
        >
          Histórico da Carga
        </h3>
        <div class="space-y-3">
          <div
            v-for="evento in eventos"
            :key="evento.id"
            class="bg-surface/50 border border-border/50 rounded-2xl p-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-2 h-2 rounded-full"
                :class="getEventStatusColor(evento.tipo)"
              />
              <span
                class="text-[10px] font-black uppercase tracking-tight text-primary"
              >{{ getEventLabel(evento.tipo) }}</span>
            </div>
            <span class="text-[10px] font-bold text-secondary tabular-nums">{{
              new Date(evento.timestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Finalized state -->
    <div
      v-if="isFinalized"
      class="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500"
    >
      <div
        class="w-24 h-24 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8 animate-bounce"
      >
        <CheckCircle size="48" />
      </div>
      <h2
        class="text-3xl font-black text-primary tracking-tighter uppercase leading-none"
      >
        Carga <br>
        Concluída!
      </h2>
      <p class="text-secondary text-sm font-medium mt-4 max-w-xs">
        O ciclo de entrega foi finalizado e os tempos foram salvos no sistema.
      </p>
      <button
        class="mt-12 px-12 py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        @click="navigateTo('/entregas')"
      >
        Voltar para Listagem
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  Truck,
  MapPin,
  ChevronRight,
  Play,
  Map,
  Download,
  CheckCircle,
  RotateCcw,
  Clock,
  Navigation,
} from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const { user } = useAuth()
const toast = useToast()

const os = ref(null)
const eventos = ref([])
const loadingStep = ref(null)

const executionSteps = [
  {
    tipo: 'SAIDA_USINA',
    label: 'Saída da Usina',
    labelSmall: 'Fase 1',
    icon: 'Play',
  },
  {
    tipo: 'CHEGADA_OBRA',
    label: 'Chegou na Obra',
    labelSmall: 'Fase 2',
    icon: 'Navigation',
  },
  {
    tipo: 'INICIO_DESCARGA',
    label: 'Início Descarga',
    labelSmall: 'Fase 3',
    icon: 'Download',
  },
  {
    tipo: 'FIM_DESCARGA',
    label: 'Fim Descarga',
    labelSmall: 'Fase 4',
    icon: 'CheckCircle',
  },
  {
    tipo: 'RETORNO_USINA',
    label: 'Retorno à Usina',
    labelSmall: 'Ciclo Final',
    icon: 'RotateCcw',
  },
]

const loadData = async () => {
  try {
    const data = await $fetch(`/api/entregas/os/${route.params.id}`)
    os.value = data
    eventos.value = data.eventos || []
  }
  catch (e) {
    toast.add({
      title: 'Erro',
      description: 'Não foi possível carregar os dados da carga.',
      type: 'error',
    })
  }
}

onMounted(loadData)

const isStepCompleted = tipo => eventos.value.some(e => e.tipo === tipo)
const getEventTime = tipo =>
  eventos.value.find(e => e.tipo === tipo)?.timestamp

const isStepDisabled = (tipo) => {
  if (isStepCompleted(tipo)) return true
  const index = executionSteps.findIndex(s => s.tipo === tipo)
  if (index === 0) return false
  return !isStepCompleted(executionSteps[index - 1].tipo)
}

const isFinalized = computed(() => isStepCompleted('RETORNO_USINA'))

const registerEvent = async (tipo) => {
  loadingStep.value = tipo
  try {
    // Obter geolocalização se possível
    let lat = null,
      lng = null
    if ('geolocation' in navigator) {
      const pos = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
          timeout: 5000,
        })
      })
      if (pos) {
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      }
    }

    await $fetch(`/api/orcamentos/${os.value.idOrcamento}/eventos`, {
      method: 'POST',
      body: {
        tipo,
        lat,
        lng,
        idOrdemServico: os.value.id,
        idUsuario: user.value?.id,
      },
    })

    toast.add({
      title: 'Sucesso',
      description: 'Evento registrado com sucesso!',
      type: 'success',
    })
    await loadData()
  }
  catch (e) {
    toast.add({
      title: 'Erro',
      description: 'Não foi possível registrar o evento.',
      type: 'error',
    })
  }
  finally {
    loadingStep.value = null
  }
}

const getIcon = (name) => {
  const icons = { Play, MapPin, Download, CheckCircle, RotateCcw, Navigation }
  return icons[name] || Truck
}

const formatTime = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getEventLabel = tipo =>
  executionSteps.find(s => s.tipo === tipo)?.label || tipo
const getEventStatusColor = (tipo) => {
  if (tipo.startsWith('FIM') || tipo.includes('RETORNO'))
    return 'bg-emerald-400'
  if (tipo.includes('INICIO')) return 'bg-amber-400'
  return 'bg-brand'
}

definePageMeta({ layout: false })
</script>
