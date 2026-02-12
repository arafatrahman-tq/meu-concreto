<template>
  <div
    class="bg-brand rounded-[2rem] p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-[0_20px_50px_rgba(var(--color-brand),0.3)] border border-white/10 h-full"
  >
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-8">
        <div
          class="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform duration-500"
        >
          <Activity size="20" class="text-white" />
        </div>
        <div class="flex flex-col">
          <span
            class="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 leading-none"
            >Live Intelligence</span
          >
          <span class="text-[11px] font-black uppercase text-white mt-1"
            >Status de Operação</span
          >
        </div>
      </div>
      <h3
        class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter mb-4 leading-[0.9] uppercase italic"
      >
        Inteligência<br /><span class="text-white/40">Concreta.</span>
      </h3>
      <p class="text-white/70 text-xs font-bold leading-relaxed max-w-full sm:max-w-55">
        Otimize sua produção monitorando
        <span class="text-white font-black">volume, FCK e logística</span>
        em tempo real.
      </p>

      <!-- Stats Grid inside Intelligence Card -->
      <div class="grid grid-cols-2 gap-4 mt-8">
        <div class="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <span class="text-[9px] font-black uppercase tracking-widest text-white/60 block mb-1">Conversão</span>
          <span class="text-xl font-black text-white">{{ stats.pedidos?.conversao || 0 }}%</span>
          <p class="text-[8px] font-bold text-white/30 uppercase mt-1">Lead para Venda</p>
        </div>
        <div class="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <span class="text-[9px] font-black uppercase tracking-widest text-white/60 block mb-1">Ticket Médio</span>
          <span class="text-sm font-black text-white truncate block">{{ formatCurrency(stats.faturamento?.ticketMedio) }}</span>
          <p class="text-[8px] font-bold text-white/30 uppercase mt-1">Média por Pedido</p>
        </div>
      </div>

      <!-- Fiscal Compliance Progress -->
      <div
        class="mt-8 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md"
      >
        <div class="flex justify-between items-end mb-2">
          <span
            class="text-[10px] font-black uppercase tracking-widest text-white/60"
            >Conformidade Fiscal</span
          >
          <span class="text-xs font-black text-white tabular-nums"
            >{{ stats.fiscal?.percentual || 0 }}%</span
          >
        </div>
        <div
          class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-white transition-all duration-1000 ease-out"
            :style="{ width: `${stats.fiscal?.percentual || 0}%` }"
          ></div>
        </div>
        <p
          class="text-[9px] font-bold text-white/40 uppercase tracking-tighter mt-2"
        >
          {{ stats.fiscal?.emitidas || 0 }} de
          {{ stats.fiscal?.total || 0 }} notas emitidas
        </p>
      </div>
    </div>

    <div
      class="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-12 gap-4"
    >
      <div class="flex gap-2 w-full">
        <NuxtLink
          to="/orcamentos/vendedor"
          class="flex-1 bg-white/10 backdrop-blur-md text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand transition-all border border-white/20 text-center flex items-center justify-center gap-2"
        >
          <Smartphone size="14" />
          Mobile App
        </NuxtLink>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div
      class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000"
    ></div>
    <div
      class="absolute -left-20 -bottom-20 w-64 h-64 bg-black/20 rounded-full blur-[80px]"
    ></div>
    <Zap
      class="absolute right-0 top-1/2 -translate-y-1/2 text-white/5 w-56 h-56 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-1000 opacity-50"
    />
  </div>
</template>

<script setup>
import { Activity, Zap, Smartphone } from "lucide-vue-next";

defineProps({
  stats: {
    type: Object,
    required: true
  }
});

const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};
</script>
