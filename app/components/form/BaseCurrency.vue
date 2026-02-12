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
      <div
        class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center gap-1"
      >
        <component
          v-if="icon"
          :is="icon"
          size="18"
        />
        <span class="text-sm font-bold text-secondary">R$</span>
      </div>
      
      <input
        ref="inputRef"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        type="text"
        inputmode="decimal"
        class="w-full bg-primary/2 border border-border rounded-2xl py-3.5 pr-4 text-sm font-bold text-primary focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all outline-none disabled:opacity-50 text-right tabular-nums"
        :class="[
          icon ? 'pl-18' : 'pl-12',
          error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : '',
          $attrs.class
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
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
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '0,00'
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
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: undefined
  },
  step: {
    type: Number,
    default: 0.01
  },
  // Se true, trabalha com centavos (inteiro), se false, trabalha com decimal
  centavos: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change']);

const inputRef = ref(null);
const isFocused = ref(false);
const rawValue = ref('');

/**
 * Converte o valor interno (centavos ou decimal) para exibição
 */
const displayValue = computed(() => {
  if (isFocused.value) {
    return rawValue.value;
  }
  
  const value = props.modelValue;
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  let numericValue;
  if (props.centavos) {
    // Se trabalha com centavos, divide por 100
    numericValue = Number(value) / 100;
  } else {
    numericValue = Number(value);
  }
  
  if (isNaN(numericValue)) return '';
  
  // Formata no padrão brasileiro
  return formatCurrency(numericValue);
});

/**
 * Formata número para moeda brasileira (ex: 1234.56 -> 1.234,56)
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Converte string de exibição para número
 */
const parseCurrency = (value) => {
  if (!value) return null;
  
  // Remove tudo exceto números e vírgula/ponto
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Se tem vírgula, assume formato brasileiro
  if (cleaned.includes(',')) {
    // Remove pontos (separadores de milhar) e troca vírgula por ponto
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized);
  }
  
  return parseFloat(cleaned);
};

/**
 * Mantém apenas números e uma vírgula/ponto
 */
const sanitizeInput = (value) => {
  // Remove tudo exceto números, vírgula e ponto
  let cleaned = value.replace(/[^\d.,]/g, '');
  
  // Garante apenas uma vírgula ou ponto
  const parts = cleaned.split(/[.,]/);
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Limita a 2 casas decimais
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + ',' + parts[1].slice(0, 2);
  }
  
  return cleaned;
};

const handleInput = (event) => {
  const value = event.target.value;
  rawValue.value = sanitizeInput(value);
  
  const numericValue = parseCurrency(rawValue.value);
  
  if (numericValue === null) {
    emit('update:modelValue', null);
    return;
  }
  
  // Valida min/max
  if (props.min !== undefined && numericValue < props.min) {
    return;
  }
  if (props.max !== undefined && numericValue > props.max) {
    return;
  }
  
  // Converte para centavos se necessário
  const finalValue = props.centavos ? Math.round(numericValue * 100) : numericValue;
  emit('update:modelValue', finalValue);
};

const handleFocus = (event) => {
  isFocused.value = true;
  rawValue.value = displayValue.value.replace(/[^\d.,]/g, '');
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  rawValue.value = '';
  emit('blur', event);
  emit('change', props.modelValue);
};

const handleKeydown = (event) => {
  // Permite: backspace, delete, tab, escape, enter
  if ([8, 46, 9, 27, 13].includes(event.keyCode)) return;
  
  // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if ((event.ctrlKey || event.metaKey) && [65, 67, 86, 88].includes(event.keyCode)) return;
  
  // Permite: home, end, left, right
  if (event.keyCode >= 35 && event.keyCode <= 39) return;
  
  // Permite: números (tanto do topo quanto do numpad)
  if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) return;
  
  // Permite: vírgula (188) e ponto (190/110) - mas apenas um
  if (event.keyCode === 188 || event.keyCode === 190 || event.keyCode === 110) {
    const value = event.target.value;
    if (value.includes(',') || value.includes('.')) {
      event.preventDefault();
    }
    return;
  }
  
  // Bloqueia qualquer outra tecla
  event.preventDefault();
};

// Expõe métodos
const focus = () => {
  inputRef.value?.focus();
};

const select = () => {
  inputRef.value?.select();
};

defineExpose({
  focus,
  select
});
</script>
