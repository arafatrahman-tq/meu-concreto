<template>
  <div
    class="bg-surface rounded-3xl p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-border relative overflow-hidden h-full flex flex-col group/chart hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transition-all duration-700">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 relative z-10 flex-shrink-0">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Desempenho Financeiro</h3>
        </div>
        <p class="text-3xl font-black tracking-tighter uppercase text-primary">Visão Geral de Ganhos</p>
      </div>
      <div class="flex gap-1 p-1 bg-primary/3 rounded-2xl border border-border/50">
        <button v-for="p in periods" :key="p.id" @click="$emit('update:period', p.id)" :class="[
          'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
          period === p.id
            ? 'bg-surface text-primary shadow-lg shadow-black/5'
            : 'text-secondary opacity-40 hover:opacity-100'
        ]">
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div class="relative h-64 mt-4 flex items-end justify-between px-2 z-10">
      <!-- Grid Lines -->
      <div class="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none opacity-[0.05]">
        <div v-for="i in 5" :key="i" class="w-full h-px bg-primary border-t border-dashed border-primary/20"></div>
      </div>

      <template v-if="data && data.length > 0">
        <div v-for="(bar, index) in data" :key="index"
          class="flex flex-col items-center gap-4 group w-full cursor-pointer relative h-full justify-end px-1 md:px-2">

          <!-- Goal Indicator (Simulated Projeção) -->
          <div 
            class="absolute bottom-1/2 w-full h-0.5 border-t border-dashed border-brand/20 opacity-0 group-hover:opacity-100 transition-opacity z-0"
            title="Meta Projetada">
          </div>

          <!-- Tooltip on hover -->
          <div
            class="absolute bottom-full mb-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-primary text-background text-[10px] font-black py-2.5 px-4 rounded-2xl pointer-events-none whitespace-nowrap z-30 shadow-2xl flex flex-col items-center">
            <span class="opacity-40 uppercase tracking-[0.2em] text-[7px] mb-1">{{ bar.label }}</span>
            <span class="text-xs tracking-tight">
              {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bar.value / 100) }}
            </span>
            <div class="absolute top-full w-2 h-2 bg-primary rotate-45 -mt-1"></div>
          </div>

          <!-- Bars -->
          <div
            class="w-full max-w-[48px] relative h-full flex items-end rounded-2xl transition-all duration-300 origin-bottom">
            <!-- Ghost Bar (Background) -->
            <div class="absolute bottom-0 inset-x-0 h-full bg-primary/2 rounded-2xl border border-border/50">
            </div>
            
            <!-- Actual Value Bar -->
            <div :style="{ height: `${Math.max(bar.height, 8)}%` }"
              class="relative w-full z-10 transition-all duration-1000 delay-100 group-hover:scale-x-105 group-hover:-translate-y-2 overflow-hidden border border-white/10 rounded-2xl"
              :class="[
                bar.value < 0 
                  ? 'bg-gradient-to-t from-rose-500 to-rose-400 group-hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)]' 
                  : 'bg-gradient-to-t from-brand to-brand/80 group-hover:shadow-[0_15px_40px_rgba(255,122,61,0.4)]',
                bar.value === 0 ? 'opacity-20 translate-y-2' : ''
              ]">
              <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <!-- Shiny effect -->
              <div class="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-white/20 via-transparent to-black/10"></div>
            </div>
          </div>
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all tabular-nums">{{ bar.label
          }}</span>
        </div>
      </template>
      <div v-else class="flex-1 h-full flex flex-col items-center justify-center opacity-40">
        <div class="p-8 rounded-full bg-primary/2 mb-4">
          <BarChart size="32" class="text-secondary opacity-20" />
        </div>
        <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">Sincronizando faturamento...</p>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/3 rounded-full blur-3xl z-0"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BarChart } from 'lucide-vue-next'

const props = defineProps({
  period: {
    type: String,
    default: 'monthly'
  },
  data: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:period'])

const periods = [
  { id: 'daily', label: 'Diário' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensal' }
]

const periodLabel = computed(() => {
  const labels = {
    daily: 'diária',
    weekly: 'semanal',
    monthly: 'mensal'
  }
  return labels[props.period] || 'mensal'
})
</script>
