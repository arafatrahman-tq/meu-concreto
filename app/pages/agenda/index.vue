<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Agenda de Entregas
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Planejamento logístico e cronograma de concretagem
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-surface p-1 rounded-2xl border border-border flex">
          <button
            v-for="view in ['Calendário', 'Lista']"
            :key="view"
            class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="
              currentView === view
                ? 'bg-primary text-background shadow-lg'
                : 'text-secondary opacity-40 hover:opacity-100'
            "
            @click="currentView = view"
          >
            {{ view }}
          </button>
        </div>
      </div>
    </div>

    <!-- Calendário View -->
    <div
      v-if="currentView === 'Calendário'"
      class="flex flex-col gap-6"
    >
      <!-- Calendar Strip -->
      <div
        class="bg-surface rounded-3xl border border-border p-8 shadow-sm overflow-hidden"
      >
        <div class="flex items-center justify-between mb-10 px-4">
          <button
            class="p-3 rounded-2xl bg-primary/2 hover:bg-primary/5 transition-all text-primary"
            @click="prevWeek"
          >
            <ChevronLeft size="20" />
          </button>
          <h3
            class="text-xl font-black uppercase tracking-tighter text-primary"
          >
            {{ currentMonthYear }}
          </h3>
          <button
            class="p-3 rounded-2xl bg-primary/2 hover:bg-primary/5 transition-all text-primary"
            @click="nextWeek"
          >
            <ChevronRight size="20" />
          </button>
        </div>

        <div
          class="flex justify-between gap-4 overflow-x-auto pb-4 custom-scrollbar"
        >
          <div
            v-for="day in weekDays"
            :key="day.dateStr"
            class="flex flex-col items-center gap-3 p-6 rounded-3xl transition-all cursor-pointer min-w-30 group relative border-2 border-transparent"
            :class="[
              selectedDate === day.dateStr
                ? 'bg-brand text-white shadow-2xl shadow-brand/20 scale-105'
                : 'bg-primary/2 text-secondary hover:bg-primary/4',
              draggedEventId ? 'border-dashed border-brand/30' : '',
            ]"
            @click="selectedDate = day.dateStr"
            @dragover.prevent
            @drop="handleDropOnDate(day.dateStr)"
          >
            <span
              class="font-black opacity-40 text-[10px] uppercase tracking-[0.2em] group-hover:opacity-100 transition-opacity"
            >
              {{ day.label }}
            </span>
            <span class="font-black text-3xl tabular-nums">{{ day.day }}</span>
            <div
              v-if="day.hasEvents && selectedDate !== day.dateStr"
              class="absolute bottom-4 w-1.5 h-1.5 rounded-full bg-brand animate-pulse"
            />
          </div>
        </div>
      </div>

      <!-- Daily Agenda -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <!-- Timeline/Events (Left 8 cols) -->
        <div class="xl:col-span-8 space-y-8">
          <div class="flex items-center gap-3 px-2">
            <div class="w-2 h-2 rounded-full bg-brand" />
            <h4
              class="text-[10px] font-black uppercase tracking-[0.3em] text-primary"
            >
              Programação do Dia
            </h4>
            <div class="flex-1 h-px bg-border ml-2" />
          </div>

          <div
            v-if="pending"
            class="flex flex-col items-center justify-center py-20 opacity-20"
          >
            <div
              class="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-4"
            />
            <span class="text-[10px] font-black uppercase tracking-widest">Sincronizando logistica...</span>
          </div>

          <div
            v-else-if="dailyEvents.length === 0"
            class="flex flex-col items-center justify-center py-32 bg-primary/2 rounded-3xl border border-dashed border-border group"
          >
            <div
              class="p-8 rounded-full bg-primary/2 mb-6 group-hover:scale-110 transition-transform"
            >
              <CalendarX
                size="48"
                class="text-secondary opacity-20"
              />
            </div>
            <p
              class="text-[11px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Sem entregas programadas para este dia
            </p>
          </div>

          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="hour in timelineHours"
              :key="hour"
              class="relative flex gap-8 group/hour"
              @dragover.prevent
              @drop="handleDropOnHour(hour)"
            >
              <!-- Hour Marker -->
              <div class="flex flex-col items-end min-w-16 py-4">
                <span class="text-sm font-black text-primary tabular-nums">{{ hour }}:00</span>
                <div class="w-1 h-1 rounded-full bg-border mt-2" />
              </div>

              <!-- Drop Zone / Line -->
              <div
                class="flex-1 border-l-2 border-border/50 pl-8 pb-8 group-hover/hour:border-brand/30 transition-colors"
              >
                <div
                  v-if="getEventsByHour(hour).length > 0"
                  class="space-y-4"
                >
                  <div
                    v-for="event in getEventsByHour(hour)"
                    :key="event.id"
                    draggable="true"
                    class="group/item bg-surface rounded-2xl p-6 border border-border hover:border-brand shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all cursor-move relative"
                    @dragstart="handleDragStart($event, event.id)"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="p-2 bg-primary/2 text-secondary rounded-lg">
                          <GripVertical size="14" />
                        </div>
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-brand"
                        >
                          {{ formatTime(event.dataEntrega) }}
                        </span>
                        <span
                          :class="[
                            'px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest',
                            event.status === 'CONCLUIDO'
                              ? 'bg-blue-500/10 text-blue-500'
                              : event.status === 'APROVADO'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-500',
                          ]"
                        >
                          {{
                            event.status === "CONCLUIDO"
                              ? "ENTREGUE"
                              : event.status === "APROVADO"
                                ? "CONFIRMADO"
                                : "PENDENTE"
                          }}
                        </span>
                      </div>
                      <span
                        class="text-[9px] font-black text-secondary opacity-30 tracking-widest italic"
                      >
                        #{{ String(event.id).padStart(4, "0") }}
                      </span>
                    </div>

                    <div
                      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div class="space-y-1">
                        <h5
                          class="text-sm font-black uppercase text-primary group-hover/item:text-brand transition-colors"
                        >
                          {{ event.nomeCliente }}
                        </h5>
                        <div
                          class="flex items-center gap-2 text-secondary opacity-60"
                        >
                          <MapPin size="12" />
                          <span class="text-[10px] font-bold uppercase">{{
                            event.enderecoEntrega || "Endereço não informado"
                          }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <button
                          class="flex items-center gap-2 px-6 py-3 bg-brand/10 text-brand rounded-xl hover:bg-brand hover:text-white transition-all"
                          @click="handleExecutar(event)"
                        >
                          <Truck size="16" />
                          <span
                            class="text-[10px] font-black uppercase tracking-widest"
                          >Expedição</span>
                        </button>
                        <div
                          class="flex items-center gap-2 px-4 py-2 bg-primary/2 rounded-xl"
                        >
                          <Package
                            size="14"
                            class="text-brand"
                          />
                          <span class="text-xs font-black text-primary">{{ event.qtd }} m³</span>
                          <div
                            v-if="event.produtoNome"
                            class="flex items-center gap-2"
                          >
                            <div class="w-1 h-1 rounded-full bg-border" />
                            <span
                              class="text-[10px] font-black text-secondary uppercase"
                            >{{ event.produtoNome }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Logistics info (Truck & Driver) -->
                    <div
                      v-if="event.caminhao || event.motorista"
                      class="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-4"
                    >
                      <div
                        v-if="event.caminhao"
                        class="flex items-center gap-2"
                      >
                        <Truck
                          size="14"
                          class="text-secondary opacity-40"
                        />
                        <span
                          class="text-[10px] font-black uppercase text-secondary tracking-tight"
                        >
                          {{ event.caminhao.placa }} -
                          {{ event.caminhao.modelo }}
                        </span>
                      </div>
                      <div
                        v-if="event.motorista"
                        class="flex items-center gap-2"
                      >
                        <User
                          size="14"
                          class="text-secondary opacity-40"
                        />
                        <span
                          class="text-[10px] font-black uppercase text-secondary tracking-tight"
                        >
                          {{ event.motorista.nome }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty Hour Placeholder -->
                <div
                  v-else
                  class="h-4 group-hover/hour:h-12 transition-all flex items-center"
                >
                  <span
                    class="hidden group-hover/hour:block text-[8px] font-black uppercase tracking-[0.3em] text-brand/30"
                  >Livre</span>
                </div>
              </div>
            </div>

            <!-- Extra Hours Events -->
            <div
              v-if="unscheduledEvents.length > 0"
              class="mt-10 pt-10 border-t border-dashed border-border"
            >
              <div class="flex items-center gap-3 mb-6 px-2">
                <Clock
                  size="16"
                  class="text-secondary opacity-40"
                />
                <h4
                  class="text-[9px] font-black uppercase tracking-[0.3em] text-secondary opacity-40"
                >
                  Entregas Fora do Horário Comercial
                </h4>
              </div>
              <div class="space-y-4 ml-24">
                <div
                  v-for="event in unscheduledEvents"
                  :key="event.id"
                  draggable="true"
                  class="group/item bg-surface rounded-2xl p-6 border border-border hover:border-brand shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all cursor-move relative"
                  @dragstart="handleDragStart($event, event.id)"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-primary/2 text-secondary rounded-lg">
                        <GripVertical size="14" />
                      </div>
                      <span
                        class="text-[9px] font-black uppercase tracking-widest text-brand"
                      >
                        {{ formatTime(event.dataEntrega) }}
                      </span>
                    </div>
                    <span
                      class="text-[9px] font-black text-secondary opacity-30 tracking-widest italic"
                    >
                      #{{ String(event.id).padStart(4, "0") }}
                    </span>
                  </div>
                  <h5 class="text-sm font-black uppercase text-primary">
                    {{ event.nomeCliente }}
                  </h5>
                  <p
                    class="text-[10px] font-bold text-secondary uppercase mt-2"
                  >
                    {{ event.produtoNome }} - {{ event.qtd }} m³
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats / Filters (Right 4 cols) -->
        <div class="xl:col-span-4 space-y-8">
          <div
            class="bg-primary p-10 rounded-3xl shadow-2xl shadow-primary/10 relative overflow-hidden group"
          >
            <div class="relative z-10 space-y-6">
              <div>
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.3em] text-background/40 mb-2"
                >
                  Volume Total do Dia
                </h4>
                <div class="flex items-end gap-2">
                  <span
                    class="text-5xl font-black tracking-tighter text-background"
                  >{{ totalVolume }}</span>
                  <span
                    class="text-xl font-bold opacity-40 mb-1 text-background"
                  >m³</span>
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-4 pt-6 border-t border-background/10"
              >
                <div>
                  <span
                    class="text-[9px] font-black uppercase tracking-widest text-background/40 block mb-1"
                  >Entregas</span>
                  <span class="text-xl font-black text-background">{{
                    dailyEvents.length
                  }}</span>
                </div>
                <div>
                  <span
                    class="text-[9px] font-black uppercase tracking-widest text-background/40 block mb-1"
                  >Pendente</span>
                  <span class="text-xl font-black text-background">{{
                    dailyEvents.filter((e) => e.status !== "APROVADO").length
                  }}</span>
                </div>
              </div>
            </div>
            <Zap
              size="120"
              class="absolute -right-8 -top-8 text-background/5 group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          <div
            class="bg-surface rounded-3xl border border-border p-10 space-y-8"
          >
            <div class="flex items-center gap-3">
              <Filter
                size="18"
                class="text-brand"
              />
              <h4
                class="text-[10px] font-black uppercase tracking-widest text-primary"
              >
                Filtros Avançados
              </h4>
            </div>

            <div class="space-y-6">
              <div class="space-y-3">
                <label
                  class="text-[9px] font-black uppercase tracking-widest opacity-40"
                >Status da Entrega</label>
                <div class="flex flex-col gap-2">
                  <label
                    v-for="s in ['Todos', 'Confirmados', 'Pendentes']"
                    :key="s"
                    class="flex items-center gap-3 p-3 rounded-2xl border border-transparent hover:bg-primary/2 cursor-pointer transition-all"
                  >
                    <input
                      v-model="statusFilter"
                      type="radio"
                      :value="s"
                      class="accent-brand w-4 h-4"
                    >
                    <span class="text-xs font-bold text-primary">{{ s }}</span>
                  </label>
                </div>
              </div>

              <div class="pt-6 border-t border-border">
                <button
                  class="w-full py-4 bg-primary/2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
                  @click="refresh"
                >
                  <RefreshCw
                    size="14"
                    :class="{ 'animate-spin': pending }"
                  />
                  Sincronizar Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista View -->
    <div
      v-else
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden animate-enter"
    >
      <BaseTable
        :headers="[
          'Data',
          'Horário',
          'Cliente',
          'Produto / Volume',
          'Logística',
          'Status',
          '',
        ]"
      >
        <tr
          v-for="event in sortedEvents"
          :key="event.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span
                class="text-xs font-black uppercase text-primary tracking-tight"
              >
                {{
                  new Date(event.dataEntrega).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }}
              </span>
              <span
                class="text-[9px] font-bold text-secondary opacity-40 uppercase tracking-widest"
              >
                {{
                  new Date(event.dataEntrega).toLocaleDateString("pt-BR", {
                    weekday: "short",
                  })
                }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5">
            <span class="text-sm font-black text-brand tabular-nums">
              {{ formatTime(event.dataEntrega) }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span class="text-sm font-black uppercase text-primary">{{
                event.nomeCliente
              }}</span>
              <div
                class="flex items-center gap-1 text-[9px] text-secondary opacity-60 uppercase font-bold"
              >
                <MapPin size="10" />
                <span>{{ event.bairro || "Endereço não informado" }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-primary uppercase">{{
                event.produtoNome
              }}</span>
              <span class="text-xs font-black text-brand">{{ event.qtd }} m³</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-1">
              <div
                v-if="event.motorista"
                class="flex items-center gap-2"
              >
                <User
                  size="12"
                  class="text-secondary opacity-40"
                />
                <span
                  class="text-[9px] font-black uppercase text-secondary tracking-tight"
                >{{ event.motorista.nome }}</span>
              </div>
              <div
                v-if="event.caminhao"
                class="flex items-center gap-2"
              >
                <Truck
                  size="12"
                  class="text-secondary opacity-40"
                />
                <span
                  class="text-[9px] font-black uppercase text-secondary tracking-tight"
                >{{ event.caminhao.placa }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <span
              :class="[
                'px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest',
                event.status === 'CONCLUIDO'
                  ? 'bg-blue-500/10 text-blue-500'
                  : event.status === 'APROVADO'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500 shadow-sm',
              ]"
            >
              {{
                event.status === "CONCLUIDO"
                  ? "ENTREGUE"
                  : event.status === "APROVADO"
                    ? "CONFIRMADO"
                    : "PENDENTE"
              }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center justify-end gap-2">
              <button
                class="p-2.5 rounded-xl bg-primary/2 text-secondary hover:text-brand hover:bg-white border border-transparent hover:border-border transition-all shadow-sm"
                @click="handleExecutar(event)"
              >
                <Truck size="16" />
              </button>
            </div>
          </td>
        </tr>

        <!-- Empty State List -->
        <tr v-if="!sortedEvents.length">
          <td
            colspan="7"
            class="py-32 text-center"
          >
            <div class="flex flex-col items-center justify-center opacity-20">
              <CalendarX
                size="48"
                class="mb-4"
              />
              <p class="text-[10px] font-black uppercase tracking-widest">
                Nenhuma entrega agendada no período
              </p>
            </div>
          </td>
        </tr>
      </BaseTable>
    </div>

    <LogisticaModal
      v-if="showLogisticaModal"
      :orcamento="orcamentoSelecionado"
      @close="showLogisticaModal = false"
      @updated="refresh"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  ExternalLink,
  Truck,
  Zap,
  Filter,
  RefreshCw,
  CalendarX,
  Clock,
  GripVertical,
  User,
} from 'lucide-vue-next'
import { useFetch, navigateTo } from '#imports'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'

definePageMeta({ layout: 'default' })

const { add: addToast } = useToast()
const { info, error: logError } = useLogger()
const currentView = ref('Calendário')
const statusFilter = ref('Todos')
const selectedDate = useState(
  'agenda_selected_date',
  () => new Date().toISOString().split('T')[0],
)
const weekOffset = ref(0)
const showLogisticaModal = ref(false)
const orcamentoSelecionado = ref(null)

const handleExecutar = async (event) => {
  try {
    // Buscamos o orçamento completo para garantir que temos todos os dados (idEmpresa, idBomba, etc)
    const data = await $fetch(`/api/orcamentos/${event.id}`)
    orcamentoSelecionado.value = data
    showLogisticaModal.value = true
    info('LOGISTICA', `Iniciando controle logístico para #${event.id}`, {
      cliente: event.nomeCliente,
    })
  }
  catch (e) {
    logError(
      'LOGISTICA',
      `Falha ao carregar orçamento #${event.id} na agenda`,
      {
        error: e.message,
      },
    )
    addToast({
      title: 'Erro',
      description: 'Não foi possível carregar os dados do orçamento.',
      type: 'error',
    })
  }
}
// Helper para calcular as datas da semana de forma isolada
const weekDates = computed(() => {
  const dates = []
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + weekOffset.value * 7)

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
})

// Data Fetching
const {
  data: events,
  pending,
  refresh,
} = await useFetch('/api/entregas', {
  query: computed(() => ({
    start: weekDates.value[0],
    end: weekDates.value[6],
  })),
})

const weekDays = computed(() => {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return weekDates.value.map((dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return {
      label: labels[d.getDay()],
      day: d.getDate(),
      dateStr,
      hasEvents: events.value?.some(
        e =>
          e.dataEntrega
          && new Date(e.dataEntrega).toISOString().split('T')[0] === dateStr,
      ),
    }
  })
})

const currentMonthYear = computed(() => {
  const midDate = new Date(weekDays.value[3].dateStr)
  return midDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
})

const dailyEvents = computed(() => {
  if (!events.value) return []
  return events.value.filter((e) => {
    const eDate = new Date(e.dataEntrega).toISOString().split('T')[0]
    const matchesDate = eDate === selectedDate.value

    if (statusFilter.value === 'Confirmados')
      return matchesDate && e.status === 'APROVADO'
    if (statusFilter.value === 'Pendentes')
      return matchesDate && e.status !== 'APROVADO'
    return matchesDate
  })
})

const totalVolume = computed(() => {
  return dailyEvents.value
    .reduce((acc, curr) => acc + (curr.qtd || 0), 0)
    .toFixed(1)
})

const sortedEvents = computed(() => {
  if (!events.value) return []
  return [...events.value].sort(
    (a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega),
  )
})

const prevWeek = () => weekOffset.value--
const nextWeek = () => weekOffset.value++

const formatTime = (date) => {
  if (!date) return '--:--'
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Timeline Hours
const timelineHours = [
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
]

const getEventsByHour = (hour) => {
  return dailyEvents.value.filter((e) => {
    const time = new Date(e.dataEntrega)
    return time.getHours().toString().padStart(2, '0') === hour
  })
}

const unscheduledEvents = computed(() => {
  return dailyEvents.value.filter((e) => {
    const hour = new Date(e.dataEntrega).getHours().toString().padStart(2, '0')
    return !timelineHours.includes(hour)
  })
})

// Drag and Drop Logic
const draggedEventId = ref(null)

const handleDragStart = (e, eventId) => {
  draggedEventId.value = eventId
  e.dataTransfer.effectAllowed = 'move'
  // Adiciona uma classe visual ou preview se necessário
}

const handleDropOnHour = async (hour) => {
  if (!draggedEventId.value) return

  const event = events.value.find(e => e.id === draggedEventId.value)
  if (!event) return

  const newDate = new Date(selectedDate.value + 'T00:00:00')
  newDate.setHours(parseInt(hour))
  newDate.setMinutes(0)

  await updateEntregaDate(event.id, newDate)
  draggedEventId.value = null
}

const handleDropOnDate = async (dateStr) => {
  if (!draggedEventId.value) return

  const event = events.value.find(e => e.id === draggedEventId.value)
  if (!event) return

  const oldDate = new Date(event.dataEntrega)
  const newDate = new Date(dateStr + 'T00:00:00')
  newDate.setHours(oldDate.getHours())
  newDate.setMinutes(oldDate.getMinutes())

  await updateEntregaDate(event.id, newDate)
  draggedEventId.value = null
}

const updateEntregaDate = async (id, date) => {
  try {
    await $fetch(`/api/orcamentos/${id}`, {
      method: 'PUT',
      body: { dataEntrega: date },
    })

    info('LOGISTICA', `Entrega reprogramada para orçamento #${id}`, {
      nova_data: date,
    })

    addToast({
      title: 'Agenda Atualizada',
      description: 'Horário de entrega reprogramado com sucesso.',
      type: 'success',
    })

    await refresh()
  }
  catch (e) {
    logError('LOGISTICA', `Erro ao reprogramar entrega #${id}`, {
      error: e.message,
    })
    addToast({
      title: 'Erro ao mover',
      description: 'Não foi possível atualizar a data da entrega.',
      type: 'error',
    })
  }
}
</script>

<style scoped>
.animate-enter {
  animation: enter 0.4s cubic-bezier(0.2, 0, 0, 1) forwards;
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

[draggable="true"] {
  -webkit-user-drag: element;
}

[draggable="true"]:active {
  cursor: grabbing;
}

.group\/item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[draggable="true"].opacity-50 {
  opacity: 0.5;
  transform: scale(0.95);
  border-style: dashed;
}
</style>
