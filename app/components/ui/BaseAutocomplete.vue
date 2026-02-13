<template>
  <div
    ref="containerRef"
    class="relative group"
  >
    <!-- Icon -->
    <div
      v-if="icon"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors z-20 pointer-events-none"
    >
      <component
        :is="icon"
        size="20"
      />
    </div>

    <!-- Input field -->
    <input
      ref="inputRef"
      type="text"
      :value="inputValue"
      v-bind="$attrs"
      class="w-full bg-primary/2 border rounded-2xl py-3.5 text-sm font-bold text-primary placeholder:text-secondary/30 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all font-sans outline-none tracking-tight"
      :class="[
        icon ? 'pl-12 pr-4' : 'px-5',
        error ? 'border-danger/50 bg-danger/5' : 'border-border',
      ]"
      :placeholder="placeholder"
      autocomplete="off"
      @input="handleInput"
      @focus="handleFocus"
      @keydown.down.prevent="navigateResults(1)"
      @keydown.up.prevent="navigateResults(-1)"
      @keydown.enter.prevent="selectCurrent"
      @keydown.esc="isOpen = false"
    >

    <!-- Error Message -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
    >
      <span
        v-if="error"
        class="absolute left-4 -bottom-5 text-[9px] font-black uppercase tracking-widest text-danger"
      >
        {{ error }}
      </span>
    </Transition>

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
          v-if="isOpen && (options.length > 0 || loading || inputValue.length >= 2)"
          :style="dropdownStyle"
          class="fixed z-9999 bg-surface/95 border border-border rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-3xl max-h-60 overflow-y-auto custom-scrollbar"
        >
          <!-- Loading State -->
          <div
            v-if="loading"
            class="px-5 py-4 flex items-center gap-3 text-secondary/40 text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw
              size="14"
              class="animate-spin text-brand"
            />
            Buscando resultados...
          </div>

          <!-- Options -->
          <template v-else>
            <div
              v-for="(option, index) in options"
              :key="option.value"
              class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center justify-between group/opt relative"
              :class="[
                activeIndex === index || modelValue === option.value
                  ? 'text-brand bg-brand/5'
                  : 'text-primary/70 hover:text-primary',
              ]"
              @click="selectOption(option)"
              @mouseenter="activeIndex = index"
            >
              <div class="flex items-center gap-3">
                <div
                  v-if="modelValue === option.value"
                  class="w-1 h-3 rounded-full bg-brand"
                />
                {{ option.label }}
              </div>
            </div>

            <div
              v-if="!options.length"
              class="px-5 py-8 text-center text-[10px] font-black uppercase tracking-widest text-secondary opacity-30"
            >
              Nenhum resultado encontrado
            </div>
          </template>
        </div>
      </Transition>
    </Teleport>

    <!-- Click Outside Overlay -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-9998"
        @click="isOpen = false"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number],
  options: { type: Array, default: () => [] },
  loading: Boolean,
  icon: [Object, Function],
  placeholder: String,
  label: String, // Label to show in the input when something is selected
  error: String,
})

const emit = defineEmits(['update:modelValue', 'search', 'select'])

const isOpen = ref(false)
const inputRef = ref(null)
const containerRef = ref(null)
const dropdownStyle = ref({})
const activeIndex = ref(-1)
const inputValue = ref(props.label || '')

// Watch for external label changes
watch(() => props.label, (newLabel) => {
  inputValue.value = newLabel || ''
})

const handleInput = (e) => {
  inputValue.value = e.target.value
  isOpen.value = true
  activeIndex.value = -1
  emit('search', e.target.value)
  updateDropdownPosition()
}

const handleFocus = () => {
  if (inputValue.value.length >= 2) {
    isOpen.value = true
    updateDropdownPosition()
  }
}

const updateDropdownPosition = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    }
  }
}

const navigateResults = (dir) => {
  if (!isOpen.value) {
    isOpen.value = true
    updateDropdownPosition()
    return
  }
  const next = activeIndex.value + dir
  if (next >= 0 && next < props.options.length) {
    activeIndex.value = next
  }
}

const selectCurrent = () => {
  if (activeIndex.value >= 0 && props.options[activeIndex.value]) {
    selectOption(props.options[activeIndex.value])
  }
}

const selectOption = (option) => {
  inputValue.value = option.label
  emit('update:modelValue', option.value)
  emit('select', option.value)
  isOpen.value = false
  activeIndex.value = -1
}

// Global event listeners for repositioning
const onScrollResize = () => {
  if (isOpen.value) updateDropdownPosition()
}

onMounted(() => {
  window.addEventListener('scroll', onScrollResize, true)
  window.addEventListener('resize', onScrollResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScrollResize, true)
  window.removeEventListener('resize', onScrollResize)
})
</script>
