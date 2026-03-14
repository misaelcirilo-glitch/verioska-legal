// ============================================
// Generador de Estrategias de Interrogatorio
// Técnicas de litigación oral para MX (CNPP) y PE (NCPP)
// ============================================

export interface PreguntaInterrogatorio {
  orden: number
  pregunta: string
  tipoPregunta: 'abierta' | 'cerrada' | 'sugestiva' | 'de_control' | 'de_transicion'
  proposito: string
  nota?: string
}

export interface PlanInterrogatorio {
  tipo: 'examen_directo' | 'contraexamen' | 'reexamen'
  objetivo: string
  tecnica: string
  tecnicaDescripcion: string
  preguntas: PreguntaInterrogatorio[]
  recomendaciones: string[]
  fundamentoLegal: string
}

interface ContextoInterrogatorio {
  pais: 'MX' | 'PE'
  tipo: 'examen_directo' | 'contraexamen' | 'reexamen'
  tipoParte: string          // testigo, perito, víctima, imputado, etc.
  nombreParte: string
  delito: string
  etapaProcesal: string
  hechosClave: string[]
  contradicciones?: { tema: string; descripcion: string }[]
  declaracionesPrevias?: string[]
}

// ============================================
// TÉCNICAS DE INTERROGATORIO
// ============================================
interface TecnicaLitigacion {
  nombre: string
  descripcion: string
  aplicaA: ('examen_directo' | 'contraexamen' | 'reexamen')[]
}

const TECNICAS: TecnicaLitigacion[] = [
  {
    nombre: 'Primacía y Recencia',
    descripcion: 'Colocar los puntos más importantes al inicio y al final del interrogatorio. El primer y último punto son los que más recuerda el juzgador.',
    aplicaA: ['examen_directo', 'contraexamen'],
  },
  {
    nombre: 'Looping (Eco)',
    descripcion: 'Incorporar la respuesta del testigo en la siguiente pregunta para reforzar el punto ante el tribunal. Ej: "Usted dijo que era de noche... ¿a esa hora de la noche había iluminación?"',
    aplicaA: ['examen_directo', 'contraexamen'],
  },
  {
    nombre: 'Capítulos temáticos',
    descripcion: 'Organizar el interrogatorio por temas (lugar, tiempo, personas, acciones) para dar estructura lógica al relato.',
    aplicaA: ['examen_directo'],
  },
  {
    nombre: 'Preguntas de control',
    descripcion: 'En contraexamen, hacer preguntas cuya respuesta ya se conoce para controlar al testigo. Nunca preguntar "¿por qué?" al testigo adverso.',
    aplicaA: ['contraexamen'],
  },
  {
    nombre: 'Impeachment (Confrontación)',
    descripcion: 'Confrontar al testigo con sus declaraciones previas inconsistentes. Pasos: comprometer → acreditar declaración previa → confrontar.',
    aplicaA: ['contraexamen'],
  },
  {
    nombre: 'Cruz de Wigmore',
    descripcion: 'Descomponer los hechos en proposiciones individuales y asignar cada una a una fuente probatoria para construir el caso completo.',
    aplicaA: ['examen_directo', 'contraexamen'],
  },
]

// ============================================
// GENERADOR DE PREGUNTAS
// ============================================

