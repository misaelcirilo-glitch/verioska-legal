export interface Cliente {
  id: string
  despachoId: string
  nombre: string
  apellidos?: string
  tipoDocumento?: string
  numeroDocumento?: string
  telefono?: string
  email?: string
  direccion?: string
  estado: 'prospecto' | 'activo' | 'inactivo' | 'archivado'
  fuente?: 'referido' | 'web' | 'redes_sociales' | 'directorio' | 'otro'
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface Cotizacion {
  id: string
  despachoId: string
  clienteId: string
  expedienteId?: string
  montoTotal: number
  moneda: 'PEN' | 'MXN' | 'USD'
  modeloCobro: 'tramos' | 'fijo' | 'hora' | 'exito' | 'mixto'
  desglose: DesgloseCotizacion[]
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida'
  vigenciaDias: number
  notas?: string
  createdAt: string
}

export interface DesgloseCotizacion {
  etapa?: string
  descripcion: string
  monto: number
  bonus?: boolean
}

export interface Pago {
  id: string
  despachoId: string
  expedienteId: string
  clienteId: string
  cotizacionId?: string
  monto: number
  moneda: string
  concepto: string
  etapaProcesal?: string
  metodoPago?: string
  estado: 'pendiente' | 'pagado' | 'parcial' | 'vencido' | 'cancelado'
  fechaVencimiento?: string
  fechaPago?: string
  comprobante?: string
  notas?: string
  createdAt: string
}

export interface Gasto {
  id: string
  despachoId: string
  expedienteId: string
  concepto: string
  categoria?: string
  monto: number
  moneda: string
  fechaGasto: string
  comprobante?: string
  notas?: string
  createdAt: string
}
