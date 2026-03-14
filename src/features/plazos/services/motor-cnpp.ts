export interface PlazoConfig {
  tipo: string
  nombre: string
  fundamentoLegal: string
  horas?: number
  dias?: number
  diasHabiles: boolean
  descripcion: string
}

export const PLAZOS_CNPP: Record<string, PlazoConfig> = {
  retencion_mp_48h: {
    tipo: 'retencion_mp_48h',
    nombre: 'Retención ante MP',
    fundamentoLegal: 'Art. 16 CPEUM',
    horas: 48,
    diasHabiles: false,
    descripcion: 'Plazo máximo de retención ante el Ministerio Público',
  },
  retencion_mp_96h: {
    tipo: 'retencion_mp_96h',
    nombre: 'Retención ante MP (duplicidad)',
    fundamentoLegal: 'Art. 16 CPEUM',
    horas: 96,
    diasHabiles: false,
    descripcion: 'Plazo máximo con duplicidad de término (delincuencia organizada)',
  },
  termino_constitucional_72h: {
    tipo: 'termino_constitucional_72h',
    nombre: 'Término constitucional 72h',
    fundamentoLegal: 'Art. 19 CPEUM, Art. 313 CNPP',
    horas: 72,
    diasHabiles: false,
    descripcion: 'Plazo para resolver situación jurídica (vinculación a proceso)',
  },
  termino_constitucional_144h: {
    tipo: 'termino_constitucional_144h',
    nombre: 'Término constitucional 144h (duplicidad)',
    fundamentoLegal: 'Art. 19 CPEUM, Art. 313 CNPP',
    horas: 144,
    diasHabiles: false,
    descripcion: 'Plazo con duplicidad para resolver situación jurídica',
  },
  investigacion_complementaria_2m: {
    tipo: 'investigacion_complementaria_2m',
    nombre: 'Investigación complementaria (2 meses)',
    fundamentoLegal: 'Art. 321 CNPP',
    dias: 60,
    diasHabiles: false,
    descripcion: 'Plazo de investigación complementaria - pena máx. hasta 2 años',
  },
  investigacion_complementaria_6m: {
    tipo: 'investigacion_complementaria_6m',
    nombre: 'Investigación complementaria (6 meses)',
    fundamentoLegal: 'Art. 321 CNPP',
    dias: 180,
    diasHabiles: false,
    descripcion: 'Plazo de investigación complementaria - pena máx. mayor a 2 años',
  },
  apelacion_3d: {
    tipo: 'apelacion_3d',
    nombre: 'Recurso de apelación',
    fundamentoLegal: 'Art. 471 CNPP',
    dias: 3,
    diasHabiles: true,
    descripcion: 'Plazo para interponer recurso de apelación',
  },
  amparo_indirecto_15d: {
    tipo: 'amparo_indirecto_15d',
    nombre: 'Amparo indirecto',
    fundamentoLegal: 'Art. 17 Ley de Amparo',
    dias: 15,
    diasHabiles: true,
    descripcion: 'Plazo para presentar demanda de amparo indirecto',
  },
  amparo_directo_15d: {
    tipo: 'amparo_directo_15d',
    nombre: 'Amparo directo',
    fundamentoLegal: 'Art. 176 Ley de Amparo',
    dias: 15,
    diasHabiles: true,
    descripcion: 'Plazo para presentar demanda de amparo directo',
  },
  recurso_revocacion_2d: {
    tipo: 'recurso_revocacion_2d',
    nombre: 'Recurso de revocación',
    fundamentoLegal: 'Art. 465 CNPP',
    dias: 2,
    diasHabiles: true,
    descripcion: 'Plazo para interponer recurso de revocación',
  },
}

export function calcularFechaLimite(fechaInicio: Date, config: PlazoConfig): Date {
  const fecha = new Date(fechaInicio)

  if (config.horas) {
    fecha.setTime(fecha.getTime() + config.horas * 60 * 60 * 1000)
    return fecha
  }

  if (config.dias) {
    if (config.diasHabiles) {
      let diasRestantes = config.dias
      while (diasRestantes > 0) {
        fecha.setDate(fecha.getDate() + 1)
        const diaSemana = fecha.getDay()
        if (diaSemana !== 0 && diaSemana !== 6) {
          diasRestantes--
        }
      }
      return fecha
    }
    fecha.setDate(fecha.getDate() + config.dias)
    return fecha
  }

  return fecha
}

export function calcularEstadoPlazo(
  fechaLimite: Date,
  horasODias: number,
  esHoras: boolean
): 'activo' | 'proximo' | 'critico' | 'vencido' {
  const ahora = new Date()
  const diff = fechaLimite.getTime() - ahora.getTime()

  if (diff <= 0) return 'vencido'

  const totalMs = esHoras
    ? horasODias * 60 * 60 * 1000
    : horasODias * 24 * 60 * 60 * 1000

  const porcentajeRestante = diff / totalMs

  if (porcentajeRestante <= 0.1) return 'critico'
  if (porcentajeRestante <= 0.25) return 'proximo'
  return 'activo'
}

export function tiempoRestante(fechaLimite: Date): string {
  const ahora = new Date()
  const diff = fechaLimite.getTime() - ahora.getTime()

  if (diff <= 0) return 'VENCIDO'

  const horas = Math.floor(diff / (1000 * 60 * 60))
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (horas >= 48) {
    const dias = Math.floor(horas / 24)
    const horasRestantes = horas % 24
    return `${dias}d ${horasRestantes}h`
  }

  return `${horas}h ${minutos}min`
}

export function generarPlazosIniciales(
  fechaDetencion: Date,
  duplicidadTermino: boolean
): { tipo: string; config: PlazoConfig; fechaInicio: Date; fechaLimite: Date }[] {
  const plazos = []

  const retencionKey = duplicidadTermino ? 'retencion_mp_96h' : 'retencion_mp_48h'
  const retencionConfig = PLAZOS_CNPP[retencionKey]
  plazos.push({
    tipo: retencionKey,
    config: retencionConfig,
    fechaInicio: fechaDetencion,
    fechaLimite: calcularFechaLimite(fechaDetencion, retencionConfig),
  })

  const terminoKey = duplicidadTermino
    ? 'termino_constitucional_144h'
    : 'termino_constitucional_72h'
  const terminoConfig = PLAZOS_CNPP[terminoKey]
  const inicioTermino = calcularFechaLimite(fechaDetencion, retencionConfig)
  plazos.push({
    tipo: terminoKey,
    config: terminoConfig,
    fechaInicio: inicioTermino,
    fechaLimite: calcularFechaLimite(inicioTermino, terminoConfig),
  })

  return plazos
}
