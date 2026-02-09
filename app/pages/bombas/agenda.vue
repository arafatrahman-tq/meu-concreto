<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Agenda de <span class="text-brand">Bombas</span>
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Escalabilidade de equipamentos e gargalos de produção
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div
          class="bg-surface p-1 rounded-2xl border border-border flex shadow-sm"
        >
          <button
            v-for="view in ['Calendário', 'Lista']"
            :key="view"
            @click="currentView = view"
            class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            :class="
              currentView === view
                ? 'bg-primary text-background shadow-lg'
                : 'text-secondary opacity-40 hover:opacity-100'
            "
          >
            {{ view }}
          </button>
        </div>
      </div>
    </div>

    <!-- Calendário View -->
    <div v-if="currentView === 'Calendário'" class="flex flex-col gap-6">
      <!-- Calendar Strip -->
      <div
        class="bg-surface rounded-3xl border border-border p-8 shadow-sm overflow-hidden"
      >
        <div class="flex items-center justify-between mb-10 px-4">
          <button
            @click="prevWeek"
            class="p-3 rounded-2xl bg-primary/2 hover:bg-primary/5 transition-all text-primary"
          >
            <ChevronLeft size="20" />
          </button>
          <h3
            class="text-xl font-black uppercase tracking-tighter text-primary"
          >
            {{ currentMonthYear }}
          </h3>
          <button
            @click="nextWeek"
            class="p-3 rounded-2xl bg-primary/2 hover:bg-primary/5 transition-all text-primary"
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
            @click="selectedDate = day.dateStr"
            class="flex flex-col items-center gap-3 p-6 rounded-3xl transition-all cursor-pointer min-w-30 group relative border-2 border-transparent"
            :class="[
              selectedDate === day.dateStr
                ? 'bg-brand text-white shadow-2xl shadow-brand/20 scale-105'
                : 'bg-primary/2 text-secondary hover:bg-primary/4',
            ]"
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
            ></div>
          </div>
        </div>
      </div>

      <!-- Daily Agenda -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <!-- Timeline (Left 8 cols) -->
        <div class="xl:col-span-8 space-y-8">
          <div class="flex items-center gap-3 px-2">
            <div class="w-2 h-2 rounded-full bg-brand"></div>
            <h4
              class="text-[10px] font-black uppercase tracking-[0.3em] text-primary"
            >
              Escala de Bombas
            </h4>
            <div class="flex-1 h-px bg-border ml-2"></div>
          </div>

          <div
            v-if="pending"
            class="flex flex-col items-center justify-center py-20 opacity-20"
          >
            <RefreshCw class="w-10 h-10 text-brand animate-spin mb-4" />
            <span
              class="text-[10px] font-black uppercase tracking-widest text-primary"
              >Sincronizando logistica...</span
            >
          </div>

          <div
            v-else-if="dailyEvents.length === 0"
            class="flex flex-col items-center justify-center py-32 bg-primary/2 rounded-3xl border border-dashed border-border group"
          >
            <div
              class="p-8 rounded-full bg-primary/2 mb-6 group-hover:scale-110 transition-transform"
            >
              <CalendarX size="48" class="text-secondary opacity-20" />
            </div>
            <p
              class="text-[11px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Sem bombas programadas para hoje
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="hour in timelineHours"
              :key="hour"
              class="relative flex gap-8 group/hour"
            >
              <!-- Hour Marker -->
              <div class="flex flex-col items-end min-w-16 py-4">
                <span class="text-sm font-black text-primary tabular-nums"
                  >{{ hour }}:00</span
                >
                <div class="w-1 h-1 rounded-full bg-border mt-2"></div>
              </div>

              <!-- Content Area -->
              <div class="flex-1 border-l-2 border-border/50 pl-8 pb-8">
                <div v-if="getEventsByHour(hour).length > 0" class="space-y-4">
                  <div
                    v-for="event in getEventsByHour(hour)"
                    :key="event.id"
                    class="group/item bg-surface rounded-2xl p-6 border border-border hover:border-brand shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all relative"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <span
                          class="text-[9px] font-black uppercase tracking-widest text-brand"
                        >
                          {{ formatTime(event.dataEntrega) }}
                        </span>
                        <span
                          :class="[
                            'px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest',
                            event.idBomba
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500',
                          ]"
                        >
                          {{
                            event.idBomba
                              ? "RECURSO ESCALADO"
                              : "RECURSO PENDENTE"
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
                      class="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div class="space-y-2">
                        <h5
                          class="text-sm font-black uppercase text-primary group-hover/item:text-brand transition-colors"
                        >
                          {{ event.cliente?.nome || event.nomeCliente }}
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

                      <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2">
                          <button
                            @click="navigateTo(`/orcamentos?id=${event.id}`)"
                            class="p-2 bg-primary/2 text-secondary hover:text-brand hover:bg-white border border-transparent hover:border-border rounded-xl transition-all shadow-sm"
                          >
                            <ExternalLink size="14" />
                          </button>
                          <div
                            class="flex items-center gap-2 px-4 py-2 bg-primary/2 rounded-xl"
                          >
                            <Package size="14" class="text-brand" />
                            <span class="text-xs font-black text-primary"
                              >{{ event.qtd }} m³</span
                            >
                          </div>
                        </div>

                        <!-- Pump selector/Info -->
                        <div class="min-w-56">
                          <div
                            v-if="event.idBomba"
                            class="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 relative group/bomba"
                          >
                            <div
                              class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"
                            >
                              <Activity size="14" />
                            </div>
                            <div class="flex-1">
                              <p
                                class="text-[10px] font-black text-primary uppercase leading-none"
                              >
                                {{ event.bomba?.nome }}
                              </p>
                              <p
                                class="text-[8px] font-black text-secondary opacity-40 uppercase tracking-widest mt-1"
                              >
                                {{ event.bomba?.tipo }}
                              </p>
                            </div>
                            <button
                              @click="unassignBomba(event)"
                              class="opacity-0 group-hover/bomba:opacity-100 p-1.5 text-secondary hover:text-rose-500 transition-all"
                            >
                              <X size="14" />
                            </button>
                          </div>
                          <div v-else class="flex flex-col gap-2">
                            <BaseSelect
                              v-model="event.selectedBomba"
                              :options="bombasOptions"
                              placeholder="VINCULAR BOMBA..."
                              @change="assignBomba(event)"
                              variant="compact"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty Hour Placeholder -->
                <div v-else class="h-4 flex items-center">
                  <div class="w-full h-px bg-border/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel (Stats & Filters) -->
        <div class="xl:col-span-4 space-y-8">
          <!-- Quick Stats -->
          <div
            class="bg-primary p-10 rounded-3xl shadow-2xl shadow-primary/10 relative overflow-hidden group"
          >
            <div class="relative z-10 space-y-6">
              <div>
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.3em] text-background/40 mb-2"
                >
                  Bombeio Total do Dia
                </h4>
                <div class="flex items-end gap-2">
                  <span
                    class="text-5xl font-black tracking-tighter text-background"
                    >{{ totalVolume }}</span
                  >
                  <span
                    class="text-xl font-bold opacity-40 mb-1 text-background"
                    >m³</span
                  >
                </div>
              </div>

              <div
                class="grid grid-cols-2 gap-4 pt-6 border-t border-background/10"
              >
                <div>
                  <span
                    class="text-[9px] font-black uppercase tracking-widest text-background/40 block mb-1"
                    >Total Serviços</span
                  >
                  <span class="text-xl font-black text-background">{{
                    dailyEvents.length
                  }}</span>
                </div>
                <div>
                  <span
                    class="text-[9px] font-black uppercase tracking-widest text-background/40 block mb-1"
                    >Sem Bomba</span
                  >
                  <span class="text-xl font-black text-rose-400">{{
                    dailyEvents.filter((e) => !e.idBomba).length
                  }}</span>
                </div>
              </div>
            </div>
            <Activity
              size="120"
              class="absolute -right-8 -top-8 text-background/5 group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          <!-- Pending Items (Filter view alternative) -->
          <div
            class="bg-surface rounded-3xl border border-border p-8 space-y-6"
          >
            <div class="flex items-center gap-3">
              <AlertCircle size="18" class="text-rose-500" />
              <h4
                class="text-[10px] font-black uppercase tracking-widest text-primary"
              >
                Atenção Prioritária
              </h4>
            </div>

            <div v-if="pendingEvents.length > 0" class="space-y-4">
              <div
                v-for="item in pendingEvents"
                :key="item.id"
                @click="scrollToEvent(item.id)"
                class="p-4 bg-primary/2 rounded-2xl border border-border/50 hover:border-rose-500/30 transition-all cursor-pointer group"
              >
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="text-[8px] font-black text-rose-500 uppercase tracking-widest"
                    >Sem recurso</span
                  >
                  <span class="text-[10px] font-black text-primary">{{
                    formatTime(item.dataEntrega)
                  }}</span>
                </div>
                <h6
                  class="text-[11px] font-black text-primary uppercase truncate group-hover:text-rose-500 transition-colors"
                >
                  {{ item.nomeCliente }}
                </h6>
              </div>
            </div>
            <div
              v-else
              class="py-8 text-center bg-emerald-500/5 rounded-2xl border border-dashed border-emerald-500/20"
            >
              <CheckCircle2
                size="32"
                class="text-emerald-500/30 mx-auto mb-4"
              />
              <p
                class="text-[9px] font-black uppercase tracking-widest text-emerald-600"
              >
                Frota 100% Escalada
              </p>
            </div>

            <div class="pt-6 border-t border-border">
              <button
                @click="refresh"
                class="w-full py-4 bg-primary/2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw size="14" :class="{ 'animate-spin': pending }" />
                Sincronizar Escala
              </button>
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
          'Volume / Recurso',
          'Equipamento',
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
              <span class="text-xs font-black text-primary"
                >{{ event.qtd }} m³</span
              >
              <span
                v-if="!event.idBomba"
                class="text-[8px] font-black text-rose-500 uppercase"
                >Bomba Requerida</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <div v-if="event.idBomba" class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              >
                <Activity size="14" />
              </div>
              <span
                class="text-[10px] font-black uppercase text-primary leading-tight"
                >{{ event.bomba?.nome }}</span
              >
            </div>
            <div
              v-else
              class="text-[10px] font-black text-secondary opacity-20 uppercase tracking-widest"
            >
              Não escalado
            </div>
          </td>
          <td class="px-8 py-5">
            <span
              :class="[
                'px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest',
                event.idBomba
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500 shadow-sm',
              ]"
            >
              {{ event.idBomba ? "PROGRAMADO" : "PENDENTE" }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center justify-end gap-2">
              <button
                @click="navigateTo(`/orcamentos?id=${event.id}`)"
                class="p-2.5 rounded-xl bg-primary/2 text-secondary hover:text-brand hover:bg-white border border-transparent hover:border-border transition-all shadow-sm"
              >
                <ExternalLink size="16" />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!sortedEvents.length">
          <td colspan="7" class="py-32 text-center">
            <div class="flex flex-col items-center justify-center opacity-20">
              <CalendarX size="48" class="mb-4" />
              <p class="text-[10px] font-black uppercase tracking-widest">
                Nenhuma bomba requerida no período
              </p>
            </div>
          </td>
        </tr>
      </BaseTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  ExternalLink,
  RefreshCw,
  Calendar,
  CalendarX,
  Activity,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-vue-next";
import { useFetch, navigateTo } from "#imports";
import { useToast } from "~/composables/useToast";

definePageMeta({ layout: "default" });

const toast = useToast();
const currentView = ref("Calendário");
const agendaNow = useState("bombas_agenda_now", () => new Date()).value;
const selectedDate = ref(agendaNow.toISOString().split("T")[0]);
const weekOffset = ref(0);

// Helper para cálculo de datas (coerente com Agenda de Entregas)
const weekDates = computed(() => {
  const dates = [];
  const startOfWeek = new Date(agendaNow);
  startOfWeek.setDate(
    agendaNow.getDate() - agendaNow.getDay() + weekOffset.value * 7,
  );

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
});

const {
  data: agenda,
  pending,
  refresh,
} = await useFetch("/api/bombas/agenda", {
  query: computed(() => ({
    start: weekDates.value[0],
    end: weekDates.value[6],
  })),
});

const { data: bombas } = useFetch("/api/bombas");

const weekDays = computed(() => {
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return weekDates.value.map((dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      label: labels[d.getDay()],
      day: d.getDate(),
      dateStr,
      hasEvents: agenda.value?.some(
        (e) =>
          e.dataEntrega &&
          new Date(e.dataEntrega).toISOString().split("T")[0] === dateStr,
      ),
    };
  });
});

