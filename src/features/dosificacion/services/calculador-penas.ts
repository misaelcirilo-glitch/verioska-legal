// ============================================
// Calculador de Dosificación de Pena - México y Perú
// Rangos de pena según Código Penal Federal (MX) y Código Penal (PE)
// ============================================

export interface RangoPena {
  delito: string
  pais: 'MX' | 'PE'
  codigoPenal: string
  articulo: string
  penaMinimaMeses: number
  penaMaximaMeses: number
  multaMinUMA?: number   // MX: UMAs
  multaMaxUMA?: number
  multaDiasMin?: number  // PE: días-multa
  multaDiasMax?: number
  admiteSustitucion: boolean    // Pena alternativa
  admiteAbreviado: boolean      // Procedimiento abreviado / terminación anticipada
  admiteAcuerdoReparatorio: boolean
  notas: string
}

export interface FactorDosificacion {
  factor: string
  tipo: 'agravante' | 'atenuante'
  fundamento: string
  porcentaje: number // % de incremento o reducción
}

export interface ResultadoDosificacion {
  delito: string
  pais: 'MX' | 'PE'
  penaBase: { minMeses: number; maxMeses: number }
  agravantes: FactorDosificacion[]
  atenuantes: FactorDosificacion[]
  penaAjustada: { minMeses: number; maxMeses: number }
  penaSugeridaMeses: number
  conAbreviado?: { minMeses: number; maxMeses: number }
  multaEstimada?: string
  sustitucionPosible: boolean
  acuerdoReparatorioPosible: boolean
  fundamentoLegal: string
  notas: string[]
}

// ============================================
// CATÁLOGO DE DELITOS - MÉXICO (CPF)
// ============================================
const DELITOS_MX: RangoPena[] = [
  {
    delito: 'Homicidio doloso',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 307',
    penaMinimaMeses: 96, penaMaximaMeses: 240, // 8-20 años
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Prisión preventiva oficiosa. Calificado: 20-50 años.',
  },
  {
    delito: 'Homicidio culposo',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 307 párr. 2',
    penaMinimaMeses: 24, penaMaximaMeses: 60, // 2-5 años
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Admite acuerdo reparatorio por ser culposo.',
  },
  {
    delito: 'Robo simple',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 370',
    penaMinimaMeses: 36, penaMaximaMeses: 120, // 3-10 años
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Acuerdo reparatorio si no hay violencia.',
  },
  {
    delito: 'Robo con violencia',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 372',
    penaMinimaMeses: 60, penaMaximaMeses: 180, // 5-15 años
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'No admite acuerdo reparatorio por existir violencia.',
  },
  {
    delito: 'Fraude',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 386',
    penaMinimaMeses: 6, penaMaximaMeses: 144, // 6m-12 años (según monto)
    multaMinUMA: 100, multaMaxUMA: 500,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Pena varía según monto defraudado.',
  },
  {
    delito: 'Abuso de confianza',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 382',
    penaMinimaMeses: 6, penaMaximaMeses: 144,
    multaMinUMA: 100, multaMaxUMA: 300,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Patrimonial sin violencia.',
  },
  {
    delito: 'Lesiones dolosas',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 289-292',
    penaMinimaMeses: 3, penaMaximaMeses: 96, // según gravedad
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Pena varía según si ponen en peligro la vida o tardan en sanar.',
  },
  {
    delito: 'Secuestro',
    pais: 'MX', codigoPenal: 'Ley General Secuestro', articulo: 'Art. 9',
    penaMinimaMeses: 480, penaMaximaMeses: 840, // 40-70 años
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Prisión preventiva oficiosa. No admite beneficios preliberacionales.',
  },
  {
    delito: 'Narcomenudeo',
    pais: 'MX', codigoPenal: 'Ley General de Salud', articulo: 'Art. 474-476',
    penaMinimaMeses: 48, penaMaximaMeses: 96, // 4-8 años
    multaMinUMA: 200, multaMaxUMA: 500,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Pena varía según tipo y cantidad de narcótico.',
  },
  {
    delito: 'Violencia familiar',
    pais: 'MX', codigoPenal: 'CPF', articulo: 'Art. 343 bis-quáter',
    penaMinimaMeses: 6, penaMaximaMeses: 48,
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'No admite acuerdo reparatorio por la naturaleza del delito.',
  },
  {
    delito: 'Portación de arma de fuego sin licencia',
    pais: 'MX', codigoPenal: 'Ley Federal de Armas', articulo: 'Art. 81-83',
    penaMinimaMeses: 36, penaMaximaMeses: 180,
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Pena varía según tipo de arma (uso exclusivo del Ejército: mayor).',
  },
  {
    delito: 'Delincuencia organizada',
    pais: 'MX', codigoPenal: 'Ley Federal contra Delincuencia Organizada', articulo: 'Art. 2',
    penaMinimaMeses: 240, penaMaximaMeses: 480, // 20-40 años
    multaMinUMA: 0, multaMaxUMA: 0,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Prisión preventiva oficiosa. Régimen especial de investigación.',
  },
]

