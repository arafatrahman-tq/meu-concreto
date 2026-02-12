<template>
  <div class="w-full">
    <!-- Header Skeleton -->
    <div class="flex gap-4 mb-4 px-8 py-4 border-b border-border">
      <div
        v-for="n in columns"
        :key="n"
        :class="[
          'h-4 bg-primary/10 rounded animate-pulse',
          n === columns ? 'flex-1' : 'w-32',
        ]"
      />
    </div>

    <!-- Rows Skeleton -->
    <div class="space-y-4 px-4">
      <div
        v-for="row in rows"
        :key="row"
        class="flex gap-4 items-center px-4 py-5"
      >
        <div
          v-for="col in columns"
          :key="col"
          :class="[
            'h-4 bg-primary/10 rounded animate-pulse',
            col === columns ? 'flex-1' : 'w-32',
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  columns: {
    type: Number,
    default: 5,
  },
  rows: {
    type: Number,
    default: 5,
  },
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
