/**
 * useValidation - Composable para validação de formulários
 * 
 * Integração com Zod para validação client-side usando os mesmos
 * schemas que o backend.
 * 
 * Uso:
 * const { validate, errors, clearError, clearAllErrors } = useValidation(clienteSchema);
 * const result = validate({ nome: 'João', cpfCnpj: '123' });
 * if (result.success) { ... }
 */

import { ref, computed } from 'vue';
import type { ZodSchema, ZodError } from 'zod';

export interface ValidationErrors {
  [key: string]: string;
}

export function useValidation<T>(schema: ZodSchema<T>) {
  const errors = ref<ValidationErrors>({});

  /**
   * Valida os dados contra o schema
   * Retorna { success: true, data: T } ou { success: false, errors: ValidationErrors }
   */
  const validate = (data: unknown): { success: boolean; data?: T; errors?: ValidationErrors } => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      errors.value = {};
      return { success: true, data: result.data };
    }
    
    // Converte erros Zod para formato plano
    const formattedErrors: ValidationErrors = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      formattedErrors[path] = err.message;
    });
    
    errors.value = formattedErrors;
    return { success: false, errors: formattedErrors };
  };

  /**
   * Valida um campo específico
   */
  const validateField = (fieldName: string, value: unknown): string | null => {
    // Cria um schema parcial apenas com o campo especificado
    const partialSchema = schema.pick({ [fieldName]: true } as any);
    const result = partialSchema.safeParse({ [fieldName]: value });
    
    if (result.success) {
      delete errors.value[fieldName];
      return null;
    }
    
    const errorMessage = result.error.errors[0]?.message || 'Campo inválido';
    errors.value[fieldName] = errorMessage;
    return errorMessage;
  };

  /**
   * Limpa o erro de um campo específico
   */
  const clearError = (fieldName: string) => {
    delete errors.value[fieldName];
  };

  /**
   * Limpa todos os erros
   */
  const clearAllErrors = () => {
    errors.value = {};
  };

  /**
   * Verifica se há erros
   */
  const hasErrors = computed(() => Object.keys(errors.value).length > 0);

  /**
   * Obtém o erro de um campo específico
   */
  const getError = (fieldName: string): string | undefined => {
    return errors.value[fieldName];
  };

  /**
   * Verifica se um campo específico tem erro
   */
  const hasError = (fieldName: string): boolean => {
    return !!errors.value[fieldName];
  };

  return {
    errors,
    hasErrors,
    validate,
    validateField,
    clearError,
    clearAllErrors,
    getError,
    hasError,
  };
}

/**
 * Helper para validação de CPF/CNPJ em tempo real
 */
export function useCpfCnpjValidation() {
  const validarCpf = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    const cpfs = cpf.split('').map((el) => +el);
    const rest = (count: number) =>
      ((cpfs.slice(0, count - 12).reduce((s, el, i) => s + el * (count - i), 0) *
        10) %
        11) %
      10;
    return rest(10) === cpfs[9] && rest(11) === cpfs[10];
  };

  const validarCnpj = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
    const size = cnpj.length - 2;
    const numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let length = size;
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    length = length + 1;
    const numbers2 = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers2.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
  };

  const validar = (value: string): { valido: boolean; tipo?: 'CPF' | 'CNPJ' } => {
    const clean = value.replace(/[^\d]+/g, '');
    
    if (clean.length === 11) {
      return { valido: validarCpf(clean), tipo: 'CPF' };
    }
    if (clean.length === 14) {
      return { valido: validarCnpj(clean), tipo: 'CNPJ' };
    }
    
    return { valido: false };
  };

  const formatar = (value: string): string => {
    const clean = value.replace(/[^\d]+/g, '');
    
    if (clean.length <= 11) {
      // CPF: 000.000.000-00
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  return {
    validarCpf,
    validarCnpj,
    validar,
    formatar,
  };
}

/**
 * Helper para formatação de valores monetários
 */
export function useCurrencyFormat() {
  /**
   * Formata centavos para moeda brasileira (ex: 123456 -> R$ 1.234,56)
   */
  const formatarCentavos = (centavos: number | null | undefined): string => {
    if (centavos === null || centavos === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  /**
   * Formata número para moeda brasileira (ex: 1234.56 -> R$ 1.234,56)
   */
  const formatarDecimal = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  /**
   * Converte string de moeda para centavos
   */
  const paraCentavos = (valor: string): number => {
    const clean = valor.replace(/[^\d,]/g, '').replace(',', '.');
    return Math.round(parseFloat(clean || '0') * 100);
  };

  /**
   * Converte string de moeda para decimal
   */
  const paraDecimal = (valor: string): number => {
    const clean = valor.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean || '0');
  };

  return {
    formatarCentavos,
    formatarDecimal,
    paraCentavos,
    paraDecimal,
  };
}

/**
 * Helper para máscaras de input
 */
export function useInputMask() {
  /**
   * Aplica máscara de telefone (00) 00000-0000
   */
  const telefone = (value: string): string => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  /**
   * Aplica máscara de CEP 00000-000
   */
  const cep = (value: string): string => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  /**
   * Aplica máscara de placa (Mercosul ou antiga)
   */
  const placa = (value: string): string => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Mercosul: ABC1D23
    if (clean.length > 4 && /^[A-Z]{3}[0-9][A-Z0-9]/.test(clean)) {
      return clean.slice(0, 7);
    }
    // Antiga: ABC-1234
    return clean.slice(0, 7);
  };

  /**
   * Aplica máscara de CPF/CNPJ dinâmica
   */
  const cpfCnpj = (value: string): string => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return {
    telefone,
    cep,
    placa,
    cpfCnpj,
  };
}
