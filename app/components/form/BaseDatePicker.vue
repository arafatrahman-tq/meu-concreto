<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
    >
      {{ label }}
      <span v-if="required" class="text-brand">*</span>
    </label>
    
    <div class="relative">
      <component
        v-if="icon"
        :is="icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        size="18"
      />
      
      <input
        ref="inputRef"
        :type="dateType"
        :value="formattedValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        class="w-full bg-primary/2 border border-border rounded-2xl py-3.5 text-sm font-bold text-primary focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all outline-none disabled:opacity-50"
        :class="[
          icon ? 'pl-12' : 'pl-4',
          error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : '',
          $attrs.class
        ]"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <!-- Calendar Icon (always visible for date inputs) -->
      <Calendar
        v-if="!icon && showCalendarIcon"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        size="18"
      />
    </div>
    
    <p v-if="error" class="text-[10px] font-bold text-rose-500 ml-2 animate-in slide-in-from-top-1">
      {{ error }}
    </p>
    
    <p v-else-if="hint" class="text-[10px] font-bold text-secondary opacity-40 ml-2">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Calendar } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [String, Date, Number],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'date', // 'date', 'datetime-local', 'time'
    validator: (value) => ['date', 'datetime-local', 'time'].includes(value)
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: String,
    default: undefined
  },
  max: {
    type: String,
    default: undefined
  },
  showCalendarIcon: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change']);

const inputRef = ref(null);

const dateType = computed(() => props.type);

/**
 * Formata o valor para o input
 * Converte Date/timestamp para string ISO formatada
 */
const formattedValue = computed(() => {
  if (!props.modelValue) return '';
  
  let date;
  if (props.modelValue instanceof Date) {
    date = props.modelValue;
  } else if (typeof props.modelValue === 'number') {
    date = new Date(props.modelValue);
  } else {
    date = new Date(props.modelValue);
  }
  
  if (isNaN(date.getTime())) return '';
  
  switch (props.type) {
    case 'datetime-local':
      // Formato: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    
    case 'time':
      // Formato: HH:mm
      return String(date.getHours()).padStart(2, '0') + ':' + 
             String(date.getMinutes()).padStart(2, '0');
    
    case 'date':
    default:
      // Formato: YYYY-MM-DD
      return date.toISOString().split('T')[0];
  }
});

/**
 * Converte o valor do input para o formato adequado
 */
const handleInput = (event) => {
  const value = event.target.value;
  
  if (!value) {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }
  
  // Para datetime-local, criar Date no fuso horário local
  if (props.type === 'datetime-local') {
    // Adiciona segundos se não estiverem presentes
    let dateValue = value;
    if (dateValue.length === 16) {
      dateValue += ':00';
    }
    
    // Criar data interpretando como local
    const [datePart, timePart] = dateValue.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
    
    const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
    emit('update:modelValue', localDate.toISOString());
    emit('change', localDate.toISOString());
  } else if (props.type === 'date') {
    emit('update:modelValue', value);
    emit('change', value);
  } else {
    emit('update:modelValue', value);
    emit('change', value);
  }
};

// Expõe o focus do input
const focus = () => {
  inputRef.value?.focus();
};

defineExpose({
  focus
});
</script>
