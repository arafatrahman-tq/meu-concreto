<template>
  <div
    class="bg-surface rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/5 dark:border-white/5 flex flex-col h-full group"
  >
    <div class="flex justify-between items-center mb-10">
      <div>
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">
          Distribuição de Despesas
        </h3>
        <p class="text-xl sm:text-3xl font-black tracking-tighter uppercase">
          Custos Operacionais
        </p>
      </div>
      <button
        class="w-12 h-12 rounded-2xl bg-primary/3 flex items-center justify-center text-secondary/40 hover:text-brand transition-all"
      >
        <MoreHorizontal size="24" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-10 overflow-x-auto no-scrollbar">
      <button
        class="px-4 sm:px-6 py-2.5 bg-brand dark:bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 whitespace-nowrap"
      >
        Insumos
      </button>
      <button
        class="px-4 sm:px-6 py-2.5 text-secondary dark:text-gray-400 hover:bg-primary/3 dark:hover:bg-white/5 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
      >
        Logística
      </button>
    </div>

    <div
      v-if="expenses && expenses.length > 0"
      class="space-y-10 flex-1"
    >
      <div
        v-for="expense in expenses"
        :key="expense.name"
        class="space-y-3"
      >
        <div class="flex justify-between text-[11px] font-black uppercase tracking-widest">
          <span class="text-primary">{{ expense.name }}</span>
          <span class="text-brand opacity-100">{{ expense.percentage }}%</span>
        </div>
        <div class="h-3 w-full bg-primary/3 rounded-full overflow-hidden p-0.5">
          <div
            :style="{ width: expense.percentage + '%' }"
            class="h-full bg-brand rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--brand-rgb),0.3)]"
          />
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center opacity-20 py-10"
    >
      <MoreHorizontal
        size="40"
        class="mb-2"
      />
      <p class="text-[10px] font-black uppercase tracking-widest">
        Sem dados de custos
      </p>
    </div>

    <div class="mt-8 pt-8 border-t border-primary/5 dark:border-white/10 text-left">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
        Média Mensal
      </p>
      <p class="text-2xl sm:text-4xl font-black text-brand tracking-tighter mt-1">
        {{ averageMonthly }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { MoreHorizontal } from 'lucide-vue-next'

defineProps({
  averageMonthly: String,
  expenses: Array,
})
</script>
