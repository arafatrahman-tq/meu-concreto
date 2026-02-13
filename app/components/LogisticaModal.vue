<template>
  <BaseModal
    v-model="isOpen"
    title="Expedição Logística"
    subtitle="Gerenciamento de tickets e ordens de serviço"
    size="xl"
  >
    <div class="space-y-8 py-2">
      <!-- Budget Info Summary -->
      <div
        v-if="orcamento"
        class="bg-primary/2 p-6 rounded-3xl border border-border grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div class="space-y-1">
          <p
            class="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40"
          >
            Cliente
          </p>
          <p class="text-sm font-black text-primary uppercase truncate">
            {{ orcamento.nomeCliente }}
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40"
          >
            Produto
          </p>
          <p class="text-sm font-black text-primary uppercase truncate">
            {{ orcamento.produtoNome }}
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40"
          >
            Total Contratado
          </p>
          <p class="text-sm font-black text-brand uppercase">
            {{ orcamento.qtd }} m³
          </p>
        </div>
        <div class="space-y-1">
          <p
            class="text-[9px] font-black text-secondary uppercase tracking-widest opacity-40"
          >
            Volume Entregue
          </p>
          <p class="text-sm font-black text-emerald-500 uppercase">
            {{ volumeEntregue }} / {{ orcamento.qtd }} m³
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- New Ticket Form (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="flex items-center gap-2 mb-2">
            <Plus
              size="16"
              class="text-brand"
            />
            <h4
              class="text-[11px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Gerar Novo Ticket (OS)
            </h4>
          </div>

          <form
            class="space-y-5 bg-surface p-6 rounded-3xl border border-border"
            @submit.prevent="handleCreateOS"
          >
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label
                  class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                >Volume (m³) <span class="text-brand">*</span></label>
                <BaseInput
                  v-model.number="form.qtd"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  required
                />
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                >Slump (mm)</label>
                <BaseInput
                  v-model.number="form.slump"
                  type="number"
                  placeholder="120"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label
                class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
              >Motorista <span class="text-brand">*</span></label>
              <BaseSelect
                v-model="form.idMotorista"
                :options="motoristasOptions"
                placeholder="SELECIONE O MOTORISTA..."
                required
              />
            </div>

            <div class="space-y-1.5">
              <label
                class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
              >Caminhão (Betoneira) <span class="text-brand">*</span></label>
              <BaseSelect
                v-model="form.idCaminhao"
                :options="caminhoesOptions"
                placeholder="SELECIONE O VEÍCULO..."
                required
              />
            </div>

            <div class="space-y-1.5">
              <label
                class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
              >Equipamento de Bomba</label>
              <BaseSelect
                v-model="form.idBomba"
                :options="bombasOptions"
                placeholder="VINCULAR BOMBA (OPCIONAL)"
              />
            </div>

            <div class="pt-4">
              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-brand text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Truck size="18" />
                {{ loading ? "IMPRIMINDO TICKET..." : "LANÇAR VIAGEM" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Ticket List (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <ClipboardList
                size="16"
                class="text-brand"
              />
              <h4
                class="text-[11px] font-black uppercase tracking-[0.2em] text-primary"
              >
                Histórico de Carregamento
              </h4>
            </div>
            <span
              class="text-[10px] font-black text-secondary px-3 py-1 bg-primary/2 rounded-lg border border-border uppercase"
            >
              {{ ordens.length }} VIAGENS
            </span>
          </div>

          <div
            class="space-y-3 max-h-125 overflow-y-auto pr-2 custom-scrollbar"
          >
            <div
              v-for="os in ordens"
              :key="os.id"
              class="group bg-surface border border-border rounded-3xl p-5 hover:border-brand/30 transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span
                    class="text-xs font-black text-primary uppercase tabular-nums"
                  >#{{ os.numeroTicket }}</span>
                  <div
                    :class="[
                      'px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest',
                      statusColors[os.status] || 'bg-primary/5 text-secondary',
                    ]"
                  >
                    {{ os.status }}
                  </div>
                </div>
                <span
                  class="text-[10px] font-bold text-secondary opacity-40 tabular-nums"
                >
                  {{ formatDate(os.createdAt) }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-1">
                  <p
                    class="text-[8px] font-black text-secondary uppercase tracking-widest opacity-40"
                  >
                    Motorista
                  </p>
                  <p
                    class="text-[11px] font-black text-primary uppercase truncate"
                  >
                    {{ os.motorista?.nome || "N/A" }}
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-[8px] font-black text-secondary uppercase tracking-widest opacity-40"
                  >
                    Veículo
                  </p>
                  <p class="text-[11px] font-black text-primary uppercase">
                    {{ os.caminhao?.placa || "N/A" }}
                  </p>
                </div>
                <div class="space-y-1 text-right">
                  <p
                    class="text-[8px] font-black text-secondary uppercase tracking-widest opacity-40"
                  >
                    Saída
                  </p>
                  <p class="text-[11px] font-black text-brand uppercase">
                    {{ os.qtd }} m³
                  </p>
                </div>
              </div>

              <div
                class="mt-4 pt-4 border-t border-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-500" />
                  <span
                    class="text-[9px] font-black text-emerald-500 uppercase tracking-widest cursor-pointer hover:underline"
                    @click="openTracker(os.id)"
                  >
                    Rastrear Caminhão
                  </span>
                </div>
                <div class="flex gap-2">
                  <button
                    class="p-2 bg-primary/2 text-secondary rounded-lg hover:text-brand transition-colors"
                  >
                    <Printer size="14" />
                  </button>
                  <button
                    class="p-2 bg-primary/2 text-secondary rounded-lg hover:text-red-500 transition-colors"
                    @click="handleDeleteOS(os.id)"
                  >
                    <Trash2 size="14" />
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="ordens.length === 0"
              class="py-20 text-center bg-primary/2 rounded-3xl border border-dashed border-border opacity-40"
            >
              <Truck
                size="48"
                class="mx-auto mb-4 opacity-10"
              />
              <p class="text-[10px] font-black uppercase tracking-widest">
                Nenhuma OS gerada para este pedido
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Truck,
  Plus,
  ClipboardList,
  Package,
  Printer,
  Trash2,
  Search,
  MapPin,
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const props = defineProps({
  orcamento: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'updated'])

const isOpen = ref(true)
const loading = ref(false)
const ordens = ref([])
const toast = useToast()

const form = reactive({
  idOrcamento: props.orcamento.id,
  qtd: props.orcamento.qtd,
  slump: 120,
  idMotorista: null,
  idCaminhao: null,
  idBomba: props.orcamento.idBomba || null,
})

// Data options
const { data: motoristas } = useFetch('/api/motoristas')
const { data: caminhoes } = useFetch('/api/caminhoes')
const { data: bombas } = useFetch('/api/bombas')

const motoristasOptions = computed(
  () => motoristas.value?.map(m => ({ label: m.nome, value: m.id })) || [],
)
const caminhoesOptions = computed(
  () =>
    caminhoes.value?.map(c => ({
      label: `${c.placa} (${c.capacidade}m³)`,
      value: c.id,
    })) || [],
)
const bombasOptions = computed(
  () => bombas.value?.map(b => ({ label: b.nome, value: b.id })) || [],
)

const volumeEntregue = computed(() => {
  return ordens.value.reduce((acc, os) => acc + (os.qtd || 0), 0)
})

const statusColors = {
  AGUARDANDO_SAIDA: 'bg-amber-500/10 text-amber-600',
  EM_TRANSITO: 'bg-blue-500/10 text-blue-600',
  DESCARREGANDO: 'bg-cyan-500/10 text-cyan-600',
  CONCLUIDA: 'bg-emerald-500/10 text-emerald-600',
  CANCELADA: 'bg-rose-500/10 text-rose-600',
}

const loadOrdens = async () => {
  try {
    const data = await $fetch('/api/entregas/os', {
      query: { idOrcamento: props.orcamento.id },
    })
    ordens.value = data
  }
  catch (e) {
    console.error(e)
  }
}

onMounted(loadOrdens)

const handleCreateOS = async () => {
  if (volumeEntregue.value + form.qtd > props.orcamento.qtd + 0.5) {
    // Tolerância de 0.5m³
    if (
      !confirm(
        'O volume total dos tickets ultrapassa o orçamento. Deseja continuar?',
      )
    )
      return
  }

  loading.value = true
  try {
    await $fetch('/api/entregas/os', {
      method: 'POST',
      body: {
        ...form,
        idEmpresa: props.orcamento.idEmpresa,
      },
    })
    toast.add({
      title: 'Ticket Gerado',
      description: 'Ordem de serviço enviada para o motorista.',
      type: 'success',
    })
    await loadOrdens()
    emit('updated')

    // Reset form for next ticket, keeping logistics defaults
    form.qtd = Math.max(0, props.orcamento.qtd - volumeEntregue.value)
  }
  catch (e) {
    toast.add({
      title: 'Falha na Expedição',
      description: 'Verifique se todos os campos estão preenchidos.',
      type: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

const handleDeleteOS = async (id) => {
  if (!confirm('Deseja cancelar e excluir este ticket?')) return
  try {
    // Implement DELETE endpoint or update status to CANCELADA
    // for now just status update
    await $fetch(`/api/entregas/os/${id}`, {
      method: 'PUT',
      body: { status: 'CANCELADA' },
    })
    await loadOrdens()
  }
  catch (e) {}
}

const formatDate = (date) => {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const openTracker = (id) => {
  navigateTo(`/entregas/${id}`)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}
</style>
