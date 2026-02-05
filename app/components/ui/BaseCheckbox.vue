<template>
  <label class="flex items-center gap-3 cursor-pointer group">
    <div class="relative">
      <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)"
        class="peer sr-only" v-bind="$attrs" />
      <div
        class="w-5.5 h-5.5 rounded-lg border-2 border-border peer-checked:bg-brand peer-checked:border-brand transition-all flex items-center justify-center bg-surface group-hover:border-brand/40 shadow-sm">
        <svg v-if="modelValue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-white">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>
    <div class="flex flex-col">
      <span v-if="label" class="text-[13px] font-bold text-primary leading-tight">{{ label
      }}</span>
      <span v-if="description" class="text-[10px] font-medium text-secondary/60 mt-0.5 leading-tight">{{
        description }}</span>
    </div>
  </label>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  label: String,
  description: String
})
defineEmits(['update:modelValue'])
</script>
