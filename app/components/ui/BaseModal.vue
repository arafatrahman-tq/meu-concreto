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
        class="fixed inset-0 flex items-center justify-center p-4 z-100 backdrop-blur-sm bg-black/40"
        @click="close"
      >
        <!-- Modal Content -->
        <div
          class="relative w-full transition-all duration-300 transform animate-in zoom-in-95 fade-in max-h-[95vh] flex flex-col"
          :class="[
            size === 'sm'
              ? 'max-w-md'
              : size === 'lg'
                ? 'max-w-5xl'
                : size === 'xl'
                  ? 'max-w-[95vw]'
                  : 'max-w-2xl',
            'bg-surface p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-border',
          ]"
          @click.stop
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-8 shrink-0">
            <div>
              <h3
                class="text-xl md:text-2xl font-bold tracking-tight text-primary"
              >
                {{ title }}
              </h3>
              <p
                v-if="subtitle"
                class="text-secondary mt-1 text-[10px] font-bold uppercase tracking-wider opacity-60"
              >
                {{ subtitle }}
              </p>
            </div>
            <button
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-muted hover:text-primary hover:bg-primary/3 transition-all"
              @click="close"
            >
              <X size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto pr-2 custom-scrollbar">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="mt-8 pt-6 border-t border-border shrink-0"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  show: { type: Boolean, default: undefined },
  title: String,
  subtitle: String,
  size: {
    type: String,
    default: 'md',
  },
})

const emit = defineEmits(['update:modelValue', 'update:show', 'close'])

const isOpen = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : props.show
})

const close = () => {
  emit('update:modelValue', false)
  emit('update:show', false)
  emit('close')
}
</script>
