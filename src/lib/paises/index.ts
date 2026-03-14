// Sistema de configuración multi-país
// Cada país tiene su motor legal, etapas, audiencias, partes y terminología

import { PlazoConfig, PLAZOS_CNPP } from '@/features/plazos/services/motor-cnpp'
import {
  PLAZOS_NCPP,
  ETAPAS_NCPP,
  AUDIENCIAS_NCPP,
  PARTES_NCPP,
  DELITOS_PERU,
} from '@/features/plazos/services/motor-ncpp'

export type PaisCode = 'MX' | 'PE'

export interface ConfigPais {
  codigo: PaisCode
  nombre: string
  nombreCompleto: string
  codigoProcesal: string
  codigoProcesalAbreviado: string
  moneda: string
  simboloMoneda: string
  documentoIdentidad: string
  documentoAbogado: string
  terminologia: {
    expediente: string
    despacho: string
    fiscalia: string
    juzgado: string
    imputado: string
    victima: string
    ministerioPublico: string
    delito: string
    carpetaInvestigacion: string
    causaPenal: string
    audienciaInicial: string
    prisionPreventiva: string
  }
  etapas: { id: string; nombre: string; descripcion: string; orden: number }[]
  tiposAudiencia: readonly string[]
  tiposParte: readonly string[]
  delitosComunes: readonly string[]
  plazos: Record<string, PlazoConfig>
}

// ==========================================
// CONFIGURACIÓN MÉXICO
// ==========================================
export const CONFIG_MEXICO: ConfigPais = {
  codigo: 'MX',
  nombre: 'México',
  nombreCompleto: 'Estados Unidos Mexicanos',
  codigoProcesal: 'Código Nacional de Procedimientos Penales',
  codigoProcesalAbreviado: 'CNPP',
  moneda: 'MXN',
  simboloMoneda: '$',
  documentoIdentidad: 'CURP',
  documentoAbogado: 'Cédula Profesional',
  terminologia: {
    expediente: 'Expediente',
    despacho: 'Despacho',
    fiscalia: 'Fiscalía',
    juzgado: 'Juzgado',
    imputado: 'Imputado',
    victima: 'Víctima',
    ministerioPublico: 'Ministerio Público',
    delito: 'Delito',
    carpetaInvestigacion: 'Carpeta de Investigación',
    causaPenal: 'Causa Penal',
    audienciaInicial: 'Audiencia de Control de Detención',
    prisionPreventiva: 'Prisión Preventiva',
  },
  etapas: [
    { id: 'investigacion_inicial', nombre: 'Investigación Inicial', descripcion: 'Ante el Ministerio Público', orden: 1 },
    { id: 'investigacion_complementaria', nombre: 'Investigación Complementaria', descripcion: 'Judicializada tras vinculación a proceso', orden: 2 },
    { id: 'intermedia', nombre: 'Etapa Intermedia', descripcion: 'Control de acusación', orden: 3 },
    { id: 'juicio_oral', nombre: 'Juicio Oral', descripcion: 'Ante Tribunal de Enjuiciamiento', orden: 4 },
    { id: 'ejecucion', nombre: 'Ejecución', descripcion: 'Ejecución de la sentencia', orden: 5 },
    { id: 'amparo', nombre: 'Amparo', descripcion: 'Juicio de amparo', orden: 6 },
    { id: 'apelacion', nombre: 'Apelación', descripcion: 'Recurso de apelación', orden: 7 },
  ],
  tiposAudiencia: [
    'control_detencion',
    'formulacion_imputacion',
    'vinculacion_proceso',
    'medidas_cautelares',
    'plazo_cierre_investigacion',
    'intermedia',
    'juicio_oral',
    'individualizacion_sancion',
    'ejecucion',
    'amparo',
    'apelacion',
    'otra',
  ] as const,
  tiposParte: [
    'imputado',
    'victima',
    'testigo',
    'perito',
    'ministerio_publico',
    'defensor',
    'asesor_juridico',
    'juez',
    'policia',
  ] as const,
  delitosComunes: [
    'Homicidio',
    'Homicidio calificado',
    'Feminicidio',
    'Secuestro',
    'Robo',
    'Robo con violencia',
    'Extorsión',
    'Fraude',
    'Abuso de confianza',
    'Violación',
    'Abuso sexual',
    'Lesiones',
    'Amenazas',
    'Despojo',
    'Narcotráfico',
    'Portación de arma de fuego',
    'Delincuencia organizada',
    'Operaciones con recursos de procedencia ilícita',
    'Trata de personas',
    'Violencia familiar',
    'Daño en propiedad ajena',
    'Ejercicio ilícito del servicio público',
  ] as const,
  plazos: PLAZOS_CNPP,
}

