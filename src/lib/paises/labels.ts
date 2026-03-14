// Labels centralizados para ambos países
// Permite que los componentes muestren terminología correcta por país

export const etapaLabels: Record<string, string> = {
  // México (CNPP)
  investigacion_inicial: 'Investigación Inicial',
  investigacion_complementaria: 'Inv. Complementaria',
  intermedia: 'Intermedia',
  juicio_oral: 'Juicio Oral',
  ejecucion: 'Ejecución',
  amparo: 'Amparo',
  apelacion: 'Apelación',
  // Perú (NCPP)
  diligencias_preliminares: 'Diligencias Preliminares',
  investigacion_preparatoria: 'Inv. Preparatoria',
  etapa_intermedia: 'Etapa Intermedia',
  juzgamiento: 'Juzgamiento',
  impugnacion: 'Impugnación',
}

export const etapaBadge: Record<string, 'info' | 'warning' | 'danger' | 'success' | 'neutral'> = {
  // México
  investigacion_inicial: 'info',
  investigacion_complementaria: 'info',
  intermedia: 'warning',
  juicio_oral: 'danger',
  ejecucion: 'neutral',
  amparo: 'warning',
  apelacion: 'warning',
  // Perú
  diligencias_preliminares: 'info',
  investigacion_preparatoria: 'info',
  etapa_intermedia: 'warning',
  juzgamiento: 'danger',
  impugnacion: 'warning',
}

export const tipoAudienciaLabels: Record<string, string> = {
  // México
  control_detencion: 'Control de Detención',
  formulacion_imputacion: 'Formulación de Imputación',
  vinculacion_proceso: 'Vinculación a Proceso',
  medidas_cautelares: 'Medidas Cautelares',
  plazo_cierre_investigacion: 'Cierre de Investigación',
  intermedia: 'Intermedia',
  juicio_oral: 'Juicio Oral',
  individualizacion_sancion: 'Individualización de Sanción',
  amparo: 'Amparo',
  apelacion: 'Apelación',
  otra: 'Otra',
  // Perú
  control_identidad: 'Control de Identidad',
  detencion_preliminar: 'Detención Preliminar',
  prision_preventiva: 'Prisión Preventiva',
  prolongacion_prision: 'Prolongación de Prisión',
  cesacion_prision: 'Cesación de Prisión',
  tutela_derechos: 'Tutela de Derechos',
  control_plazo: 'Control de Plazo',
  principio_oportunidad: 'Principio de Oportunidad',
  acuerdo_reparatorio: 'Acuerdo Reparatorio',
  terminacion_anticipada: 'Terminación Anticipada',
  control_acusacion: 'Control de Acusación',
  proceso_inmediato: 'Proceso Inmediato',
  lectura_sentencia: 'Lectura de Sentencia',
  casacion: 'Casación',
  ejecucion: 'Ejecución',
}

export const tipoParteLabels: Record<string, string> = {
  // México
  imputado: 'Imputado',
  victima: 'Víctima',
  testigo: 'Testigo',
  perito: 'Perito',
  ministerio_publico: 'Ministerio Público',
  defensor: 'Defensor',
  asesor_juridico: 'Asesor Jurídico',
  juez: 'Juez',
  policia: 'Policía',
  // Perú
  agraviado: 'Agraviado',
  actor_civil: 'Actor Civil',
  tercero_civil: 'Tercero Civil',
  fiscal: 'Fiscal',
  procurador_publico: 'Procurador Público',
  abogado_defensor: 'Abogado Defensor',
}

// Opciones de audiencias por país
export const TIPOS_AUDIENCIA_MX = [
  { value: 'control_detencion', label: 'Control de Detención' },
  { value: 'formulacion_imputacion', label: 'Formulación de Imputación' },
  { value: 'vinculacion_proceso', label: 'Vinculación a Proceso' },
  { value: 'medidas_cautelares', label: 'Medidas Cautelares' },
  { value: 'plazo_cierre_investigacion', label: 'Cierre de Investigación' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'juicio_oral', label: 'Juicio Oral' },
  { value: 'individualizacion_sancion', label: 'Individualización de Sanción' },
  { value: 'ejecucion', label: 'Ejecución' },
  { value: 'amparo', label: 'Amparo' },
  { value: 'apelacion', label: 'Apelación' },
  { value: 'otra', label: 'Otra' },
]

export const TIPOS_AUDIENCIA_PE = [
  { value: 'control_identidad', label: 'Control de Identidad' },
  { value: 'detencion_preliminar', label: 'Detención Preliminar' },
  { value: 'prision_preventiva', label: 'Prisión Preventiva' },
  { value: 'prolongacion_prision', label: 'Prolongación de Prisión' },
  { value: 'cesacion_prision', label: 'Cesación de Prisión' },
  { value: 'tutela_derechos', label: 'Tutela de Derechos' },
  { value: 'control_plazo', label: 'Control de Plazo' },
  { value: 'principio_oportunidad', label: 'Principio de Oportunidad' },
  { value: 'acuerdo_reparatorio', label: 'Acuerdo Reparatorio' },
  { value: 'terminacion_anticipada', label: 'Terminación Anticipada' },
  { value: 'control_acusacion', label: 'Control de Acusación' },
  { value: 'juicio_oral', label: 'Juicio Oral' },
  { value: 'proceso_inmediato', label: 'Proceso Inmediato' },
  { value: 'lectura_sentencia', label: 'Lectura de Sentencia' },
  { value: 'apelacion', label: 'Apelación' },
  { value: 'casacion', label: 'Casación' },
  { value: 'otra', label: 'Otra' },
]

// Opciones de partes por país
export const TIPOS_PARTE_MX = [
  { value: 'imputado', label: 'Imputado' },
  { value: 'victima', label: 'Víctima' },
  { value: 'testigo', label: 'Testigo' },
  { value: 'perito', label: 'Perito' },
  { value: 'ministerio_publico', label: 'Ministerio Público' },
  { value: 'defensor', label: 'Defensor' },
  { value: 'asesor_juridico', label: 'Asesor Jurídico' },
  { value: 'juez', label: 'Juez' },
  { value: 'policia', label: 'Policía' },
]

export const TIPOS_PARTE_PE = [
  { value: 'imputado', label: 'Imputado' },
  { value: 'agraviado', label: 'Agraviado' },
  { value: 'actor_civil', label: 'Actor Civil' },
  { value: 'tercero_civil', label: 'Tercero Civil' },
  { value: 'testigo', label: 'Testigo' },
  { value: 'perito', label: 'Perito' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'procurador_publico', label: 'Procurador Público' },
  { value: 'abogado_defensor', label: 'Abogado Defensor' },
  { value: 'juez', label: 'Juez' },
  { value: 'policia', label: 'Policía' },
]
