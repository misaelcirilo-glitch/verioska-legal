interface Declaracion {
  id: string
  contenido: string
  tipo: string
  parteNombre?: string
  parteApellidos?: string
  parteTipo?: string
}

export interface Contradiccion {
  declaracionAId: string
  declaracionBId: string
  descripcion: string
  tema: string
  severidad: 'critica' | 'alta' | 'media' | 'baja'
  utilidadDefensiva: string
}

// Temas clave en declaraciones penales
const TEMAS_CLAVE = [
  { patron: /hora|tiempo|momento|cuando|reloj/i, tema: 'Temporalidad', peso: 'alta' as const },
  { patron: /lugar|donde|calle|domicilio|ubicaci[oó]n|direcci[oó]n/i, tema: 'Ubicación', peso: 'alta' as const },
  { patron: /arma|pistola|cuchillo|navaja|objeto/i, tema: 'Arma/Instrumento', peso: 'critica' as const },
  { patron: /golpe|lesi[oó]n|herida|sangre|violencia/i, tema: 'Violencia/Lesiones', peso: 'alta' as const },
  { patron: /vi|observ[eé]|mir[eé]|presenci[eé]|not[eé]/i, tema: 'Percepción visual', peso: 'media' as const },
  { patron: /dinero|pago|cantidad|precio|billete/i, tema: 'Aspecto económico', peso: 'media' as const },
  { patron: /conoc[ií]|sab[ií]a|relaci[oó]n|amig/i, tema: 'Relación entre partes', peso: 'media' as const },
  { patron: /amenaz|oblig|forz[oó]|coacci[oó]n/i, tema: 'Coacción/Amenazas', peso: 'critica' as const },
  { patron: /cantidad|n[uú]mero|cuant|veces/i, tema: 'Cantidades', peso: 'media' as const },
  { patron: /vestimenta|ropa|camisa|pantal[oó]n|color/i, tema: 'Descripción física', peso: 'media' as const },
]

// Palabras de negación que pueden indicar contradicción
const NEGACIONES = /\b(no|nunca|jamas|ninguno|ninguna|nada|nadie|tampoco|ni)\b/gi

// Frases de afirmación
const AFIRMACIONES = /\b(sí|afirmo|confirmo|ciertamente|efectivamente|siempre|todos|todas)\b/gi

function extraerOraciones(texto: string): string[] {
  return texto
    .split(/[.;]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15)
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function calcularSimilitud(a: string, b: string): number {
  const wordsA = new Set(normalizarTexto(a).split(' ').filter(w => w.length > 3))
  const wordsB = new Set(normalizarTexto(b).split(' ').filter(w => w.length > 3))

  if (wordsA.size === 0 || wordsB.size === 0) return 0

  let intersection = 0
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++
  }

  return (2 * intersection) / (wordsA.size + wordsB.size)
}

function tieneNegacion(texto: string): boolean {
  return NEGACIONES.test(texto)
}

function tieneAfirmacion(texto: string): boolean {
  return AFIRMACIONES.test(texto)
}

export function detectarContradicciones(declaraciones: Declaracion[]): Contradiccion[] {
  const contradicciones: Contradiccion[] = []

  // Comparar cada par de declaraciones
  for (let i = 0; i < declaraciones.length; i++) {
    for (let j = i + 1; j < declaraciones.length; j++) {
      const declA = declaraciones[i]
      const declB = declaraciones[j]

      const oracionesA = extraerOraciones(declA.contenido)
      const oracionesB = extraerOraciones(declB.contenido)

      for (const oracA of oracionesA) {
        for (const oracB of oracionesB) {
          // Buscar oraciones que hablen del mismo tema
          const similitud = calcularSimilitud(oracA, oracB)

          if (similitud < 0.3) continue // No hablan del mismo tema

          // Verificar si hay contradicción (una afirma y otra niega)
          const aNiega = tieneNegacion(oracA)
          const bNiega = tieneNegacion(oracB)
          const aAfirma = tieneAfirmacion(oracA)
          const bAfirma = tieneAfirmacion(oracB)

          const hayContradiccion = (aNiega && bAfirma) || (aAfirma && bNiega) || (aNiega !== bNiega && similitud > 0.4)

          if (!hayContradiccion) continue

          // Determinar tema y severidad
          let tema = 'General'
          let severidad: Contradiccion['severidad'] = 'media'

          for (const { patron, tema: t, peso } of TEMAS_CLAVE) {
            if (patron.test(oracA) || patron.test(oracB)) {
              tema = t
              severidad = peso
              break
            }
          }

          const nombreA = declA.parteNombre
            ? `${declA.parteNombre} ${declA.parteApellidos || ''}`.trim()
            : `Declaración ${declA.tipo}`
          const nombreB = declB.parteNombre
            ? `${declB.parteNombre} ${declB.parteApellidos || ''}`.trim()
            : `Declaración ${declB.tipo}`

          contradicciones.push({
            declaracionAId: declA.id,
            declaracionBId: declB.id,
            descripcion: `${nombreA} dice: "${oracA.slice(0, 150)}..." vs ${nombreB} dice: "${oracB.slice(0, 150)}..."`,
            tema,
            severidad,
            utilidadDefensiva: generarUtilidadDefensiva(tema, severidad, declA.tipo, declB.tipo),
          })
        }
      }
    }
  }

  // Deduplicar por par de declaraciones
  const seen = new Set<string>()
  return contradicciones.filter(c => {
    const key = [c.declaracionAId, c.declaracionBId].sort().join('-')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function generarUtilidadDefensiva(
  tema: string, severidad: string, tipoA: string, tipoB: string
): string {
  const base = `Contradicción en ${tema.toLowerCase()}`

  if (tipoA === 'ministerial' && tipoB === 'judicial') {
    return `${base}. La declarante cambió su versión entre la etapa ministerial y la judicial. Útil para cuestionar credibilidad del testimonio (Art. 376 CNPP).`
  }
  if (severidad === 'critica') {
    return `${base}. Contradicción de alta relevancia que puede ser determinante para la teoría del caso. Considerar uso en alegatos de apertura/clausura.`
  }
  if (severidad === 'alta') {
    return `${base}. Puede utilizarse durante el contrainterrogatorio para evidenciar inconsistencias en el testimonio.`
  }
  return `${base}. Registrar para posible uso en la estrategia de defensa.`
}
