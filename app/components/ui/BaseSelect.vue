<template>
  <div class="relative group" ref="selectRef">
    <!-- Trigger Button -->
    <div
      v-if="icon"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors z-20 pointer-events-none"
    >
      <component :is="icon" size="20" />
    </div>

    <button
      type="button"
      @click="toggleDropdown"
      ref="buttonRef"
      class="w-full bg-primary/2 border border-border rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest text-primary text-left transition-all font-sans outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 flex items-center justify-between"
      :class="[icon ? 'pl-12 pr-4' : 'px-5']"
    >
      <span :class="{ 'opacity-40': !modelValue }">
        {{ selectedLabel || placeholder || "Selecione..." }}
      </span>
      <ChevronDown
        size="18"
        class="text-muted transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown List -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0 -translate-y-2"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100 translate-y-0"
        leave-to-class="transform scale-95 opacity-0 -translate-y-2"
      >
        <div
          v-if="isOpen"
          :style="dropdownStyle"
          class="fixed z-9999 bg-surface/95 border border-border rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-3xl max-h-60 overflow-y-auto custom-scrollbar"
        >
          <div
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center justify-between hover:bg-brand/5 group/opt relative"
            :class="[
              modelValue === option.value
                ? 'text-brand bg-brand/3'
                : 'text-primary/70 hover:text-primary',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="modelValue === option.value"
                class="w-1 h-3 rounded-full bg-brand"
              ></div>
              {{ option.label }}
            </div>
            <div
              v-if="modelValue === option.value"
              class="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_10px_#ff7a3d] animate-pulse"
            ></div>
          </div>
          <div
            v-if="!options.length"
            class="px-5 py-8 text-center text-[10px] font-black uppercase tracking-widest text-secondary opacity-30"
          >
            Nenhuma opção disponível
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Click Outside Overlay -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-9998"
        @click="isOpen = false"
      ></div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps({
  modelValue: [String, Number],
  options: { type: Array, default: () => [] },
  icon: [Object, Function],
  placeholder: String,
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const buttonRef = ref(null);
const dropdownStyle = ref({});

const toggleDropdown = () => {
  if (!isOpen.value) {
    updateDropdownPosition();
  }
  isOpen.value = !isOpen.value;
};

const updateDropdownPosition = () => {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
  }
};

// Update position on scroll/resize if open
const onScrollResize = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

onMounted(() => {
  window.addEventListener("scroll", onScrollResize, true);
  window.addEventListener("resize", onScrollResize);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScrollResize, true);
  window.removeEventListener("resize", onScrollResize);
});

const selectedLabel = computed(() => {
  const option = props.options.find(
    (opt) => String(opt.value) === String(props.modelValue),
  );
  return option ? option.label : null;
});

const selectOption = (option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