// ============================================
// CATÁLOGO DE DELITOS - PERÚ (CP)
// ============================================
const DELITOS_PE: RangoPena[] = [
  {
    delito: 'Homicidio simple',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 106',
    penaMinimaMeses: 72, penaMaximaMeses: 240, // 6-20 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Homicidio calificado (Art. 108): 15-35 años.',
  },
  {
    delito: 'Homicidio calificado / Asesinato',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 108',
    penaMinimaMeses: 180, penaMaximaMeses: 420, // 15-35 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Por ferocidad, lucro, placer, alevosía, crueldad, etc.',
  },
  {
    delito: 'Robo agravado',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 189',
    penaMinimaMeses: 144, penaMaximaMeses: 240, // 12-20 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Con arma, en noche, con pluralidad de agentes, etc.',
  },
  {
    delito: 'Hurto agravado',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 186',
    penaMinimaMeses: 36, penaMaximaMeses: 72, // 3-6 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Hurto simple (Art. 185): 1-3 años.',
  },
  {
    delito: 'Estafa',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 196',
    penaMinimaMeses: 12, penaMaximaMeses: 72, // 1-6 años
    multaDiasMin: 60, multaDiasMax: 120,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Agravada (Art. 196-A): 4-8 años.',
  },
  {
    delito: 'Tráfico ilícito de drogas',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 296',
    penaMinimaMeses: 96, penaMaximaMeses: 180, // 8-15 años
    multaDiasMin: 180, multaDiasMax: 365,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Forma agravada (Art. 297): 15-25 años. Microcomercialización (Art. 298): 3-7 años.',
  },
  {
    delito: 'Violación sexual',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 170',
    penaMinimaMeses: 72, penaMaximaMeses: 96, // 6-8 años (tipo base)
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Menor de edad (Art. 173): cadena perpetua en menores de 10 años.',
  },
  {
    delito: 'Lesiones graves',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 121',
    penaMinimaMeses: 48, penaMaximaMeses: 96, // 4-8 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: false, admiteAbreviado: true, admiteAcuerdoReparatorio: false,
    notas: 'Si resulta muerte: 8-15 años.',
  },
  {
    delito: 'Extorsión',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 200',
    penaMinimaMeses: 120, penaMaximaMeses: 180, // 10-15 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Con muerte o lesiones graves: 20-30 años.',
  },
  {
    delito: 'Lavado de activos',
    pais: 'PE', codigoPenal: 'D.Leg. 1106', articulo: 'Art. 1-3',
    penaMinimaMeses: 96, penaMaximaMeses: 180, // 8-15 años
    multaDiasMin: 120, multaDiasMax: 350,
    admiteSustitucion: false, admiteAbreviado: false, admiteAcuerdoReparatorio: false,
    notas: 'Forma agravada: 10-20 años.',
  },
  {
    delito: 'Usurpación',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 202',
    penaMinimaMeses: 24, penaMaximaMeses: 60, // 2-5 años
    multaDiasMin: 0, multaDiasMax: 0,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Agravada con violencia: 4-8 años.',
  },
  {
    delito: 'Conducción en estado de ebriedad',
    pais: 'PE', codigoPenal: 'CP', articulo: 'Art. 274',
    penaMinimaMeses: 6, penaMaximaMeses: 24,
    multaDiasMin: 52, multaDiasMax: 100,
    admiteSustitucion: true, admiteAbreviado: true, admiteAcuerdoReparatorio: true,
    notas: 'Principio de oportunidad aplicable si no hay lesiones.',
  },
]