function generarExamenDirecto(ctx: ContextoInterrogatorio): PlanInterrogatorio {
  const preguntas: PreguntaInterrogatorio[] = []
  const esPeru = ctx.pais === 'PE'
  let orden = 1

  // Bloque 1: Acreditación del testigo
  preguntas.push({
    orden: orden++,
    pregunta: `¿Puede decirnos su nombre completo y a qué se dedica?`,
    tipoPregunta: 'abierta',
    proposito: 'Acreditación: establecer identidad y credibilidad del testigo',
  })

  if (ctx.tipoParte === 'perito') {
    preguntas.push({
      orden: orden++,
      pregunta: `¿Cuál es su especialidad profesional y cuántos años de experiencia tiene en el área?`,
      tipoPregunta: 'abierta',
      proposito: 'Acreditación de pericia: establecer competencia y experiencia',
    })
    preguntas.push({
      orden: orden++,
      pregunta: `¿Qué metodología utilizó para realizar su dictamen en este caso?`,
      tipoPregunta: 'abierta',
      proposito: 'Establecer rigor metodológico del peritaje',
    })
  }

  // Bloque 2: Contexto temporal y espacial
  preguntas.push({
    orden: orden++,
    pregunta: `¿Recuerda usted qué sucedió el día de los hechos? Cuéntenos.`,
    tipoPregunta: 'abierta',
    proposito: 'Narrativa libre: permitir al testigo relatar su versión sin sugestión',
  })
  preguntas.push({
    orden: orden++,
    pregunta: `¿Dónde se encontraba usted cuando ocurrieron estos hechos?`,
    tipoPregunta: 'abierta',
    proposito: 'Ubicación: establecer presencia y capacidad de percepción',
  })
  preguntas.push({
    orden: orden++,
    pregunta: `¿Aproximadamente a qué hora sucedió esto?`,
    tipoPregunta: 'abierta',
    proposito: 'Temporalidad: anclar los hechos en un marco temporal',
  })

  // Bloque 3: Hechos clave del caso
  for (const hecho of ctx.hechosClave.slice(0, 4)) {
    preguntas.push({
      orden: orden++,
      pregunta: `Respecto a "${hecho}", ¿puede describir con detalle lo que usted observó o percibió?`,
      tipoPregunta: 'abierta',
      proposito: `Desarrollo del hecho clave: ${hecho}`,
    })
  }

  // Bloque 4: Percepción sensorial
  preguntas.push({
    orden: orden++,
    pregunta: `¿Las condiciones de visibilidad le permitían ver claramente lo que ocurría?`,
    tipoPregunta: 'cerrada',
    proposito: 'Establecer calidad de la percepción visual',
  })

  // Bloque 5: Cierre con punto fuerte
  preguntas.push({
    orden: orden++,
    pregunta: `¿Hay algo adicional que considere importante que este tribunal conozca?`,
    tipoPregunta: 'abierta',
    proposito: 'Cierre: permitir reforzar el punto más importante (técnica recencia)',
  })

  return {
    tipo: 'examen_directo',
    objetivo: `Establecer los hechos favorables a través del testimonio de ${ctx.nombreParte} (${ctx.tipoParte})`,
    tecnica: 'Capítulos temáticos + Primacía y Recencia',
    tecnicaDescripcion: 'Organizar el interrogatorio por temas (acreditación → contexto → hechos clave → cierre), colocando los puntos más importantes al inicio y al final.',
    preguntas,
    recomendaciones: [
      'Use preguntas abiertas (¿qué?, ¿cómo?, ¿cuándo?, ¿dónde?) para que el testigo narre libremente.',
      'No sugiera respuestas al testigo propio - está prohibido en examen directo.',
      'Mantenga contacto visual con el testigo pero observe al tribunal para verificar comprensión.',
      esPeru
        ? 'Fundamento: Art. 375.3 NCPP - El examen directo se realiza con preguntas abiertas.'
        : 'Fundamento: Art. 372 CNPP - El examen directo no permite preguntas sugestivas.',
    ],
    fundamentoLegal: esPeru ? 'Art. 375-378 NCPP' : 'Art. 371-376 CNPP',
  }
}

