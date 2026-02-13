export function generateStaticPix(options: {
  chave: string
  beneficiario: string
  cidade: string
  valor?: number
  identificador?: string
}): string {
  const pad = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0')
    return `${id}${len}${value}`
  }

  // 00 - Payload Format Indicator
  let payload = pad('00', '01')

  // 26 - Merchant Account Information (Pix)
  const gui = pad('00', 'br.gov.bcb.pix')
  const key = pad('01', options.chave)
  payload += pad('26', `${gui}${key}`)

  // 52 - Merchant Category Code (0000 - Not specified)
  payload += pad('52', '0000')

  // 53 - Transaction Currency (986 - BRL)
  payload += pad('53', '986')

  // 54 - Transaction Amount
  if (options.valor) {
    payload += pad('54', options.valor.toFixed(2))
  }

  // 58 - Country Code (BR)
  payload += pad('58', 'BR')

  // 59 - Merchant Name
  // Remove acentos e limita a 25 caracteres recomendados
  const beneficiario = options.beneficiario
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 25)
  payload += pad('59', beneficiario)

  // 60 - Merchant City
  const cidade = options.cidade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .substring(0, 15)
  payload += pad('60', cidade)

  // 62 - Additional Data Field Template
  // TxID para Pix estático
  const txid = pad('05', options.identificador || '***')
  payload += pad('62', txid)

  // 63 - CRC16
  payload += '6304'
  payload += calculateCRC16(payload)

  return payload
}

function calculateCRC16(payload: string): string {
  let result = 0xffff
  if (payload.length > 0) {
    for (let offset = 0; offset < payload.length; offset++) {
      result ^= payload.charCodeAt(offset) << 8
      for (let bitwise = 0; bitwise < 8; bitwise++) {
        if ((result <<= 1) & 0x10000) result ^= 0x1021
        result &= 0xffff
      }
    }
  }
  return result.toString(16).toUpperCase().padStart(4, '0')
}