const currentMonthYear = computed(() => {
  const midDate = new Date(weekDays.value[3].dateStr);
  return midDate
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .toUpperCase();
});

const dailyEvents = computed(() => {
  if (!agenda.value) return [];
  return agenda.value.filter((e) => {
    const eDate = new Date(e.dataEntrega).toISOString().split("T")[0];
    return eDate === selectedDate.value;
  });
});

const pendingEvents = computed(() =>
  dailyEvents.value.filter((e) => !e.idBomba),
);

const totalVolume = computed(() => {
  return dailyEvents.value
    .reduce((acc, curr) => acc + (curr.qtd || 0), 0)
    .toFixed(1);
});

const sortedEvents = computed(() => {
  if (!agenda.value) return [];
  return [...agenda.value].sort(
    (a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega),
  );
});

const prevWeek = () => weekOffset.value--;
const nextWeek = () => weekOffset.value++;

const formatTime = (date) => {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timelineHours = [
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
];

const getEventsByHour = (hour) => {
  return dailyEvents.value.filter((e) => {
    const time = new Date(e.dataEntrega);
    return time.getHours().toString().padStart(2, "0") === hour;
  });
};

const bombasOptions = computed(() => {
  if (!bombas.value) return [];
  return bombas.value
    .filter((b) => b.ativo === 1)
    .map((b) => ({ label: b.nome, value: b.id }));
});

const assignBomba = async (item) => {
  if (!item.selectedBomba) return;
  try {
    await $fetch(`/api/orcamentos/${item.id}`, {
      method: "PUT",
      body: { idBomba: item.selectedBomba },
    });
    toast.add({
      title: "Escalado",
      description: "Bomba vinculada com sucesso",
      type: "success",
    });
    await refresh();
  } catch (e) {
    toast.add({
      title: "Erro",
      description: e.data?.message || e.message,
      type: "error",
    });
  }
};

const unassignBomba = async (item) => {
  if (!confirm("Deseja remover o escalonamento desta bomba?")) return;
  try {
    await $fetch(`/api/orcamentos/${item.id}`, {
      method: "PUT",
      body: { idBomba: null },
    });
    toast.add({
      title: "Removido",
      description: "Escalonamento removido",
      type: "info",
    });
    await refresh();
  } catch (e) {
    toast.add({
      title: "Erro",
      description: e.data?.message || e.message,
      type: "error",
    });
  }
};

const scrollToEvent = (id) => {
  const el = document.getElementById(`event-${id}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
};
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
</style>