function generarContraexamen(ctx: ContextoInterrogatorio): PlanInterrogatorio {
  const preguntas: PreguntaInterrogatorio[] = []
  const esPeru = ctx.pais === 'PE'
  let orden = 1

  // Bloque 1: Establecer hechos de control (preguntas seguras)
  preguntas.push({
    orden: orden++,
    pregunta: `Señor(a) ${ctx.nombreParte}, usted declaró anteriormente ante ${esPeru ? 'la fiscalía' : 'el Ministerio Público'}, ¿correcto?`,
    tipoPregunta: 'de_control',
    proposito: 'Establecer existencia de declaración previa para posible confrontación',
  })
  preguntas.push({
    orden: orden++,
    pregunta: `Y en esa declaración usted firmó cada una de las hojas, ¿verdad?`,
    tipoPregunta: 'de_control',
    proposito: 'Acreditar la declaración previa como propia del testigo',
  })

  // Bloque 2: Atacar percepción
  preguntas.push({
    orden: orden++,
    pregunta: `Los hechos ocurrieron de noche, ¿no es así?`,
    tipoPregunta: 'sugestiva',
    proposito: 'Cuestionar condiciones de percepción visual',
    nota: 'Adaptar según las circunstancias reales del caso',
  })
  preguntas.push({
    orden: orden++,
    pregunta: `¿A qué distancia se encontraba usted del lugar exacto de los hechos?`,
    tipoPregunta: 'cerrada',
    proposito: 'Establecer distancia para cuestionar capacidad de percepción',
  })

  // Bloque 3: Explotar contradicciones (si las hay)
  if (ctx.contradicciones && ctx.contradicciones.length > 0) {
    for (const contradiccion of ctx.contradicciones.slice(0, 3)) {
      // Técnica de Impeachment: comprometer → acreditar → confrontar
      preguntas.push({
        orden: orden++,
        pregunta: `Respecto a ${contradiccion.tema}, ¿usted mantiene lo que acaba de declarar aquí en juicio?`,
        tipoPregunta: 'de_control',
        proposito: `IMPEACHMENT Paso 1 (Comprometer): Fijar la versión actual sobre ${contradiccion.tema}`,
        nota: 'Esperar respuesta afirmativa antes de continuar',
      })
      preguntas.push({
        orden: orden++,
        pregunta: `¿Recuerda que el [fecha] usted declaró ante ${esPeru ? 'la fiscalía' : 'el MP'} sobre estos mismos hechos?`,
        tipoPregunta: 'de_control',
        proposito: 'IMPEACHMENT Paso 2 (Acreditar): Establecer la declaración previa',
      })
      preguntas.push({
        orden: orden++,
        pregunta: `Le voy a leer lo que usted declaró: "${contradiccion.descripcion}". ¿Eso fue lo que declaró?`,
        tipoPregunta: 'de_control',
        proposito: `IMPEACHMENT Paso 3 (Confrontar): Evidenciar la contradicción sobre ${contradiccion.tema}`,
        nota: 'Leer textualmente de la declaración previa. No pedir explicación.',
      })
    }
  }

  // Bloque 4: Interés o sesgo del testigo
  preguntas.push({
    orden: orden++,
    pregunta: `¿Usted tiene alguna relación personal con ${ctx.tipoParte === 'victima' ? 'el imputado' : 'la parte denunciante'}?`,
    tipoPregunta: 'cerrada',
    proposito: 'Explorar posible sesgo o interés en el resultado del proceso',
  })

  // Bloque 5: Cierre contundente
  preguntas.push({
    orden: orden++,
    pregunta: `Entonces, para ser claros: usted no puede afirmar con certeza [punto débil del testigo], ¿correcto?`,
    tipoPregunta: 'sugestiva',
    proposito: 'Cierre: terminar con el punto más fuerte para la defensa (técnica recencia)',
    nota: 'Adaptar con el punto débil específico identificado en el análisis',
  })

  return {
    tipo: 'contraexamen',
    objetivo: `Desacreditar o limitar el testimonio de ${ctx.nombreParte} (${ctx.tipoParte}) - testigo de cargo`,
    tecnica: ctx.contradicciones && ctx.contradicciones.length > 0
      ? 'Impeachment + Preguntas de Control'
      : 'Preguntas de Control + Primacía y Recencia',
    tecnicaDescripcion: ctx.contradicciones && ctx.contradicciones.length > 0
      ? 'Utilizar la técnica de impeachment (comprometer → acreditar → confrontar) para evidenciar contradicciones. Todas las preguntas son cerradas o sugestivas para mantener control del testigo.'
      : 'Usar preguntas cerradas y sugestivas para controlar al testigo adverso. No permitir narrativas largas. Atacar percepción y credibilidad.',
    preguntas,
    recomendaciones: [
      'NUNCA haga preguntas abiertas al testigo adverso. Use solo cerradas y sugestivas.',
      'NUNCA pregunte "¿por qué?" - le da al testigo oportunidad de explicar.',
      'Tenga la declaración previa a la mano para confrontar si niega.',
      'Si obtiene la respuesta que necesita, PARE. No insista.',
      'Mantenga la calma. El tono agresivo genera simpatía hacia el testigo.',
      esPeru
        ? 'Fundamento: Art. 378.8 NCPP - En contraexamen se permiten preguntas sugestivas.'
        : 'Fundamento: Art. 373 CNPP - En contrainterrogatorio se permiten preguntas sugestivas.',
    ],
    fundamentoLegal: esPeru ? 'Art. 378.8-9 NCPP' : 'Art. 373 CNPP',
  }
}

