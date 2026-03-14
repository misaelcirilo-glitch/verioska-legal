export interface Documento {
  id: string
  expedienteId: string
  nombreArchivo: string
  tipoArchivo: 'pdf' | 'imagen' | 'audio' | 'video' | 'otro'
  tipoDocumento: string | null
  etapaProcesal: string | null
  rutaArchivo: string
  tamanoBytes: number | null
  procesado: boolean
  textoExtraido: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export const TIPOS_DOCUMENTO = [
  { value: 'declaracion_ministerial', label: 'Declaración Ministerial' },
  { value: 'declaracion_judicial', label: 'Declaración Judicial' },
  { value: 'ampliacion_declaracion', label: 'Ampliación de Declaración' },
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'dictamen', label: 'Dictamen' },
  { value: 'acta_circunstanciada', label: 'Acta Circunstanciada' },
  { value: 'informe_policial', label: 'Informe Policial' },
  { value: 'cadena_custodia', label: 'Cadena de Custodia' },
  { value: 'constancia', label: 'Constancia' },
  { value: 'acuerdo_juez', label: 'Acuerdo de Juez' },
  { value: 'fotografia_evidencia', label: 'Fotografía de Evidencia' },
  { value: 'audio_audiencia', label: 'Audio de Audiencia' },
  { value: 'video_audiencia', label: 'Video de Audiencia' },
  { value: 'otro', label: 'Otro' },
] as const

export const ETAPAS_PROCESALES = [
  { value: 'investigacion_inicial', label: 'Investigación Inicial' },
  { value: 'investigacion_complementaria', label: 'Inv. Complementaria' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'juicio_oral', label: 'Juicio Oral' },
  { value: 'ejecucion', label: 'Ejecución' },
  { value: 'amparo', label: 'Amparo' },
  { value: 'apelacion', label: 'Apelación' },
] as const
