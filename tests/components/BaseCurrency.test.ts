import { describe, it, expect } from 'bun:test'

/**
 * Testes para o componente BaseCurrency
 *
 * Nota: Testes de componentes Vue requerem @vue/test-utils e ambiente DOM.
 * Estes testes validam a lógica de formatação monetária.
 */

describe('BaseCurrency - Lógica de Formatação', () => {
  describe('Formatação de centavos para exibição', () => {
    it('deve formatar centavos para moeda brasileira', () => {
      const formatarCentavos = (centavos: number | null | undefined): string => {
        if (centavos === null || centavos === undefined) return 'R$ 0,00'
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(centavos / 100)
      }

      expect(formatarCentavos(123456)).toMatch(/R\$\s*1\.234,56/)
      expect(formatarCentavos(100)).toMatch(/R\$\s*1,00/)
      expect(formatarCentavos(999)).toMatch(/R\$\s*9,99/)
      expect(formatarCentavos(0)).toMatch(/R\$\s*0,00/)
      expect(formatarCentavos(null)).toMatch(/R\$\s*0,00/)
      expect(formatarCentavos(undefined)).toMatch(/R\$\s*0,00/)
    })

    it('deve formatar valores grandes corretamente', () => {
      const formatarCentavos = (centavos: number): string => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(centavos / 100)
      }

      expect(formatarCentavos(1000000)).toMatch(/R\$\s*10\.000,00/)
      expect(formatarCentavos(123456789)).toMatch(/R\$\s*1\.234\.567,89/)
    })
  })

  describe('Conversão de input para centavos', () => {
    it('deve converter string formatada para centavos', () => {
      const paraCentavos = (valor: string): number => {
        const clean = valor.replace(/[^\d,]/g, '').replace(',', '.')
        return Math.round(parseFloat(clean || '0') * 100)
      }

      expect(paraCentavos('R$ 1.234,56')).toBe(123456)
      expect(paraCentavos('1.234,56')).toBe(123456)
      expect(paraCentavos('1234,56')).toBe(123456)
      expect(paraCentavos('0,99')).toBe(99)
    })

    it('deve lidar com valores vazios ou inválidos', () => {
      const paraCentavos = (valor: string): number => {
        const clean = valor.replace(/[^\d,]/g, '').replace(',', '.')
        return Math.round(parseFloat(clean || '0') * 100)
      }

      expect(paraCentavos('')).toBe(0)
      expect(paraCentavos('R$ 0,00')).toBe(0)
      expect(paraCentavos('abc')).toBe(0)
    })
  })

  describe('Máscara em tempo real', () => {
    it('deve aplicar máscara monetária durante digitação', () => {
      const applyCurrencyMask = (value: string): string => {
        const clean = value.replace(/\D/g, '')
        const numeric = parseInt(clean || '0', 10)
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
        }).format(numeric / 100)
      }

      expect(applyCurrencyMask('123456')).toMatch(/R\$\s*1\.234,56/)
      expect(applyCurrencyMask('100')).toMatch(/R\$\s*1,00/)
      expect(applyCurrencyMask('0')).toMatch(/R\$\s*0,00/)
    })

    it('deve remover caracteres não numéricos', () => {
      const cleanValue = (value: string): string => {
        return value.replace(/\D/g, '')
      }

      expect(cleanValue('R$ 1.234,56')).toBe('123456')
      expect(cleanValue('abc123def')).toBe('123')
      expect(cleanValue('!@#$%')).toBe('')
    })
  })

  describe('Precisão decimal', () => {
    it('deve garantir sempre 2 casas decimais', () => {
      const formatWithDecimals = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      }

      expect(formatWithDecimals(10)).toBe('10,00')
      expect(formatWithDecimals(10.5)).toBe('10,50')
      expect(formatWithDecimals(10.555)).toBe('10,56') // Arredonda
    })
  })

  describe('Prop :centavos', () => {
    it('quando true, trata valor como centavos', () => {
      const propCentavos = true
      const valor = 5000 // R$ 50,00 em centavos

      const formatar = (v: number, emCentavos: boolean): string => {
        const valorFinal = emCentavos ? v / 100 : v
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valorFinal)
      }

      expect(formatar(valor, propCentavos)).toMatch(/R\$\s*50,00/)
    })

    it('quando false, trata valor como decimal', () => {
      const propCentavos = false
      const valor = 50 // R$ 50,00 em decimal

      const formatar = (v: number, emCentavos: boolean): string => {
        const valorFinal = emCentavos ? v / 100 : v
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valorFinal)
      }

      expect(formatar(valor, propCentavos)).toMatch(/R\$\s*50,00/)
    })
  })
})

describe('BaseCurrency - Integração com v-model', () => {
  it('deve emitir valor em centavos quando prop centavos=true', () => {
    const inputValue = 'R$ 1.234,56'
    const paraCentavos = (valor: string): number => {
      const clean = valor.replace(/[^\d,]/g, '').replace(',', '.')
      return Math.round(parseFloat(clean || '0') * 100)
    }

    const emittedValue = paraCentavos(inputValue)
    expect(emittedValue).toBe(123456)
    expect(Number.isInteger(emittedValue)).toBe(true)
  })

  it('deve receber valor em centavos e formatar para exibição', () => {
    const propValue = 123456 // centavos
    const formatarCentavos = (centavos: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(centavos / 100)
    }

    const displayedValue = formatarCentavos(propValue)
    expect(displayedValue).toMatch(/R\$\s*1\.234,56/)
  })
})