function generarReexamen(ctx: ContextoInterrogatorio): PlanInterrogatorio {
  const preguntas: PreguntaInterrogatorio[] = []
  const esPeru = ctx.pais === 'PE'
  let orden = 1

  preguntas.push({
    orden: orden++,
    pregunta: `Hace un momento la parte contraria le preguntó sobre [tema del contraexamen]. ¿Puede explicar las circunstancias completas de esa situación?`,
    tipoPregunta: 'abierta',
    proposito: 'Rehabilitar al testigo: permitir explicar el contexto completo que el contraexamen limitó',
    nota: 'Solo re-examinar sobre temas que surgieron en el contraexamen',
  })
  preguntas.push({
    orden: orden++,
    pregunta: `¿Existe alguna razón por la cual su declaración de hoy pueda diferir en detalles menores de su declaración previa?`,
    tipoPregunta: 'abierta',
    proposito: 'Explicar discrepancias menores (nervios, tiempo transcurrido, nivel de detalle pedido)',
  })
  preguntas.push({
    orden: orden++,
    pregunta: `A pesar de esos detalles, ¿usted mantiene firme lo esencial de lo que declaró sobre [hecho principal]?`,
    tipoPregunta: 'cerrada',
    proposito: 'Reafirmar la versión central del testigo después de la rehabilitación',
  })

  return {
    tipo: 'reexamen',
    objetivo: `Rehabilitar el testimonio de ${ctx.nombreParte} después del contraexamen`,
    tecnica: 'Rehabilitación focalizada',
    tecnicaDescripcion: 'Abordar únicamente los puntos que fueron dañados en el contraexamen. Permitir al testigo explicar el contexto. No repetir todo el examen directo.',
    preguntas,
    recomendaciones: [
      'Solo re-examine sobre temas que surgieron en el contraexamen.',
      'Use preguntas abiertas para permitir la explicación completa.',
      'Sea breve: el reexamen largo diluye el impacto.',
      esPeru
        ? 'Fundamento: Art. 378.9 NCPP - El re-examen se limita a temas del contraexamen.'
        : 'Fundamento: Art. 374 CNPP - El redirect se limita a temas nuevos del contrainterrogatorio.',
    ],
    fundamentoLegal: esPeru ? 'Art. 378.9 NCPP' : 'Art. 374 CNPP',
  }
}

export function generarPlanInterrogatorio(ctx: ContextoInterrogatorio): PlanInterrogatorio {
  switch (ctx.tipo) {
    case 'examen_directo':
      return generarExamenDirecto(ctx)
    case 'contraexamen':
      return generarContraexamen(ctx)
    case 'reexamen':
      return generarReexamen(ctx)
    default:
      return generarExamenDirecto(ctx)
  }
}

export function obtenerTecnicas(tipo?: 'examen_directo' | 'contraexamen' | 'reexamen'): TecnicaLitigacion[] {
  if (!tipo) return TECNICAS
  return TECNICAS.filter(t => t.aplicaA.includes(tipo))
}
