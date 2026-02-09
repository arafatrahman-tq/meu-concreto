<template>
  <div class="relative group">
    <div
      v-if="icon"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors"
    >
      <component :is="icon" size="20" />
    </div>
    <input
      :value="displayValue"
      @input="onInput"
      v-bind="$attrs"
      class="w-full bg-primary/2 border rounded-2xl py-3.5 text-sm font-bold text-primary placeholder:text-secondary/30 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all font-sans outline-none tracking-tight"
      :class="[
        icon ? 'pl-12 pr-4' : 'px-5',
        error ? 'border-rose-500/50 bg-rose-500/5' : 'border-border'
      ]"
    />
    <div v-if="$slots.suffix" class="absolute right-4 top-1/2 -translate-y-1/2">
      <slot name="suffix" />
    </div>
    <!-- Error Message -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <span v-if="error" class="absolute left-4 -bottom-5 text-[9px] font-black uppercase tracking-widest text-rose-500">
        {{ error }}
      </span>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { applyMask } from "@/utils/masks";

const props = defineProps({
  modelValue: [String, Number],
  icon: [Object, Function],
  mask: String, // 'cpf', 'cnpj', 'cpfCnpj', 'phone', 'cep'
  error: String
});

const emit = defineEmits(["update:modelValue"]);

const displayValue = computed(() => {
  if (props.mask) return applyMask(props.modelValue, props.mask);
  return props.modelValue;
});

const onInput = (event) => {
  let val = event.target.value;
  if (props.mask) {
    val = val.replace(/\D/g, "");
    if (props.mask === "cpf") val = val.substring(0, 11);
    if (props.mask === "cnpj") val = val.substring(0, 14);
    if (props.mask === "cpfCnpj") val = val.substring(0, 14);
    if (props.mask === "phone") val = val.substring(0, 11);
    if (props.mask === "cep") val = val.substring(0, 8);
  }
  emit("update:modelValue", val);
};
</script>