// ==========================================
// CONFIGURACIÓN PERÚ
// ==========================================
export const CONFIG_PERU: ConfigPais = {
  codigo: 'PE',
  nombre: 'Perú',
  nombreCompleto: 'República del Perú',
  codigoProcesal: 'Nuevo Código Procesal Penal',
  codigoProcesalAbreviado: 'NCPP',
  moneda: 'PEN',
  simboloMoneda: 'S/',
  documentoIdentidad: 'DNI',
  documentoAbogado: 'CAL / CIC (Colegio de Abogados)',
  terminologia: {
    expediente: 'Expediente',
    despacho: 'Estudio Jurídico',
    fiscalia: 'Fiscalía',
    juzgado: 'Juzgado de Investigación Preparatoria',
    imputado: 'Imputado',
    victima: 'Agraviado',
    ministerioPublico: 'Fiscal',
    delito: 'Delito',
    carpetaInvestigacion: 'Carpeta Fiscal',
    causaPenal: 'Expediente Judicial',
    audienciaInicial: 'Audiencia de Control de Identidad',
    prisionPreventiva: 'Prisión Preventiva',
  },
  etapas: [
    { id: 'diligencias_preliminares', nombre: 'Diligencias Preliminares', descripcion: 'Investigación inicial por el fiscal con apoyo policial', orden: 1 },
    { id: 'investigacion_preparatoria', nombre: 'Investigación Preparatoria', descripcion: 'Investigación formalizada ante el JIP', orden: 2 },
    { id: 'etapa_intermedia', nombre: 'Etapa Intermedia', descripcion: 'Control de acusación por el JIP', orden: 3 },
    { id: 'juzgamiento', nombre: 'Juzgamiento', descripcion: 'Juicio oral ante Juez Unipersonal o Colegiado', orden: 4 },
    { id: 'impugnacion', nombre: 'Impugnación', descripcion: 'Recursos ante Sala Superior o Corte Suprema', orden: 5 },
    { id: 'ejecucion', nombre: 'Ejecución', descripcion: 'Ejecución de sentencia', orden: 6 },
  ],
  tiposAudiencia: AUDIENCIAS_NCPP,
  tiposParte: PARTES_NCPP,
  delitosComunes: DELITOS_PERU,
  plazos: PLAZOS_NCPP,
}

// ==========================================
// REGISTRO DE PAÍSES
// ==========================================
const PAISES: Record<PaisCode, ConfigPais> = {
  MX: CONFIG_MEXICO,
  PE: CONFIG_PERU,
}

export function getConfigPais(pais: PaisCode): ConfigPais {
  return PAISES[pais]
}

export function getPaisesDisponibles(): { codigo: PaisCode; nombre: string }[] {
  return Object.values(PAISES).map((p) => ({ codigo: p.codigo, nombre: p.nombre }))
}

export function getEtapasPorPais(pais: PaisCode): ConfigPais['etapas'] {
  return PAISES[pais].etapas
}

export function getTiposAudienciaPorPais(pais: PaisCode): readonly string[] {
  return PAISES[pais].tiposAudiencia
}

export function getTiposPartePorPais(pais: PaisCode): readonly string[] {
  return PAISES[pais].tiposParte
}

export function getPlazosPorPais(pais: PaisCode): Record<string, PlazoConfig> {
  return PAISES[pais].plazos
}

export function getTerminologia(pais: PaisCode): ConfigPais['terminologia'] {
  return PAISES[pais].terminologia
}
