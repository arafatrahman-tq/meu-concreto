<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click="close"
      >
        <div
          class="relative w-full max-w-sm bg-surface p-8 rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-300"
          @click.stop
        >
          <div class="text-center mb-10">
            <div
              class="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              :class="
                variant === 'danger'
                  ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                  : 'bg-brand/10 text-brand shadow-[0_0_20px_rgba(255,122,61,0.1)]'
              "
            >
              <component :is="icon" size="28" />
            </div>
            <h3
              class="text-lg font-black tracking-tight text-primary uppercase"
            >
              {{ title }}
            </h3>
            <p
              class="text-secondary mt-3 text-[10px] font-black uppercase tracking-widest opacity-40 leading-relaxed"
            >
              {{ description || message }}
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <button
              @click="$emit('confirm')"
              class="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 outline-none"
              :class="
                variant === 'danger'
                  ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'
                  : 'bg-brand text-white shadow-brand/20 hover:bg-brand-hover'
              "
            >
              {{ confirmLabel }}
            </button>
            <button
              @click="close"
              class="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/3 border border-border transition-all outline-none"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle, Trash2, Info, CheckCircle2 } from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  show: { type: Boolean, default: undefined },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  message: { type: String, default: "" }, // Support both for compatibility
  variant: { type: String, default: "info" }, // 'info', 'danger', 'success'
  type: { type: String, default: "" }, // Support 'type' for compatibility with 'variant'
  confirmLabel: { type: String, default: "Confirmar" },
});

const emit = defineEmits([
  "update:modelValue",
  "update:show",
  "close",
  "confirm",
]);

const isOpen = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : props.show;
});

const variant = computed(() => {
  return props.type || props.variant;
});

const icon = computed(() => {
  if (variant.value === "danger") return Trash2;
  if (variant.value === "success") return CheckCircle2;
  return Info;
});

const close = () => {
  emit("update:modelValue", false);
  emit("update:show", false);
  emit("close");
};
</script>