// ============================================
// FACTORES COMUNES
// ============================================
export const AGRAVANTES_MX: FactorDosificacion[] = [
  { factor: 'Reincidencia', tipo: 'agravante', fundamento: 'Art. 65 CPF', porcentaje: 33 },
  { factor: 'Ventaja (superioridad física/numérica)', tipo: 'agravante', fundamento: 'Art. 316 CPF', porcentaje: 25 },
  { factor: 'Premeditación', tipo: 'agravante', fundamento: 'Art. 315 CPF', porcentaje: 50 },
  { factor: 'Alevosía', tipo: 'agravante', fundamento: 'Art. 318 CPF', porcentaje: 50 },
  { factor: 'En agravio de menor de edad', tipo: 'agravante', fundamento: 'Art. 24 bis CPF', porcentaje: 25 },
  { factor: 'Servidor público', tipo: 'agravante', fundamento: 'Art. 213 bis CPF', porcentaje: 50 },
  { factor: 'Con arma de fuego', tipo: 'agravante', fundamento: 'Art. 298 CPF', porcentaje: 33 },
]

export const ATENUANTES_MX: FactorDosificacion[] = [
  { factor: 'Confesión ante MP', tipo: 'atenuante', fundamento: 'Art. 71 CNPP', porcentaje: 20 },
  { factor: 'Procedimiento abreviado', tipo: 'atenuante', fundamento: 'Art. 202 CNPP', porcentaje: 33 },
  { factor: 'Reparación del daño', tipo: 'atenuante', fundamento: 'Art. 73 CPF', porcentaje: 15 },
  { factor: 'Primodelincuente', tipo: 'atenuante', fundamento: 'Art. 52 CPF', porcentaje: 10 },
  { factor: 'Buena conducta previa', tipo: 'atenuante', fundamento: 'Art. 52 CPF', porcentaje: 10 },
]

export const AGRAVANTES_PE: FactorDosificacion[] = [
  { factor: 'Reincidencia', tipo: 'agravante', fundamento: 'Art. 46-B CP', porcentaje: 50 },
  { factor: 'Habitualidad', tipo: 'agravante', fundamento: 'Art. 46-C CP', porcentaje: 50 },
  { factor: 'Pluralidad de agentes', tipo: 'agravante', fundamento: 'Art. 46.2.a CP', porcentaje: 25 },
  { factor: 'Abuso de cargo o posición', tipo: 'agravante', fundamento: 'Art. 46.2.h CP', porcentaje: 33 },
  { factor: 'En agravio de menor de edad', tipo: 'agravante', fundamento: 'Art. 46.2.d CP', porcentaje: 33 },
  { factor: 'Con crueldad', tipo: 'agravante', fundamento: 'Art. 46.2.c CP', porcentaje: 25 },
  { factor: 'Nocturnidad o despoblado', tipo: 'agravante', fundamento: 'Art. 46.2.f CP', porcentaje: 15 },
]

export const ATENUANTES_PE: FactorDosificacion[] = [
  { factor: 'Confesión sincera', tipo: 'atenuante', fundamento: 'Art. 161 NCPP', porcentaje: 33 },
  { factor: 'Terminación anticipada', tipo: 'atenuante', fundamento: 'Art. 471 NCPP', porcentaje: 16 },
  { factor: 'Responsabilidad restringida (18-21 años)', tipo: 'atenuante', fundamento: 'Art. 22 CP', porcentaje: 33 },
  { factor: 'Tentativa', tipo: 'atenuante', fundamento: 'Art. 16 CP', porcentaje: 33 },
  { factor: 'Reparación espontánea del daño', tipo: 'atenuante', fundamento: 'Art. 46.1.f CP', porcentaje: 15 },
  { factor: 'Carencia de antecedentes penales', tipo: 'atenuante', fundamento: 'Art. 46.1.a CP', porcentaje: 10 },
]

// ============================================
// FUNCIONES
// ============================================

const TODOS_DELITOS = [...DELITOS_MX, ...DELITOS_PE]

export function buscarDelitos(pais: 'MX' | 'PE', consulta?: string): RangoPena[] {
  let delitos = TODOS_DELITOS.filter(d => d.pais === pais)
  if (consulta) {
    const q = consulta.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    delitos = delitos.filter(d =>
      d.delito.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
      d.notas.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
    )
  }
  return delitos
}

