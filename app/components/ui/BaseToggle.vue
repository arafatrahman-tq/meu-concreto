<template>
  <label class="relative inline-flex items-center cursor-pointer group">
    <input
      type="checkbox"
      :checked="modelValue"
      class="sr-only peer"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <div
      class="w-12 h-6 rounded-full transition-all duration-300 relative border border-transparent shadow-inner"
      :class="[
        modelValue ? (colorClass || 'bg-brand') : 'bg-primary/10',
      ]"
    >
      <div
        class="absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
        :class="[
          modelValue ? 'translate-x-6 bg-white shadow-brand/20' : 'bg-white',
        ]"
      />
    </div>
  </label>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  colorClass: String, // e.g., 'bg-emerald-500' or 'bg-[#25D366]'
})

defineEmits(['update:modelValue'])
</script>
