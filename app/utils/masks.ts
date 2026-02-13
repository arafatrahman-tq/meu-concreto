/**
 * Utilitários de Máscara para Input
 */

export const applyMask = (
  value: string | number | undefined | null,
  maskType: string,
): string => {
  if (!value) return ''
  const clean = String(value).replace(/\D/g, '')

  if (maskType === 'cpf') {
    let v = clean.substring(0, 11)
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    return v
  }

  if (maskType === 'cnpj') {
    let v = clean.substring(0, 14)
    v = v.replace(/^(\d{2})(\d)/, '$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
    v = v.replace(/(\d{4})(\d)/, '$1-$2')
    return v
  }

  if (maskType === 'cpfCnpj') {
    if (clean.length <= 11) {
      let v = clean.substring(0, 11)
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      return v
    }
    else {
      let v = clean.substring(0, 14)
      v = v.replace(/^(\d{2})(\d)/, '$1.$2')
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
      v = v.replace(/(\d{4})(\d)/, '$1-$2')
      return v
    }
  }

  if (maskType === 'phone') {
    let v = clean.substring(0, 11)
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    if (v.length > 9) v = v.replace(/(\d)(\d{4})$/, '$1-$2')
    return v
  }

  if (maskType === 'cep') {
    let v = clean.substring(0, 8)
    v = v.replace(/(\d{5})(\d)/, '$1-$2')
    return v
  }

  return String(value)
}