export function obtenerFactores(pais: 'MX' | 'PE'): {
  agravantes: FactorDosificacion[]
  atenuantes: FactorDosificacion[]
} {
  return pais === 'PE'
    ? { agravantes: AGRAVANTES_PE, atenuantes: ATENUANTES_PE }
    : { agravantes: AGRAVANTES_MX, atenuantes: ATENUANTES_MX }
}

export function calcularDosificacion(params: {
  delito: RangoPena
  agravantes: FactorDosificacion[]
  atenuantes: FactorDosificacion[]
}): ResultadoDosificacion {
  const { delito, agravantes, atenuantes } = params

  // Pena base
  let minMeses = delito.penaMinimaMeses
  let maxMeses = delito.penaMaximaMeses

  // Aplicar agravantes (incrementan la pena)
  const totalAgravante = agravantes.reduce((sum, a) => sum + a.porcentaje, 0)
  // Aplicar atenuantes (reducen la pena)
  const totalAtenuante = atenuantes.reduce((sum, a) => sum + a.porcentaje, 0)

  // Calcular pena ajustada
  const factorNeto = 1 + (totalAgravante / 100) - (totalAtenuante / 100)
  const ajusteMin = Math.max(1, Math.round(minMeses * factorNeto))
  const ajusteMax = Math.max(ajusteMin, Math.round(maxMeses * factorNeto))

  // Pena sugerida: punto medio del rango ajustado (tercio inferior si hay más atenuantes)
  let penaSugerida: number
  if (totalAtenuante > totalAgravante) {
    // Más atenuantes: tercio inferior
    penaSugerida = Math.round(ajusteMin + (ajusteMax - ajusteMin) / 3)
  } else if (totalAgravante > totalAtenuante) {
    // Más agravantes: tercio superior
    penaSugerida = Math.round(ajusteMin + (2 * (ajusteMax - ajusteMin)) / 3)
  } else {
    // Equilibrio: punto medio
    penaSugerida = Math.round((ajusteMin + ajusteMax) / 2)
  }

  // Cálculo con procedimiento abreviado
  const tieneAbreviado = agravantes.length === 0 || atenuantes.some(a =>
    a.factor.includes('abreviado') || a.factor.includes('anticipada')
  )

  const notas: string[] = []

  if (delito.admiteSustitucion && penaSugerida <= 48) {
    notas.push('La pena podría sustituirse por trabajo comunitario o multa (pena < 4 años).')
  }

  if (delito.admiteAcuerdoReparatorio) {
    notas.push('Este delito admite acuerdo reparatorio para extinguir la acción penal.')
  }

  if (agravantes.some(a => a.factor === 'Reincidencia')) {
    notas.push('La reincidencia impide beneficios preliberacionales en algunos casos.')
  }

  // Multa estimada
  let multaEstimada: string | undefined
  if (delito.pais === 'MX' && delito.multaMinUMA && delito.multaMaxUMA) {
    multaEstimada = `${delito.multaMinUMA} a ${delito.multaMaxUMA} UMAs`
  } else if (delito.pais === 'PE' && delito.multaDiasMin && delito.multaDiasMax) {
    multaEstimada = `${delito.multaDiasMin} a ${delito.multaDiasMax} días-multa`
  }

  return {
    delito: delito.delito,
    pais: delito.pais as 'MX' | 'PE',
    penaBase: { minMeses: delito.penaMinimaMeses, maxMeses: delito.penaMaximaMeses },
    agravantes,
    atenuantes,
    penaAjustada: { minMeses: ajusteMin, maxMeses: ajusteMax },
    penaSugeridaMeses: penaSugerida,
    conAbreviado: delito.admiteAbreviado ? {
      minMeses: Math.round(ajusteMin * (delito.pais === 'PE' ? 5 / 6 : 2 / 3)),
      maxMeses: Math.round(ajusteMax * (delito.pais === 'PE' ? 5 / 6 : 2 / 3)),
    } : undefined,
    multaEstimada,
    sustitucionPosible: delito.admiteSustitucion && penaSugerida <= 48,
    acuerdoReparatorioPosible: delito.admiteAcuerdoReparatorio,
    fundamentoLegal: `${delito.codigoPenal} ${delito.articulo}`,
    notas,
  }
}

export function formatearPena(meses: number): string {
  if (meses < 12) return `${meses} meses`
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  if (resto === 0) return `${anios} año${anios > 1 ? 's' : ''}`
  return `${anios} año${anios > 1 ? 's' : ''} ${resto} mes${resto > 1 ? 'es' : ''}`
}
