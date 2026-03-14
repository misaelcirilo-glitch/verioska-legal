// Expedientes
export interface Expediente {
  id: string
  userId: string
  despachoId?: string
  nuc?: string
  carpetaInvestigacion?: string
  causaPenal?: string
  delito: string
  juzgado?: string
  distritoJudicial?: string
  fiscalia?: string
  etapaProcesal: EtapaProcesal
  fechaHechos?: string
  fechaDetencion?: string
  fechaPuestaDisposicion?: string
  fechaFormulacion?: string
  fechaVinculacion?: string
  fechaCierreComplementaria?: string
  duplicidadTermino: boolean
  estado: 'activo' | 'archivado' | 'cerrado'
  notas?: string
  createdAt: string
  updatedAt: string
}

export type EtapaProcesal =
  | 'investigacion_inicial'
  | 'investigacion_complementaria'
  | 'intermedia'
  | 'juicio_oral'
  | 'ejecucion'
  | 'amparo'
  | 'apelacion'

// Plazos
export interface Plazo {
  id: string
  expedienteId: string
  tipoPlazo: string
  fundamentoLegal?: string
  descripcion?: string
  fechaInicio: string
  fechaLimite: string
  horasTotales?: number
  diasTotales?: number
  diasHabiles: boolean
  estado: EstadoPlazo
  alertaEnviadaEmail: boolean
  alertaEnviadaWhatsapp: boolean
  notas?: string
  createdAt: string
  updatedAt: string
}

export type EstadoPlazo = 'activo' | 'proximo' | 'critico' | 'vencido' | 'cumplido' | 'cancelado'

// Audiencias
export interface Audiencia {
  id: string
  expedienteId: string
  tipoAudiencia: TipoAudiencia
  fechaProgramada: string
  fechaRealizada?: string
  sala?: string
  juzgado?: string
  juez?: string
  estado: 'programada' | 'realizada' | 'diferida' | 'cancelada' | 'suspendida'
  resultado?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

export type TipoAudiencia =
  | 'control_detencion'
  | 'formulacion_imputacion'
  | 'vinculacion_proceso'
  | 'medidas_cautelares'
  | 'plazo_cierre_investigacion'
  | 'intermedia'
  | 'juicio_oral'
  | 'individualizacion_sancion'
  | 'ejecucion'
  | 'amparo'
  | 'apelacion'
  | 'otra'

// Partes
export interface Parte {
  id: string
  expedienteId: string
  tipo: TipoParte
  nombre: string
  apellidos?: string
  alias?: string
  edad?: number
  genero?: string
  datosContacto?: Record<string, string>
  notas?: string
  createdAt: string
}

export type TipoParte =
  | 'imputado'
  | 'victima'
  | 'testigo'
  | 'perito'
  | 'ministerio_publico'
  | 'defensor'
  | 'asesor_juridico'
  | 'juez'
  | 'policia'

// User
export interface User {
  id: string
  email: string
  nombre: string
  apellidos: string
  cedulaProfesional?: string
  telefono?: string
  despachoId?: string
  rol: 'admin' | 'abogado' | 'pasante' | 'asistente'
  activo: boolean
  createdAt: string
  updatedAt: string
}
