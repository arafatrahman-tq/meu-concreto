<template>
  <label class="flex items-center gap-3 cursor-pointer group">
    <div class="relative shrink-0">
      <input
        type="checkbox"
        :checked="isChecked"
        :value="value"
        @change="handleChange"
        class="peer sr-only"
      />
      <div
        :class="[
          'rounded-lg border-2 border-border peer-checked:bg-brand peer-checked:border-brand transition-all flex items-center justify-center bg-surface group-hover:border-brand/40 shadow-sm',
          sizeClasses,
        ]"
      >
        <svg
          v-if="isChecked"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="iconClasses"
          class="text-white"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>
    <div class="flex flex-col">
      <span
        v-if="label"
        class="text-[13px] font-bold text-primary leading-tight"
        >{{ label }}</span
      >
      <span
        v-if="description"
        class="text-[10px] font-medium text-secondary/60 mt-0.5 leading-tight"
        >{{ description }}</span
      >
    </div>
  </label>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false,
  },
  value: {
    type: String,
    default: undefined,
  },
  label: String,
  description: String,
  size: {
    type: String,
    default: "md",
    validator: (val) => ["sm", "md", "lg"].includes(val),
  },
});

const emit = defineEmits(["update:modelValue"]);

const isArrayModel = computed(() => Array.isArray(props.modelValue));

const isChecked = computed(() => {
  if (isArrayModel.value) {
    return props.modelValue.includes(props.value);
  }
  return props.modelValue;
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  return sizes[props.size];
});

const iconClasses = computed(() => {
  const sizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };
  return sizes[props.size];
});

const handleChange = (event) => {
  const isChecked = event.target.checked;

  if (isArrayModel.value) {
    const newValue = [...props.modelValue];
    if (isChecked) {
      newValue.push(props.value);
    } else {
      const index = newValue.indexOf(props.value);
      if (index > -1) {
        newValue.splice(index, 1);
      }
    }
    emit("update:modelValue", newValue);
  } else {
    emit("update:modelValue", isChecked);
  }
};
</script>
