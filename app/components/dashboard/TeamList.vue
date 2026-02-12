<template>
  <div class="bg-surface rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/5 dark:border-white/5 flex flex-col h-full">
    <div class="flex justify-between items-center mb-10">
      <div>
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Ranking de Performance</h3>
        <p class="text-xl sm:text-3xl font-black tracking-tighter uppercase text-primary">Equipe em Destaque</p>
      </div>
      <div class="flex gap-2">
        <div class="p-2 rounded-xl bg-brand/5 text-brand">
          <Trophy size="18" />
        </div>
      </div>
    </div>

    <div class="space-y-8 flex-1 overflow-y-auto pr-2 no-scrollbar">
      <div v-for="(person, index) in people" :key="person.id"
        @click="navigateTo(`/vendedores?id=${person.id}`)"
        class="flex items-center justify-between group cursor-pointer p-4 rounded-3xl hover:bg-primary/2 dark:hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-primary/5 dark:hover:border-white/10">
        <div class="flex items-center gap-5">
          <div class="relative">
            <div
              class="w-14 h-14 rounded-2xl bg-brand/10 overflow-hidden border-2 border-surface shadow-lg group-hover:scale-110 transition-transform duration-500 flex items-center justify-center text-brand font-black text-xl">
              {{ person.name.charAt(0) }}
            </div>
            <div v-if="index === 0"
              class="absolute -top-2 -right-2 bg-warning text-white w-6 h-6 rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
              <Trophy size="12" />
            </div>
          </div>
          <div>
            <p class="text-base font-bold text-primary tracking-tight">{{ person.name }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">{{ person.vendasCount }}
                vendas</span>
              <span class="w-1 h-1 bg-primary/10 rounded-full"></span>
              <span class="text-[10px] font-bold text-brand uppercase tracking-wider">{{ person.totalFormatted }}</span>
            </div>
          </div>
        </div>
        <button
          class="w-10 h-10 rounded-2xl border border-primary/10 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-500 group-hover:bg-brand dark:group-hover:bg-brand group-hover:text-white dark:group-hover:text-white group-hover:border-brand dark:group-hover:border-brand transition-all shadow-sm">
          <ChevronRight size="20" />
        </button>
      </div>

      <div v-if="people.length === 0" class="flex flex-col items-center justify-center py-10 opacity-20">
        <Users size="40" class="mb-2" />
        <span class="text-[10px] font-black uppercase tracking-widest">Aguardando dados...</span>
      </div>
    </div>

    <NuxtLink to="/vendedores"
      class="mt-10 w-full py-4 border-2 border-dashed border-primary/5 dark:border-white/10 rounded-3xl text-[10px] font-bold text-secondary uppercase tracking-widest hover:bg-primary/3 dark:hover:bg-white/5 hover:border-brand dark:hover:border-brand hover:text-brand dark:hover:text-brand transition-all opacity-50 hover:opacity-100 dark:text-gray-400 text-center">
      Gerenciar Vendedores
    </NuxtLink>
  </div>
</template>

<script setup>
import { ChevronRight, Trophy, Users } from 'lucide-vue-next'

const props = defineProps({
  people: {
    type: Array,
    default: () => []
  }
})
</script>
