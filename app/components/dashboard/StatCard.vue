<template>
  <div
    class="bg-surface rounded-[2rem] p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-border flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500"
  >
    <!-- Glass Background Decoration -->
    <div
      class="absolute -right-4 -top-4 w-28 h-28 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors"
    ></div>

    <!-- Header -->
    <div class="flex justify-between items-start mb-5 relative z-10">
      <div class="flex-1 min-w-0">
        <h3
          class="text-secondary text-[10px] font-black uppercase tracking-[0.25em] mb-4 opacity-40 truncate"
        >
          {{ label }}
        </h3>
        <div class="flex flex-col">
          <span
            class="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black text-primary tracking-tighter leading-tight truncate group-hover:text-brand transition-colors pb-1"
          >
            {{ value }}
          </span>

          <div
            v-if="trend"
            :class="[
              'inline-flex items-center w-fit gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all mt-4 border',
              trendUp
                ? 'bg-success/5 text-success border-success/10'
                : 'bg-danger/5 text-danger border-danger/10',
            ]"
          >
            <component
              :is="trendUp ? TrendingUp : TrendingDown"
              size="12"
              stroke-width="3"
            />
            {{ trend }}
          </div>
        </div>
      </div>

      <div
        class="w-11 h-11 lg:w-10 lg:h-10 xl:w-13 xl:h-13 rounded-[1.25rem] bg-primary/2 border border-border/50 flex items-center justify-center text-secondary/20 group-hover:text-brand group-hover:bg-brand/10 group-hover:border-brand/20 transition-all duration-500 shrink-0 shadow-sm"
      >
        <component
          :is="icon || BarChart"
          size="22"
          stroke-width="2"
          class="group-hover:scale-110 transition-transform"
        />
      </div>
    </div>

    <!-- Sub Info -->
    <div v-if="subtext" class="mt-3 relative z-10">
      <p
        class="text-[10px] font-bold text-secondary/40 uppercase tracking-widest truncate"
      >
        {{ subtext }}
      </p>
    </div>

    <!-- Mini Chart / Modern Footer -->
    <div
      class="mt-8 flex items-end gap-1.5 px-1 h-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"
    >
      <div
        v-for="i in 8"
        :key="i"
        :style="{
          height: `${30 + ((i * 13) % 70)}%`,
          transitionDelay: `${i * 50}ms`,
        }"
        class="flex-1 bg-primary rounded-t-lg transition-all duration-1000"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { TrendingUp, TrendingDown, BarChart } from "lucide-vue-next";

defineProps({
  label: String,
  value: [String, Number],
  subtext: String,
  trend: String,
  trendUp: Boolean,
  icon: [Object, Function],
});
</script>
