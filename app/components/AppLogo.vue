<template>
  <svg
    viewBox="0 0 100 100"
    :class="sizeClasses"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M15 45h50v20h-50z"
      opacity="0.8"
    />
    <path d="M65 47h18l4 8v10h-22z" />
    <path d="M22 35c0-10 40-10 40 0l-5 18c0 5-30 5-30 0z" />
    <path
      d="M30 38l25 6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.5"
    />
    <circle
      cx="28"
      cy="70"
      r="7"
    />
    <circle
      cx="48"
      cy="70"
      r="7"
    />
    <circle
      cx="75"
      cy="70"
      r="7"
    />
    <path
      d="M68 50h8l2 5h-10z"
      fill="currentColor"
      opacity="0.3"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: val => ['sm', 'md', 'lg', 'xl'].includes(val),
  },
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  }
  return sizes[props.size]
})
</script>
