// Motor Legal Peruano - Nuevo Código Procesal Penal (D.Leg. 957)
// Plazos procesales del sistema penal peruano

import { PlazoConfig, calcularFechaLimite } from './motor-cnpp'

export const PLAZOS_NCPP: Record<string, PlazoConfig> = {
  // ==========================================
  // DILIGENCIAS PRELIMINARES (Art. 334 NCPP)
  // ==========================================
  diligencias_preliminares_60d: {
    tipo: 'diligencias_preliminares_60d',
    nombre: 'Diligencias Preliminares',
    fundamentoLegal: 'Art. 334.2 NCPP',
    dias: 60,
    diasHabiles: false,
    descripcion: 'Plazo ordinario de diligencias preliminares',
  },
  diligencias_preliminares_120d: {
    tipo: 'diligencias_preliminares_120d',
    nombre: 'Diligencias Preliminares (prórroga)',
    fundamentoLegal: 'Art. 334.2 NCPP',
    dias: 120,
    diasHabiles: false,
    descripcion: 'Plazo prorrogado de diligencias preliminares por complejidad',
  },

  // ==========================================
  // INVESTIGACIÓN PREPARATORIA (Art. 342 NCPP)
  // ==========================================
  investigacion_preparatoria_simple: {
    tipo: 'investigacion_preparatoria_simple',
    nombre: 'Investigación Preparatoria (simple)',
    fundamentoLegal: 'Art. 342.1 NCPP',
    dias: 120,
    diasHabiles: false,
    descripcion: 'Plazo de investigación preparatoria para casos simples (120 días)',
  },
  investigacion_preparatoria_simple_prorroga: {
    tipo: 'investigacion_preparatoria_simple_prorroga',
    nombre: 'Investigación Preparatoria (simple + prórroga)',
    fundamentoLegal: 'Art. 342.1 NCPP',
    dias: 180,
    diasHabiles: false,
    descripcion: 'Plazo de investigación preparatoria simple con prórroga de 60 días',
  },
  investigacion_preparatoria_compleja: {
    tipo: 'investigacion_preparatoria_compleja',
    nombre: 'Investigación Preparatoria (compleja)',
    fundamentoLegal: 'Art. 342.3 NCPP',
    dias: 240,
    diasHabiles: false,
    descripcion: 'Plazo de investigación preparatoria para casos complejos (8 meses)',
  },
  investigacion_preparatoria_compleja_prorroga: {
    tipo: 'investigacion_preparatoria_compleja_prorroga',
    nombre: 'Investigación Preparatoria (compleja + prórroga)',
    fundamentoLegal: 'Art. 342.3 NCPP',
    dias: 480,
    diasHabiles: false,
    descripcion: 'Plazo de investigación preparatoria compleja con prórroga de igual plazo',
  },
  investigacion_preparatoria_crimen_organizado: {
    tipo: 'investigacion_preparatoria_crimen_organizado',
    nombre: 'Investigación Preparatoria (criminalidad organizada)',
    fundamentoLegal: 'Art. 342.3 NCPP, Ley 30077',
    dias: 1080,
    diasHabiles: false,
    descripcion: 'Plazo de investigación para criminalidad organizada (36 meses)',
  },
  investigacion_preparatoria_crimen_organizado_prorroga: {
    tipo: 'investigacion_preparatoria_crimen_organizado_prorroga',
    nombre: 'Investigación Preparatoria (criminalidad organizada + prórroga)',
    fundamentoLegal: 'Art. 342.3 NCPP, Ley 30077',
    dias: 2160,
    diasHabiles: false,
    descripcion: 'Plazo máximo investigación criminalidad organizada con prórroga (72 meses)',
  },

  // ==========================================
  // CONCLUSIÓN DE INVESTIGACIÓN (Art. 344 NCPP)
  // ==========================================
  plazo_acusar_sobreseer: {
    tipo: 'plazo_acusar_sobreseer',
    nombre: 'Acusación o sobreseimiento',
    fundamentoLegal: 'Art. 344.1 NCPP',
    dias: 15,
    diasHabiles: false,
    descripcion: 'Plazo del fiscal para formular acusación o solicitar sobreseimiento',
  },

  // ==========================================
  // ETAPA INTERMEDIA (Arts. 345-354 NCPP)
  // ==========================================
  traslado_acusacion: {
    tipo: 'traslado_acusacion',
    nombre: 'Traslado de acusación',
    fundamentoLegal: 'Art. 350.1 NCPP',
    dias: 10,
    diasHabiles: false,
    descripcion: 'Plazo para absolver traslado de acusación fiscal',
  },
  control_acusacion: {
    tipo: 'control_acusacion',
    nombre: 'Audiencia de control de acusación',
    fundamentoLegal: 'Art. 351 NCPP',
    dias: 0,
    diasHabiles: false,
    descripcion: 'Audiencia preliminar de control de acusación (se agenda por el juez)',
  },

  // ==========================================
  // PRISIÓN PREVENTIVA (Art. 272 NCPP)
  // ==========================================
  prision_preventiva_simple: {
    tipo: 'prision_preventiva_simple',
    nombre: 'Prisión preventiva (simple)',
    fundamentoLegal: 'Art. 272.1 NCPP',
    dias: 270,
    diasHabiles: false,
    descripcion: 'Prisión preventiva para procesos simples (9 meses)',
  },
  prision_preventiva_compleja: {
    tipo: 'prision_preventiva_compleja',
    nombre: 'Prisión preventiva (compleja)',
    fundamentoLegal: 'Art. 272.2 NCPP',
    dias: 540,
    diasHabiles: false,
    descripcion: 'Prisión preventiva para procesos complejos (18 meses)',
  },
  prision_preventiva_crimen_organizado: {
    tipo: 'prision_preventiva_crimen_organizado',
    nombre: 'Prisión preventiva (criminalidad organizada)',
    fundamentoLegal: 'Art. 272.3 NCPP',
    dias: 1080,
    diasHabiles: false,
    descripcion: 'Prisión preventiva para criminalidad organizada (36 meses)',
  },

  // ==========================================
  // PROCESO INMEDIATO (D.Leg. 1194)
  // ==========================================
  proceso_inmediato_flagrancia: {
    tipo: 'proceso_inmediato_flagrancia',
    nombre: 'Incoación proceso inmediato (flagrancia)',
    fundamentoLegal: 'Art. 446.1 NCPP, D.Leg. 1194',
    horas: 48,
    diasHabiles: false,
    descripcion: 'Plazo para que el fiscal incoe proceso inmediato en flagrancia',
  },
  proceso_inmediato_audiencia: {
    tipo: 'proceso_inmediato_audiencia',
    nombre: 'Audiencia de proceso inmediato',
    fundamentoLegal: 'Art. 447.1 NCPP, D.Leg. 1194',
    horas: 72,
    diasHabiles: false,
    descripcion: 'Plazo para realizar audiencia de proceso inmediato desde incoación',
  },
  proceso_inmediato_juicio: {
    tipo: 'proceso_inmediato_juicio',
    nombre: 'Juicio inmediato oral',
    fundamentoLegal: 'Art. 448 NCPP, D.Leg. 1194',
    horas: 72,
    diasHabiles: false,
    descripcion: 'Plazo para inicio de juicio oral en proceso inmediato',
  },

  // ==========================================
  // RECURSOS IMPUGNATORIOS (Arts. 413-445 NCPP)
  // ==========================================
  recurso_reposicion: {
    tipo: 'recurso_reposicion',
    nombre: 'Recurso de reposición',
    fundamentoLegal: 'Art. 415 NCPP',
    dias: 2,
    diasHabiles: true,
    descripcion: 'Plazo para interponer recurso de reposición contra decretos',
  },
  apelacion_auto: {
    tipo: 'apelacion_auto',
    nombre: 'Apelación de auto',
    fundamentoLegal: 'Art. 414.1.b NCPP',
    dias: 3,
    diasHabiles: true,
    descripcion: 'Plazo para apelar autos judiciales',
  },
  apelacion_sentencia: {
    tipo: 'apelacion_sentencia',
    nombre: 'Apelación de sentencia',
    fundamentoLegal: 'Art. 414.1.a NCPP',
    dias: 5,
    diasHabiles: true,
    descripcion: 'Plazo para apelar sentencias de primera instancia',
  },
  recurso_casacion: {
    tipo: 'recurso_casacion',
    nombre: 'Recurso de casación',
    fundamentoLegal: 'Art. 414.1.c NCPP',
    dias: 10,
    diasHabiles: true,
    descripcion: 'Plazo para interponer recurso de casación ante la Corte Suprema',
  },
  recurso_queja: {
    tipo: 'recurso_queja',
    nombre: 'Recurso de queja',
    fundamentoLegal: 'Art. 437 NCPP',
    dias: 3,
    diasHabiles: true,
    descripcion: 'Plazo para interponer recurso de queja por apelación denegada',
  },

  // ==========================================
  // DETENCIÓN (Arts. 259-267 NCPP)
  // ==========================================
  detencion_policial_flagrancia: {
    tipo: 'detencion_policial_flagrancia',
    nombre: 'Detención policial en flagrancia',
    fundamentoLegal: 'Art. 264.1 NCPP',
    horas: 48,
    diasHabiles: false,
    descripcion: 'Plazo máximo de detención policial en flagrancia',
  },
  detencion_preliminar_judicial: {
    tipo: 'detencion_preliminar_judicial',
    nombre: 'Detención preliminar judicial',
    fundamentoLegal: 'Art. 264.1 NCPP',
    horas: 72,
    diasHabiles: false,
    descripcion: 'Plazo máximo de detención preliminar judicial (casos complejos)',
  },
  detencion_crimen_organizado: {
    tipo: 'detencion_crimen_organizado',
    nombre: 'Detención por criminalidad organizada',
    fundamentoLegal: 'Art. 264.1 NCPP (modificado)',
    dias: 15,
    diasHabiles: false,
    descripcion: 'Plazo máximo de detención para casos de criminalidad organizada',
  },

  // ==========================================
  // TUTELA DE DERECHOS (Art. 71 NCPP)
  // ==========================================
  tutela_derechos: {
    tipo: 'tutela_derechos',
    nombre: 'Audiencia de tutela de derechos',
    fundamentoLegal: 'Art. 71.4 NCPP',
    dias: 0,
    diasHabiles: false,
    descripcion: 'Solicitud de audiencia de tutela de derechos ante el JIP (sin plazo fijo)',
  },

  // ==========================================
  // TERMINACIÓN ANTICIPADA (Art. 468 NCPP)
  // ==========================================
  terminacion_anticipada: {
    tipo: 'terminacion_anticipada',
    nombre: 'Solicitud de terminación anticipada',
    fundamentoLegal: 'Art. 468 NCPP',
    dias: 0,
    diasHabiles: false,
    descripcion: 'Solicitud de terminación anticipada del proceso (hasta antes de acusación)',
  },
}

