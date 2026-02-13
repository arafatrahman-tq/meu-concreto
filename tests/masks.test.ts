import { describe, it, expect } from 'bun:test'
import { applyMask } from '../app/utils/masks'

describe('Input Mask Utilities', () => {
  it('should mask CPF correctly', () => {
    expect(applyMask('12345678901', 'cpf')).toBe('123.456.789-01')
    expect(applyMask('12345', 'cpf')).toBe('123.45')
  })

  it('should mask CNPJ correctly', () => {
    expect(applyMask('12345678000195', 'cnpj')).toBe('12.345.678/0001-95')
  })

  it('should mask CEP correctly', () => {
    expect(applyMask('01001000', 'cep')).toBe('01001-000')
  })

  it('should mask Phone correctly (11 digits)', () => {
    expect(applyMask('11999999999', 'phone')).toBe('(11) 99999-9999')
  })

  it('should mask Phone correctly (10 digits)', () => {
    expect(applyMask('1188888888', 'phone')).toBe('(11) 8888-8888')
  })

  it('should handle empty values', () => {
    expect(applyMask('', 'cpf')).toBe('')
    expect(applyMask(null, 'cpf')).toBe('')
    expect(applyMask(undefined, 'cpf')).toBe('')
  })

  it('should handle cpfCnpj dynamic mask', () => {
    // CPF case
    expect(applyMask('12345678901', 'cpfCnpj')).toBe('123.456.789-01')
    // CNPJ case
    expect(applyMask('12345678000195', 'cpfCnpj')).toBe('12.345.678/0001-95')
  })
})
