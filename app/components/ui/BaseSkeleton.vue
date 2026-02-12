<template>
  <div
    :class="[
      'animate-pulse bg-primary/10 rounded-xl',
      sizeClasses[size],
      className,
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg", "xl", "full"].includes(value),
  },
  className: {
    type: String,
    default: "",
  },
});

const sizeClasses = {
  xs: "h-4 w-16",
  sm: "h-6 w-24",
  md: "h-8 w-32",
  lg: "h-12 w-48",
  xl: "h-16 w-64",
  full: "h-full w-full",
};
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
