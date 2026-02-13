export interface FiscalEmitResponse {
  sucesso: boolean
  numero?: number
  serie?: string
  chave?: string
  link?: string
  error?: string
}

export interface FiscalProvider {
  name: string
  emitNfe(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse>
  emitNfse(idEmpresa: number, vendaData: any): Promise<FiscalEmitResponse>
}