// Etapas procesales peruanas con sus descripciones
export const ETAPAS_NCPP = {
  diligencias_preliminares: {
    nombre: 'Diligencias Preliminares',
    descripcion: 'Investigación inicial dirigida por el fiscal con apoyo policial',
    orden: 1,
  },
  investigacion_preparatoria: {
    nombre: 'Investigación Preparatoria',
    descripcion: 'Investigación formalizada por el fiscal ante el Juez de Investigación Preparatoria',
    orden: 2,
  },
  etapa_intermedia: {
    nombre: 'Etapa Intermedia',
    descripcion: 'Control de acusación o sobreseimiento por el Juez de Investigación Preparatoria',
    orden: 3,
  },
  juzgamiento: {
    nombre: 'Juzgamiento',
    descripcion: 'Juicio oral ante el Juez Penal Unipersonal o Juzgado Penal Colegiado',
    orden: 4,
  },
  impugnacion: {
    nombre: 'Impugnación',
    descripcion: 'Recursos ante Sala Penal Superior o Corte Suprema',
    orden: 5,
  },
  ejecucion: {
    nombre: 'Ejecución',
    descripcion: 'Ejecución de la sentencia',
    orden: 6,
  },
}

// Tipos de audiencias peruanas
export const AUDIENCIAS_NCPP = [
  'control_identidad',
  'detencion_preliminar',
  'prision_preventiva',
  'prolongacion_prision',
  'cesacion_prision',
  'tutela_derechos',
  'control_plazo',
  'principio_oportunidad',
  'acuerdo_reparatorio',
  'terminacion_anticipada',
  'control_acusacion',
  'juicio_oral',
  'proceso_inmediato',
  'lectura_sentencia',
  'apelacion',
  'casacion',
  'otra',
] as const

