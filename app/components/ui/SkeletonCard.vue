<template>
  <div class="bg-surface rounded-3xl border border-border p-6 animate-pulse">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-2xl bg-primary/10" />
      <div class="flex-1">
        <div class="h-3 w-24 bg-primary/10 rounded mb-2" />
        <div class="h-2 w-16 bg-primary/10 rounded" />
      </div>
    </div>

    <!-- Content -->
    <div class="space-y-2">
      <div class="h-8 w-32 bg-primary/10 rounded" />
      <div class="h-3 w-20 bg-primary/10 rounded" />
    </div>
  </div>
</template>

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
