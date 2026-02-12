<template>
  <div
    class="p-5 rounded-[2rem] bg-primary/5 border border-border/50 backdrop-blur-sm hover:bg-primary/8 transition-all duration-500 cursor-default group"
  >
    <div class="flex items-center gap-3 mb-3">
      <div
        :class="[
          'w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
          colorClasses[color]
        ]"
      >
        <component :is="icon" size="14" />
      </div>
      <p
        class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary/60 group-hover:text-primary/80 transition-colors"
      >
        {{ label }}
      </p>
    </div>
    <p class="text-xl font-black text-primary leading-none">
      {{ value }}
    </p>
    <p class="text-[8px] font-bold text-secondary/40 uppercase mt-2">
      {{ sublabel || label }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: [Object, Function],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  sublabel: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'brand',
    validator: (val) => ['brand', 'success', 'accent', 'warning', 'danger'].includes(val)
  }
});

const colorClasses = {
  brand: 'bg-brand/10 text-brand',
  success: 'bg-success/10 text-success',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger'
};
</script>