// Tipos de partes en el proceso peruano
export const PARTES_NCPP = [
  'imputado',
  'agraviado',
  'actor_civil',
  'tercero_civil',
  'testigo',
  'perito',
  'fiscal',
  'procurador_publico',
  'abogado_defensor',
  'juez',
  'policia',
] as const

// Delitos frecuentes en el sistema peruano
export const DELITOS_PERU = [
  'Hurto',
  'Hurto agravado',
  'Robo',
  'Robo agravado',
  'Homicidio simple',
  'Homicidio calificado',
  'Feminicidio',
  'Lesiones graves',
  'Lesiones leves',
  'Violación sexual',
  'Tocamientos indebidos',
  'Secuestro',
  'Extorsión',
  'Tráfico ilícito de drogas',
  'Microcomercialización de drogas',
  'Lavado de activos',
  'Estafa',
  'Apropiación ilícita',
  'Usurpación',
  'Daños',
  'Falsificación de documentos',
  'Peculado',
  'Cohecho',
  'Conducción en estado de ebriedad',
  'Omisión a la asistencia familiar',
  'Violencia familiar',
  'Tenencia ilegal de armas',
  'Marcaje o reglaje',
  'Sicariato',
  'Organización criminal',
] as const

// Genera plazos iniciales para un caso peruano
export function generarPlazosInicialesPeru(
  fechaDetencion: Date,
  complejidad: 'simple' | 'complejo' | 'crimen_organizado' = 'simple'
): { tipo: string; config: PlazoConfig; fechaInicio: Date; fechaLimite: Date }[] {
  const plazos = []

  // 1. Detención policial (48h desde flagrancia)
  const detencionKey = complejidad === 'crimen_organizado'
    ? 'detencion_crimen_organizado'
    : 'detencion_policial_flagrancia'
  const detencionConfig = PLAZOS_NCPP[detencionKey]
  plazos.push({
    tipo: detencionKey,
    config: detencionConfig,
    fechaInicio: fechaDetencion,
    fechaLimite: calcularFechaLimite(fechaDetencion, detencionConfig),
  })

  // 2. Diligencias preliminares (60 días)
  const dpConfig = PLAZOS_NCPP['diligencias_preliminares_60d']
  plazos.push({
    tipo: 'diligencias_preliminares_60d',
    config: dpConfig,
    fechaInicio: fechaDetencion,
    fechaLimite: calcularFechaLimite(fechaDetencion, dpConfig),
  })

  // 3. Investigación preparatoria según complejidad
  const ipKey = complejidad === 'crimen_organizado'
    ? 'investigacion_preparatoria_crimen_organizado'
    : complejidad === 'complejo'
    ? 'investigacion_preparatoria_compleja'
    : 'investigacion_preparatoria_simple'
  const ipConfig = PLAZOS_NCPP[ipKey]
  const dpFin = calcularFechaLimite(fechaDetencion, dpConfig)
  plazos.push({
    tipo: ipKey,
    config: ipConfig,
    fechaInicio: dpFin,
    fechaLimite: calcularFechaLimite(dpFin, ipConfig),
  })

  // 4. Prisión preventiva según complejidad
  const ppKey = complejidad === 'crimen_organizado'
    ? 'prision_preventiva_crimen_organizado'
    : complejidad === 'complejo'
    ? 'prision_preventiva_compleja'
    : 'prision_preventiva_simple'
  const ppConfig = PLAZOS_NCPP[ppKey]
  plazos.push({
    tipo: ppKey,
    config: ppConfig,
    fechaInicio: fechaDetencion,
    fechaLimite: calcularFechaLimite(fechaDetencion, ppConfig),
  })

  return plazos
}
