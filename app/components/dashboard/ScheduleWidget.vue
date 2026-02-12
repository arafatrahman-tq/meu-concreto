<template>
  <div
    class="bg-surface rounded-[2rem] p-6 sm:p-10 shadow-sm border border-border h-full flex flex-col"
  >
    <div class="flex justify-between items-center mb-10">
      <div>
        <h3
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1"
        >
          Logística em Tempo Real
        </h3>
        <p class="text-xl sm:text-3xl font-black tracking-tighter uppercase text-primary">
          Agenda de Entregas
        </p>
      </div>
      <button
        @click="navigateTo('/agenda')"
        class="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/3 text-secondary/40 hover:text-brand transition-all"
      >
        <MoreHorizontal size="24" />
      </button>
    </div>

    <!-- Calendar Strip -->
    <div
      class="flex justify-between mb-12 text-center overflow-x-auto pb-4 custom-scrollbar"
    >
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        @click="selectedDate = day.dateStr"
        class="flex flex-col gap-2 p-4 rounded-xl transition-all cursor-pointer min-w-18"
        :class="
          selectedDate === day.dateStr
            ? 'bg-brand text-white shadow-xl shadow-brand/20 scale-105'
            : 'text-secondary hover:bg-primary/3'
        "
      >
        <span
          class="font-black opacity-60 text-[10px] uppercase tracking-widest"
          >{{ day.label }}</span
        >
        <span class="font-black text-xl">{{ day.day }}</span>
        <div
          v-if="day.hasEvents && selectedDate !== day.dateStr"
          class="w-1 h-1 rounded-full bg-brand mx-auto"
        ></div>
      </div>
    </div>

    <!-- Event List -->
    <div class="space-y-10 overflow-y-auto flex-1 pr-2 custom-scrollbar">
      <div
        v-if="filteredEvents.length === 0"
        class="flex flex-col items-center justify-center h-full opacity-20"
      >
        <p class="text-[10px] font-black uppercase tracking-widest">
          Sem entregas para este dia
        </p>
      </div>
      <div
        v-for="event in filteredEvents"
        :key="event.id"
        class="flex gap-8 items-start group relative"
      >
        <div
          class="flex flex-col items-center gap-3 min-w-16 pt-1 text-secondary"
        >
          <span
            class="text-xs font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-brand transition-all"
            >{{ event.time }}</span
          >
          <div class="w-px h-full bg-border group-last:hidden min-h-16"></div>
        </div>

        <div
          class="flex-1 bg-primary/2 p-6 rounded-3xl border border-transparent hover:border-border hover:bg-surface transition-all duration-500"
        >
          <div class="flex justify-between items-center mb-4">
            <span
              :class="[
                'text-[9px] font-black px-3 py-1.5 rounded-xl border-2 uppercase tracking-[0.15em]',
                event.tag === 'DOC. EMITIDO'
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                  : event.tag === 'CONCLUÍDO'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                    : 'bg-brand/5 text-brand border-brand/10',
              ]"
            >
              {{ event.tag }}
            </span>
            <div
              v-if="event.hasNf"
              class="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10"
            >
              <CheckCircle2 size="10" />
              NFS-e
            </div>
          </div>
          <p
            class="text-lg font-black leading-tight uppercase tracking-tight text-primary group-hover:text-brand transition-colors"
          >
            {{ event.title }}
          </p>
          <div
            class="flex items-center gap-2 mt-3 text-secondary opacity-50 group-hover:opacity-100 transition-opacity"
          >
            <MapPin size="14" />
            <p class="text-[10px] font-black uppercase tracking-widest">
              {{ event.location }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { MoreHorizontal, MapPin, CheckCircle2 } from "lucide-vue-next";
import { navigateTo } from "#imports";

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
});

const getLocalDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Garantimos que 'now' seja o mesmo no server e client
const now = useState("schedule_now", () => new Date()).value;
const selectedDate = ref(getLocalDateStr(now));

const weekDays = computed(() => {
  const days = [];
  const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  for (let i = -2; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dateStr = getLocalDateStr(d);
    days.push({
      label: names[d.getDay()],
      day: d.getDate(),
      dateStr,
      hasEvents: props.events.some((e) => e.date === dateStr),
    });
  }
  return days;
});

const filteredEvents = computed(() => {
  return props.events.filter((e) => e.date === selectedDate.value);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}
</style>
